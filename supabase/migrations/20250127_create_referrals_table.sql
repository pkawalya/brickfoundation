-- Create the referrals table
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
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
