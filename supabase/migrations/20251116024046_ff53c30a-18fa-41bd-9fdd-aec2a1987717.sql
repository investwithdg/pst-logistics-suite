-- Add delivery_size column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_size text;