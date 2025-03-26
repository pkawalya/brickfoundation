-- Add phone column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN phone VARCHAR(15);
    END IF;
END $$;

-- Add first_name and last_name columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN first_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN last_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN full_name VARCHAR(511);
    END IF;
END $$;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert during registration" ON public.users;

-- Create a new policy that allows inserts during registration
CREATE POLICY "Enable insert during registration" ON public.users
    FOR INSERT
    WITH CHECK (true);  -- Allow all inserts during registration

-- Enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT INSERT ON public.users TO anon;
GRANT INSERT ON public.users TO authenticated;
