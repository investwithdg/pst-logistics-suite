-- Fix RLS security warnings

-- Enable RLS on all public tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_of_delivery ENABLE ROW LEVEL SECURITY;

-- Orders table policies
DROP POLICY IF EXISTS "Users can view their orders" ON orders;
DROP POLICY IF EXISTS "Anyone can track orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
DROP POLICY IF EXISTS "Dispatchers can manage orders" ON orders;
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON orders;

CREATE POLICY "Users can view their orders"
ON orders FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY "Anyone can track orders by order number"
ON orders FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage all orders"
ON orders FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dispatchers can manage orders"
ON orders FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'dispatcher'::app_role));

CREATE POLICY "Drivers can view assigned orders"
ON orders FOR SELECT
TO authenticated
USING (driver_id = auth.uid() OR has_role(auth.uid(), 'driver'::app_role));

CREATE POLICY "System can insert pending orders"
ON orders FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending' OR status = 'pending_payment');

-- Drivers table policies
DROP POLICY IF EXISTS "Admins can manage drivers" ON drivers;
DROP POLICY IF EXISTS "Dispatchers can view drivers" ON drivers;
DROP POLICY IF EXISTS "Drivers can view their profile" ON drivers;
DROP POLICY IF EXISTS "Anyone can view active drivers" ON drivers;

CREATE POLICY "Admins can manage drivers"
ON drivers FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dispatchers can view and update drivers"
ON drivers FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dispatcher'::app_role));

CREATE POLICY "Dispatchers can update drivers"
ON drivers FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'dispatcher'::app_role));

CREATE POLICY "Drivers can view and update their profile"
ON drivers FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Drivers can update their profile"
ON drivers FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Anyone can view active drivers"
ON drivers FOR SELECT
TO anon, authenticated
USING (status = 'available' OR status = 'busy');

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can view their notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'dispatcher'::app_role));

-- Pricing rules table policies
DROP POLICY IF EXISTS "Anyone can view active pricing" ON pricing_rules;
DROP POLICY IF EXISTS "Admins can manage pricing" ON pricing_rules;

CREATE POLICY "Anyone can view active pricing"
ON pricing_rules FOR SELECT
TO anon, authenticated
USING (active = true);

CREATE POLICY "Admins can manage pricing"
ON pricing_rules FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Proof of delivery table policies
DROP POLICY IF EXISTS "Anyone can view proof of delivery" ON proof_of_delivery;
DROP POLICY IF EXISTS "Drivers can create proof" ON proof_of_delivery;
DROP POLICY IF EXISTS "Admins can manage proof" ON proof_of_delivery;

CREATE POLICY "Anyone can view proof of delivery"
ON proof_of_delivery FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Drivers can create proof"
ON proof_of_delivery FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid() OR has_role(auth.uid(), 'driver'::app_role));

CREATE POLICY "Admins can manage proof"
ON proof_of_delivery FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));