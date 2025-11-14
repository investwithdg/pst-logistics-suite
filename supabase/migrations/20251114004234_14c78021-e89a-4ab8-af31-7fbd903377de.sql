-- Add HubSpot integration columns to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS hubspot_deal_id text,
ADD COLUMN IF NOT EXISTS hubspot_properties jsonb;

-- Create pricing audit table
CREATE TABLE IF NOT EXISTS pricing_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by uuid REFERENCES auth.users(id),
  old_values jsonb,
  new_values jsonb,
  changed_at timestamptz DEFAULT now()
);

-- Enable RLS on pricing_audit
ALTER TABLE pricing_audit ENABLE ROW LEVEL SECURITY;

-- Admin-only policy for pricing_audit
CREATE POLICY "Admins can view pricing audit"
  ON pricing_audit FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert pricing audit"
  ON pricing_audit FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create webhook logs table for monitoring
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_name text NOT NULL,
  direction text NOT NULL,
  payload jsonb,
  response jsonb,
  status text NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only policy for webhook_logs
CREATE POLICY "Admins can view webhook logs"
  ON webhook_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow system to insert webhook logs
CREATE POLICY "System can insert webhook logs"
  ON webhook_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create sync status tracking table
CREATE TABLE IF NOT EXISTS hubspot_sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  sync_type text NOT NULL,
  hubspot_deal_id text,
  sync_status text NOT NULL,
  error_message text,
  retry_count integer DEFAULT 0,
  last_attempt_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on hubspot_sync_status
ALTER TABLE hubspot_sync_status ENABLE ROW LEVEL SECURITY;

-- Policies for hubspot_sync_status
CREATE POLICY "Admins can view sync status"
  ON hubspot_sync_status FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage sync status"
  ON hubspot_sync_status FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);