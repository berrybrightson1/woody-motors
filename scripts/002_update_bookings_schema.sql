-- Add customer contact fields to service_bookings table for public booking form
ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Make user_id nullable since public users won't be authenticated
ALTER TABLE service_bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- Add index for customer email lookups
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_email 
ON service_bookings(customer_email);
