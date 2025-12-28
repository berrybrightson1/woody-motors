-- Create table for driver applications
CREATE TABLE IF NOT EXISTS public.driver_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  years_experience INTEGER NOT NULL,
  vehicle_preference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  documents JSONB DEFAULT '[]'::jsonb, -- Store URLs to uploaded documents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.driver_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Applicants can insert their own application" ON public.driver_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view applications" ON public.driver_applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
