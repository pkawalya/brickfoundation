-- Drop all existing tables and functions
DROP FUNCTION IF EXISTS verify_referral_link CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TABLE IF EXISTS public.referral_activities CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.referral_tiers CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;

-- Create payments table first (no dependencies)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flw_tx_id TEXT NOT NULL,
    flw_tx_ref TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'UGX',
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    provider TEXT NOT NULL DEFAULT 'flutterwave',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referral_tiers table (no dependencies)
CREATE TABLE IF NOT EXISTS public.referral_tiers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    min_referrals INTEGER NOT NULL,
    reward_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referrals table (depends on auth.users)
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL,
    referred_id UUID,
    referral_code TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    total_rewards DECIMAL(10,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_referrer FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_referred FOREIGN KEY (referred_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT unique_active_referral UNIQUE (referrer_id, referred_id)
);

-- Create indexes for referrals table
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

-- Create referral_activities table
CREATE TABLE IF NOT EXISTS public.referral_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('signup', 'verification', 'purchase', 'milestone')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rewards table (depends on referrals and auth.users)
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('signup', 'purchase', 'milestone')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to validate referral link
CREATE OR REPLACE FUNCTION verify_referral_link(
    ref_code TEXT,
    ts BIGINT,
    sig TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    expected_signature TEXT;
BEGIN
    -- Create expected signature using the same method as in ReferralService
    expected_signature := encode(
        hmac(
            ref_code || '-' || ts::TEXT,
            current_setting('app.jwt_secret', TRUE),
            'sha256'
        ),
        'hex'
    );
    
    -- Compare first 8 characters of signatures
    RETURN LEFT(expected_signature, 8) = sig;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for referrals and related tables
CREATE POLICY "Allow read access to referral_tiers for all users" ON public.referral_tiers
    FOR SELECT USING (true);

-- Referrals policies
CREATE POLICY "Allow read access to own referrals" ON public.referrals
    FOR SELECT USING (
        auth.uid() = referrer_id OR 
        auth.uid() = referred_id OR
        (
            status = 'active' AND 
            verify_referral_link(
                referral_code,
                (metadata->>'ts')::BIGINT,
                metadata->>'sig'
            )
        )
    );

CREATE POLICY "Allow insert for authenticated users" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Allow update own referrals" ON public.referrals
    FOR UPDATE USING (auth.uid() = referrer_id)
    WITH CHECK (auth.uid() = referrer_id);

-- Referral activities policies
CREATE POLICY "Allow read access to own referral activities" ON public.referral_activities
    FOR SELECT USING (auth.uid() = user_id OR 
                     EXISTS (
                         SELECT 1 FROM public.referrals 
                         WHERE referrals.id = referral_activities.referral_id 
                         AND (referrals.referrer_id = auth.uid() OR referrals.referred_id = auth.uid())
                     ));

CREATE POLICY "Allow insert own activities" ON public.referral_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rewards policies
CREATE POLICY "Allow read access to own rewards" ON public.rewards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert own rewards" ON public.rewards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update own rewards" ON public.rewards
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_flw_tx_id_idx ON public.payments(flw_tx_id);
CREATE INDEX IF NOT EXISTS payments_flw_tx_ref_idx ON public.payments(flw_tx_ref);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);

CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referred_id_idx ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS referrals_status_idx ON public.referrals(status);
CREATE INDEX IF NOT EXISTS referrals_code_idx ON public.referrals(referral_code);

CREATE INDEX IF NOT EXISTS referral_activities_referral_id_idx ON public.referral_activities(referral_id);
CREATE INDEX IF NOT EXISTS referral_activities_user_id_idx ON public.referral_activities(user_id);
CREATE INDEX IF NOT EXISTS rewards_user_id_idx ON public.rewards(user_id);
CREATE INDEX IF NOT EXISTS rewards_referral_id_idx ON public.rewards(referral_id);

-- Grant permissions
GRANT SELECT ON public.referral_tiers TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT SELECT, INSERT ON public.referral_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.rewards TO authenticated;
GRANT SELECT, INSERT ON public.payments TO authenticated;

-- Insert default tiers
INSERT INTO public.referral_tiers (name, min_referrals, reward_multiplier) VALUES
    ('Bronze', 0, 1.00),
    ('Silver', 5, 1.25),
    ('Gold', 15, 1.50),
    ('Platinum', 30, 2.00)
ON CONFLICT DO NOTHING;
