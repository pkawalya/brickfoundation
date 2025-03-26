-- Drop the existing insert policy
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Create a new policy that allows inserts during registration
CREATE POLICY "Enable insert during registration" ON public.users
    FOR INSERT
    WITH CHECK (
        -- Allow inserts when the user's ID matches the auth.uid()
        -- This covers both registration and authenticated user cases
        auth.uid() = id OR
        -- Also allow inserts from the service role
        auth.role() = 'service_role'
    );

-- Ensure anon role can insert during registration
GRANT INSERT ON public.users TO anon;
