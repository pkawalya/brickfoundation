-- First, drop existing tables if they exist
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.referral_links CASCADE;

-- Create referral_links table
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

-- Create referrals table
CREATE TABLE public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    referral_code TEXT NOT NULL REFERENCES public.referral_links(code) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    total_rewards DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for referral_links
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

-- Create RLS policies for referrals
CREATE POLICY "Users can view their own referrals"
    ON public.referrals
    FOR SELECT
    USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
    ON public.referrals
    FOR INSERT
    WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referrals"
    ON public.referrals
    FOR UPDATE
    USING (auth.uid() = referrer_id);

-- Create indexes for better performance
CREATE INDEX referral_links_referrer_id_idx ON public.referral_links(referrer_id);
CREATE INDEX referral_links_code_idx ON public.referral_links(code);
CREATE INDEX referral_links_status_idx ON public.referral_links(status);
CREATE INDEX referrals_referrer_id_idx ON public.referrals(referrer_id);
CREATE INDEX referrals_referral_code_idx ON public.referrals(referral_code);
CREATE INDEX referrals_status_idx ON public.referrals(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_referral_links_updated_at
    BEFORE UPDATE ON public.referral_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
