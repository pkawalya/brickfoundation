-- First, drop existing tables if they exist
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.referral_links CASCADE;

-- Create referral_links table
CREATE TABLE IF NOT EXISTS public.referral_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_referral_links_updated_at
  BEFORE UPDATE ON public.referral_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create referrals table if not exists
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  referral_code TEXT NOT NULL REFERENCES public.referral_links(code),
  status TEXT CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
  total_rewards DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for referral_links
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral links"
  ON public.referral_links FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referral links"
  ON public.referral_links FOR UPDATE
  USING (auth.uid() = referrer_id);

-- Create RLS policies for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referrals"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = referrer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referral_links_referrer_id ON public.referral_links(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON public.referral_links(code);
CREATE INDEX IF NOT EXISTS idx_referral_links_status ON public.referral_links(status);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
