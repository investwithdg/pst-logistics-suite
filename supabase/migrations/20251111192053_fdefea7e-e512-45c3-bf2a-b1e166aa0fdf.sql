-- Phase 2: Order creation before payment

-- 1. Make customer_id nullable to support anonymous orders
ALTER TABLE orders 
ALTER COLUMN customer_id DROP NOT NULL;

-- 2. Add stripe_session_id to track payment sessions
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- 3. Add index for abandoned order cleanup
CREATE INDEX IF NOT EXISTS idx_orders_pending_payment 
ON orders(created_at, status) 
WHERE status = 'pending_payment';

-- 4. Add index for duplicate prevention
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session 
ON orders(stripe_session_id) 
WHERE stripe_session_id IS NOT NULL;

-- 5. Add index for email lookups (for future account association)
CREATE INDEX IF NOT EXISTS idx_orders_customer_email 
ON orders(customer_email) 
WHERE customer_id IS NULL;

-- 6. Add invoice_approved_manually flag to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS invoice_approved_manually BOOLEAN DEFAULT false;

-- 7. Create admin settings table for global app settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Only admins can manage settings"
ON admin_settings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default invoice approval setting
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('invoice_auto_approve', '{"enabled": false, "description": "Automatically approve invoices after delivery"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger to update updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();