-- COMPLETE MIGRATION FOR WOODY MOTORS
-- Run this entire script in the Supabase SQL Editor

-- 1. Create Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  mileage INTEGER DEFAULT 0,
  transmission TEXT,
  fuel_type TEXT,
  condition TEXT CHECK (condition IN ('foreign_used', 'brand_new', 'pre_owned')),
  is_duty_paid BOOLEAN DEFAULT true,
  vin_verified BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  status TEXT DEFAULT 'available',
  engine_size TEXT,
  vin TEXT,
  
  -- Financial & Social Fields
  is_installment_available BOOLEAN DEFAULT false,
  monthly_installment_value NUMERIC CHECK (monthly_installment_value >= 0),
  view_count BIGINT DEFAULT 0
);

-- 2. Create Service Bookings Table
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date DATE,
  booking_time TIME,
  vehicle_details TEXT,
  service_type TEXT DEFAULT 'Test Drive',
  status TEXT DEFAULT 'pending'
);

-- 3. Create View Count Function (Safe to run even if exists)
CREATE OR REPLACE FUNCTION increment_vehicle_view_count(vehicle_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE vehicles
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = vehicle_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

-- 5. Create Public Access Policies (For Demo Purposes)
-- Allow read access to everyone for vehicles
CREATE POLICY "Public Read Vehicles" ON vehicles
FOR SELECT USING (true);

-- Allow admins (or anyone for demo) to insert/update vehicles
CREATE POLICY "Public Insert Vehicles" ON vehicles
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Vehicles" ON vehicles
FOR UPDATE USING (true);

-- Allow public to create bookings
CREATE POLICY "Public Insert Bookings" ON service_bookings
FOR INSERT WITH CHECK (true);
