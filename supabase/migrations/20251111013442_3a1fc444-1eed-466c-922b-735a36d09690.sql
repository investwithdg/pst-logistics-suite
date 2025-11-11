-- Create storage bucket for proof of delivery files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proof-of-delivery',
  'proof-of-delivery',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Note: RLS policies will be added later when authentication is implemented
-- For now, the bucket is public to allow uploads during development