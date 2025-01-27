-- Create referral_links table
CREATE TABLE IF NOT EXISTS public.referral_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_referral_links_referrer_id ON public.referral_links(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON public.referral_links(code);
CREATE INDEX IF NOT EXISTS idx_referral_links_status ON public.referral_links(status);

-- Set up Row Level Security (RLS)
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own referral links"
    ON public.referral_links FOR SELECT
    TO authenticated
    USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create their own referral links"
    ON public.referral_links FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referral links"
    ON public.referral_links FOR UPDATE
    TO authenticated
    USING (auth.uid() = referrer_id)
    WITH CHECK (auth.uid() = referrer_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.referral_links TO authenticated;
