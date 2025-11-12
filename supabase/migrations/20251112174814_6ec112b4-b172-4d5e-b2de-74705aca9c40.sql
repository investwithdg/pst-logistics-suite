-- Drop the existing check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add updated check constraint with pending_payment status
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'pending_payment', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'));