-- SPARE PARTS CATALOG MIGRATION
-- Run this script in the Supabase SQL Editor to add the spare parts functionality

-- 1. Create Spare Parts Table
CREATE TABLE IF NOT EXISTS spare_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Basic Info
  name TEXT NOT NULL,
  part_number TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- ENGINE, BRAKES, ELECTRICAL, SUSPENSION, BODY, FILTERS, FLUIDS
  brand TEXT NOT NULL, 
  
  -- Pricing & Availability
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GHS' NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  stock_level TEXT DEFAULT 'IN_STOCK', -- IN_STOCK, LOW_STOCK, OUT_OF_STOCK, PRE_ORDER
  
  -- Product Details
  description TEXT,
  specifications JSONB DEFAULT '{}'::jsonb, 
  images TEXT[] DEFAULT '{}',
  
  -- Vehicle Compatibility
  compatible_makes TEXT[] DEFAULT '{}',
  compatible_models TEXT[] DEFAULT '{}',
  compatible_years TEXT[] DEFAULT '{}',
  is_universal BOOLEAN DEFAULT false,
  
  -- SEO & Metadata
  view_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false
);

-- 2. Create Part Inquiries Table
CREATE TABLE IF NOT EXISTS part_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Part Reference
  part_id UUID REFERENCES spare_parts(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  
  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- Inquiry Details
  quantity INTEGER DEFAULT 1,
  vehicle_info TEXT,
  message TEXT,
  
  -- Status
  status TEXT DEFAULT 'PENDING', -- PENDING, QUOTED, COMPLETED, CANCELLED
  admin_notes TEXT
);

-- 3. Enable RLS
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Allow public read access to spare parts
CREATE POLICY "Public Read Spare Parts" ON spare_parts
FOR SELECT USING (true);

-- Allow admins (or public for demo) to manage spare parts
CREATE POLICY "Public Insert Spare Parts" ON spare_parts
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Spare Parts" ON spare_parts
FOR UPDATE USING (true);

CREATE POLICY "Public Delete Spare Parts" ON spare_parts
FOR DELETE USING (true);

-- Allow public to create inquiries
CREATE POLICY "Public Create Inquiries" ON part_inquiries
FOR INSERT WITH CHECK (true);

-- Allow admins to view inquiries (for now allow public read for demo/easier dev)
CREATE POLICY "Public Read Inquiries" ON part_inquiries
FOR SELECT USING (true);

CREATE POLICY "Public Update Inquiries" ON part_inquiries
FOR UPDATE USING (true);

CREATE POLICY "Public Delete Inquiries" ON part_inquiries
FOR DELETE USING (true);
