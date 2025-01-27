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
    flw_tx_id TEXT NOT NULL UNIQUE,
    flw_tx_ref TEXT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'UGX',
    status TEXT NOT NULL CHECK (status IN ('pending', 'successful', 'failed')),
    provider TEXT NOT NULL DEFAULT 'flutterwave',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to process payment
CREATE OR REPLACE FUNCTION public.process_payment(
  p_user_id UUID,
  p_flw_tx_id TEXT,
  p_flw_tx_ref TEXT,
  p_amount DECIMAL,
  p_currency TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Insert payment record
  INSERT INTO public.payments (
    user_id,
    flw_tx_id,
    flw_tx_ref,
    amount,
    currency,
    status,
    provider,
    metadata
  ) VALUES (
    p_user_id,
    p_flw_tx_id,
    p_flw_tx_ref,
    p_amount,
    p_currency,
    'successful',
    'flutterwave',
    jsonb_build_object(
      'payment_type', 'referral_activation',
      'processed_at', timezone('utc'::text, now())
    )
  );

  -- Deactivate existing active referral links
  UPDATE public.referral_links
  SET 
    status = 'inactive',
    metadata = jsonb_set(
      metadata,
      '{deactivated_at}',
      to_jsonb(timezone('utc'::text, now()))
    )
  WHERE 
    referrer_id = p_user_id 
    AND status = 'active';

  -- Create 3 new active referral links
  FOR i IN 1..3 LOOP
    -- Generate a unique code
    SELECT 'BF-' || substr(encode(gen_random_bytes(6), 'hex'), 1, 8)
    INTO v_code;
    
    -- Insert new referral link
    INSERT INTO public.referral_links (
      referrer_id,
      code,
      status,
      metadata
    ) VALUES (
      p_user_id,
      v_code,
      'active',
      jsonb_build_object(
        'activation_date', timezone('utc'::text, now()),
        'payment_amount', p_amount,
        'payment_currency', p_currency,
        'payment_ref', p_flw_tx_ref
      )
    );
  END LOOP;

  -- Commit the transaction
  COMMIT;
END;
$$;

-- Create referral_tiers table (no dependencies)
CREATE TABLE IF NOT EXISTS public.referral_tiers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    min_referrals INTEGER NOT NULL,
    reward_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referrals table (depends on referral_tiers)
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referred_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create rewards table (depends on referrals)
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'UGX',
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create referral_activities table (depends on referrals)
CREATE TABLE IF NOT EXISTS public.referral_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create referral_links table
CREATE TABLE IF NOT EXISTS public.referral_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_flw_tx_id ON public.payments(flw_tx_id);
CREATE INDEX IF NOT EXISTS idx_payments_flw_tx_ref ON public.payments(flw_tx_ref);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON public.rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_referral_id ON public.rewards(referral_id);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON public.rewards(status);

CREATE INDEX IF NOT EXISTS idx_referral_activities_referral_id ON public.referral_activities(referral_id);

CREATE INDEX IF NOT EXISTS idx_referral_links_referrer_id ON public.referral_links(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON public.referral_links(code);

-- Set up Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own referrals"
    ON public.referrals FOR SELECT
    TO authenticated
    USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can view their own rewards"
    ON public.rewards FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own referral activities"
    ON public.referral_activities FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT referrer_id FROM public.referrals WHERE id = referral_id
            UNION
            SELECT referred_id FROM public.referrals WHERE id = referral_id
        )
    );

CREATE POLICY "Everyone can view referral tiers"
    ON public.referral_tiers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can view their own referral links"
    ON public.referral_links FOR SELECT
    TO authenticated
    USING (auth.uid() = referrer_id);

-- Grant access to authenticated users
GRANT SELECT ON public.payments TO authenticated;
GRANT SELECT ON public.referrals TO authenticated;
GRANT SELECT ON public.rewards TO authenticated;
GRANT SELECT ON public.referral_activities TO authenticated;
GRANT SELECT ON public.referral_tiers TO authenticated;
GRANT SELECT ON public.referral_links TO authenticated;

-- Insert default tiers
INSERT INTO public.referral_tiers (name, min_referrals, reward_multiplier) VALUES
    ('Bronze', 0, 1.00),
    ('Silver', 5, 1.25),
    ('Gold', 10, 1.50),
    ('Platinum', 20, 2.00)
ON CONFLICT (id) DO NOTHING;
