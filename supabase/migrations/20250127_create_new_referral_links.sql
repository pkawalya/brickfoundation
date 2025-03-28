-- Create the new referral_links table
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
