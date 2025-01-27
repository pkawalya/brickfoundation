-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view their own referral links" ON public.referral_links;
DROP POLICY IF EXISTS "Users can create their own referral links" ON public.referral_links;
DROP POLICY IF EXISTS "Users can update their own referral links" ON public.referral_links;
DROP POLICY IF EXISTS "Allow read access to own referral links" ON public.referral_links;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.referral_links;
DROP POLICY IF EXISTS "Allow update own referral links" ON public.referral_links;

-- Drop all existing indexes
DROP INDEX IF EXISTS public.referral_links_referrer_id_idx;
DROP INDEX IF EXISTS public.referral_links_code_idx;
DROP INDEX IF EXISTS public.referral_links_status_idx;
DROP INDEX IF EXISTS public.referrals_referrer_id_idx;
DROP INDEX IF EXISTS public.referrals_referred_id_idx;

-- Drop all existing tables with CASCADE to remove dependencies
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.referral_links CASCADE;
DROP TABLE IF EXISTS public.referral_rewards CASCADE;
DROP TABLE IF EXISTS public.referral_clicks CASCADE;

-- Now create the new referral_links table
CREATE TABLE public.referral_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    clicks INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own referral links"
    ON public.referral_links
    FOR SELECT
    USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create their own referral links"
    ON public.referral_links
    FOR INSERT
    WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referral links"
    ON public.referral_links
    FOR UPDATE
    USING (auth.uid() = referrer_id)
    WITH CHECK (auth.uid() = referrer_id);

-- Create indexes for better performance
CREATE INDEX referral_links_referrer_id_idx ON public.referral_links(referrer_id);
CREATE INDEX referral_links_code_idx ON public.referral_links(code);
CREATE INDEX referral_links_status_idx ON public.referral_links(status);
