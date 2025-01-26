-- Add RLS policy for inserting new users
CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Add RLS policy for service role operations (like triggers)
CREATE POLICY "Enable all operations for service role" ON public.users
    FOR ALL
    USING (auth.uid() = id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Grant insert permission to authenticated users
GRANT INSERT ON public.users TO authenticated;
