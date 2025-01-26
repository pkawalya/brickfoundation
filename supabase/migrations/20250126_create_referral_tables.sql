-- Create referral_tiers table
CREATE TABLE IF NOT EXISTS public.referral_tiers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    min_referrals INTEGER NOT NULL,
    reward_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) NOT NULL,
    referred_id UUID REFERENCES auth.users(id) NOT NULL,
    referral_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    total_rewards DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    referral_id UUID REFERENCES public.referrals(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('signup', 'purchase', 'milestone')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.referral_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to referral_tiers for all users" ON public.referral_tiers
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to own referrals" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Allow insert for authenticated users" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Allow read access to own rewards" ON public.rewards
    FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.referral_tiers TO authenticated, anon;
GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT SELECT ON public.rewards TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referred_id_idx ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS referrals_status_idx ON public.referrals(status);
CREATE INDEX IF NOT EXISTS rewards_user_id_idx ON public.rewards(user_id);
CREATE INDEX IF NOT EXISTS rewards_referral_id_idx ON public.rewards(referral_id);

-- Insert default tiers
INSERT INTO public.referral_tiers (name, min_referrals, reward_multiplier) VALUES
    ('Bronze', 0, 1.00),
    ('Silver', 5, 1.25),
    ('Gold', 15, 1.50),
    ('Platinum', 30, 2.00)
ON CONFLICT DO NOTHING;
