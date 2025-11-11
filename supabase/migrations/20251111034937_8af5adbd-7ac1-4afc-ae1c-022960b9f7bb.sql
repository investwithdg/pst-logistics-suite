-- Create app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'dispatcher', 'driver', 'customer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles (users can read their own roles)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create webhook_config table
CREATE TABLE public.webhook_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_name TEXT UNIQUE NOT NULL,
  webhook_url TEXT,
  webhook_type TEXT NOT NULL CHECK (webhook_type IN ('edge-function', 'make-webhook')),
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on webhook_config
ALTER TABLE public.webhook_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhook_config (admin-only access)
CREATE POLICY "Only admins can view webhook config"
  ON public.webhook_config
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage webhook config"
  ON public.webhook_config
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_webhook_config_updated_at
  BEFORE UPDATE ON public.webhook_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed webhook_config with all 25 webhooks
INSERT INTO public.webhook_config (webhook_name, webhook_type, description) VALUES
-- Supabase Edge Functions (11 webhooks)
('calculate-quote', 'edge-function', 'Calculate delivery quote based on pricing rules'),
('track-order', 'edge-function', 'Public endpoint to track order by order number'),
('driver-status', 'edge-function', 'Update driver availability status'),
('driver-job-action', 'edge-function', 'Driver accepts or declines job assignment'),
('driver-location', 'edge-function', 'Update driver GPS location'),
('driver-earnings', 'edge-function', 'Fetch driver earnings and completed deliveries'),
('update-pricing', 'edge-function', 'Admin updates to pricing rules'),
('fetch-notifications', 'edge-function', 'Get notifications for user'),
('mark-notification-read', 'edge-function', 'Mark notification as read'),
('fetch-orders', 'edge-function', 'Fetch orders with role-based filters'),
('update-delivery-instructions', 'edge-function', 'Update order special instructions'),

-- Make.com Webhooks (14 webhooks)
('process-payment', 'make-webhook', 'Create HubSpot Contact/Deal, process Stripe payment, create order'),
('stripe-payment-success', 'make-webhook', 'Handle Stripe webhook - update HubSpot Deal, create order, notify dispatchers'),
('assign-driver', 'make-webhook', 'Assign driver to order - update HubSpot Deal, DB, notify driver & customer'),
('update-status', 'make-webhook', 'Update order status - sync HubSpot Deal stage, add timeline, notify'),
('submit-proof', 'make-webhook', 'Submit proof of delivery - update HubSpot, DB, complete order'),
('cancel-order', 'make-webhook', 'Cancel order - update HubSpot Deal, trigger refund if paid'),
('refund-order', 'make-webhook', 'Process Stripe refund - update HubSpot Deal, update DB'),
('reassign-driver', 'make-webhook', 'Reassign order to new driver - update HubSpot, notify both drivers'),
('user-management', 'make-webhook', 'Create/update/delete user - sync HubSpot Contact & Supabase'),
('generate-reports', 'make-webhook', 'Pull HubSpot + Supabase data, generate analytics report'),
('fetch-invoice', 'make-webhook', 'Generate invoice from HubSpot Deal + Stripe payment details'),
('contact-messaging', 'make-webhook', 'Log to HubSpot timeline, send via Twilio/SendGrid, store in DB'),
('report-issue', 'make-webhook', 'Create HubSpot Ticket, link to Deal, notify support team'),
('rate-delivery', 'make-webhook', 'Rate driver/delivery - update HubSpot Deal & driver profile');