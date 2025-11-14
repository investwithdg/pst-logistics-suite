-- Add missing fields to orders table for customer, driver, and admin properties

-- Customer-facing fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scheduled_pickup_time timestamp with time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scheduled_delivery_time timestamp with time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'standard';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vehicle_type_required text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rush_requested boolean DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS number_of_stops integer DEFAULT 1;

-- Driver-facing fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_exception_type text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_exception_notes text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_feedback text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_contacted_customer boolean DEFAULT false;

-- Admin/Dispatcher fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deal_pipeline_stage text DEFAULT 'new';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_resolution_status text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_status text DEFAULT 'draft';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pricing_mode text DEFAULT 'per_mile';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_sent boolean DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_sent boolean DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_route jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recurring_frequency text;

-- Add RLS policies for role-based field access
-- Customers can update their order fields before assignment
CREATE POLICY "Customers can update their pending orders" ON orders
FOR UPDATE TO authenticated
USING (customer_id = auth.uid() AND status = 'pending')
WITH CHECK (
  customer_id = auth.uid() AND
  -- Only allow updates to customer-editable fields
  (pickup_address IS NOT NULL OR 
   dropoff_address IS NOT NULL OR
   scheduled_pickup_time IS NOT NULL OR
   scheduled_delivery_time IS NOT NULL OR
   customer_phone IS NOT NULL OR
   customer_email IS NOT NULL OR
   customer_name IS NOT NULL OR
   package_weight IS NOT NULL OR
   delivery_type IS NOT NULL OR
   vehicle_type_required IS NOT NULL OR
   special_instructions IS NOT NULL OR
   rush_requested IS NOT NULL OR
   number_of_stops IS NOT NULL)
);

-- Drivers can update delivery-related fields for assigned orders
CREATE POLICY "Drivers can update assigned order delivery info" ON orders
FOR UPDATE TO authenticated
USING (driver_id = auth.uid() OR has_role(auth.uid(), 'driver'::app_role))
WITH CHECK (
  driver_id = auth.uid() AND
  -- Drivers can update status, timestamps, POD, and exceptions
  (status IS NOT NULL OR
   picked_up_at IS NOT NULL OR
   delivered_at IS NOT NULL OR
   delivery_exception_type IS NOT NULL OR
   delivery_exception_notes IS NOT NULL OR
   driver_feedback IS NOT NULL OR
   driver_contacted_customer IS NOT NULL)
);