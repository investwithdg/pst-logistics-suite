-- Create orders table
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number text UNIQUE NOT NULL DEFAULT 'ORD-' || to_char(now(), 'YYYY-MM-DD-') || substring(gen_random_uuid()::text, 1, 8),
    
    -- Customer info (no FK yet, auth comes later)
    customer_id uuid,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text,
    
    -- Addresses
    pickup_address text NOT NULL,
    pickup_lat decimal,
    pickup_lng decimal,
    dropoff_address text NOT NULL,
    dropoff_lat decimal,
    dropoff_lng decimal,
    distance decimal NOT NULL,
    
    -- Package details
    package_weight decimal NOT NULL,
    package_description text NOT NULL,
    special_instructions text,
    
    -- Pricing
    base_rate decimal NOT NULL,
    mileage_charge decimal NOT NULL,
    surcharge decimal DEFAULT 0,
    total_price decimal NOT NULL,
    
    -- Status tracking
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'completed', 'cancelled')),
    
    -- Assignment (no FK yet)
    driver_id uuid,
    driver_name text,
    driver_phone text,
    assigned_at timestamptz,
    
    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    picked_up_at timestamptz,
    in_transit_at timestamptz,
    delivered_at timestamptz,
    completed_at timestamptz,
    estimated_delivery timestamptz
);

-- Create drivers table
CREATE TABLE public.drivers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text,
    phone text NOT NULL,
    vehicle_type text NOT NULL,
    vehicle_plate text,
    vehicle_color text,
    license_number text,
    status text NOT NULL DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'offline')),
    current_location_lat decimal,
    current_location_lng decimal,
    current_location text,
    location_updated_at timestamptz,
    rating decimal DEFAULT 5.0,
    total_deliveries integer DEFAULT 0,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text,
    message text NOT NULL,
    type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    read boolean DEFAULT false,
    action_url text,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create proof_of_delivery table
CREATE TABLE public.proof_of_delivery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
    driver_id uuid,
    photo_url text,
    signature_url text,
    recipient_name text,
    notes text,
    delivery_location_lat decimal,
    delivery_location_lng decimal,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create pricing_rules table
CREATE TABLE public.pricing_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    base_rate decimal NOT NULL DEFAULT 25.00,
    per_mile_rate decimal NOT NULL DEFAULT 2.50,
    per_pound_rate decimal NOT NULL DEFAULT 0.50,
    urgent_surcharge_percent integer NOT NULL DEFAULT 25,
    heavy_package_threshold decimal NOT NULL DEFAULT 50,
    heavy_package_surcharge decimal NOT NULL DEFAULT 15,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX orders_driver_id_idx ON public.orders(driver_id);
CREATE INDEX orders_status_idx ON public.orders(status);
CREATE INDEX orders_created_at_idx ON public.orders(created_at DESC);

CREATE INDEX notifications_user_id_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX notifications_read_idx ON public.notifications(user_id, read);

CREATE INDEX drivers_status_idx ON public.drivers(status);

-- Ensure only one active pricing rule at a time
CREATE UNIQUE INDEX one_active_pricing_rule ON public.pricing_rules(active) WHERE active = true;

-- Insert default active pricing rule
INSERT INTO public.pricing_rules (base_rate, per_mile_rate, per_pound_rate, heavy_package_threshold, heavy_package_surcharge, active)
VALUES (25.00, 2.50, 0.50, 50, 15, true);