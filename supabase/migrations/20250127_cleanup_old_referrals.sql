-- Drop all existing referral-related tables and functions
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.referral_links CASCADE;
DROP TABLE IF EXISTS public.referral_rewards CASCADE;
DROP TABLE IF EXISTS public.referral_clicks CASCADE;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow read access to own referral links" ON public.referral_links;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.referral_links;
DROP POLICY IF EXISTS "Allow update own referral links" ON public.referral_links;

-- Drop any existing indexes
DROP INDEX IF EXISTS public.referrals_referrer_id_idx;
DROP INDEX IF EXISTS public.referrals_referred_id_idx;
DROP INDEX IF EXISTS public.referral_links_referrer_id_idx;
DROP INDEX IF EXISTS public.referral_links_code_idx;
DROP INDEX IF EXISTS public.referral_links_status_idx;
