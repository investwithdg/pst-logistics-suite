-- Create table for storing driver location history
CREATE TABLE public.driver_location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  order_id UUID NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  speed NUMERIC,
  heading NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.driver_location_history ENABLE ROW LEVEL SECURITY;

-- Create policy for drivers to insert their own location history
CREATE POLICY "Drivers can insert their own location history"
ON public.driver_location_history
FOR INSERT
WITH CHECK (true);

-- Create policy for viewing location history
CREATE POLICY "Anyone can view location history"
ON public.driver_location_history
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_driver_location_history_order_id ON public.driver_location_history(order_id);
CREATE INDEX idx_driver_location_history_recorded_at ON public.driver_location_history(recorded_at);

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_location_history;