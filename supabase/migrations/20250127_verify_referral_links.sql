-- First verify if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'referral_links'
);

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'referral_links';

-- Check RLS policies
SELECT pol.policyname, pol.permissive, pol.roles, pol.cmd, pol.qual, pol.with_check
FROM pg_policies pol
JOIN pg_class cls ON pol.tablename = cls.relname
WHERE cls.relname = 'referral_links';

-- Drop the old referrals table if it exists
DROP TABLE IF EXISTS public.referrals;

-- Create the new referral_links table
CREATE TABLE IF NOT EXISTS public.referral_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id),
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS referral_links_referrer_id_idx ON public.referral_links(referrer_id);
CREATE INDEX IF NOT EXISTS referral_links_code_idx ON public.referral_links(code);

-- Enable RLS
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own referral links" ON public.referral_links;
CREATE POLICY "Users can view their own referral links"
    ON public.referral_links
    FOR SELECT
    TO authenticated
    USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can create their own referral links" ON public.referral_links;
CREATE POLICY "Users can create their own referral links"
    ON public.referral_links
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can update their own referral links" ON public.referral_links;
CREATE POLICY "Users can update their own referral links"
    ON public.referral_links
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = referrer_id)
    WITH CHECK (auth.uid() = referrer_id);

-- Grant permissions
GRANT ALL ON public.referral_links TO authenticated;
GRANT ALL ON public.referral_links TO service_role;
