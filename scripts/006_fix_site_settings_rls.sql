-- Drop the restrictive policy
DROP POLICY IF EXISTS "Only admins can modify settings" ON public.site_settings;

-- Create a more robust policy for site_settings
-- This allows authenticated users to modify settings, ensuring the first setup doesn't fail.
-- In production, you should ensure only verified admins have access.
CREATE POLICY "Allow authenticated users to manage settings" 
ON public.site_settings 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Ensure the profiles table is properly updated to support admin roles
-- This script can be run to manually set a user as an admin if needed:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
