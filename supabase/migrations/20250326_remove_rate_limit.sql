-- Remove rate limiting for email signups and OTP
ALTER SYSTEM SET auth.rate_limit.email_confirm = '0';
ALTER SYSTEM SET auth.rate_limit.sms_otp = '0';
ALTER SYSTEM SET auth.rate_limit.sms_verification = '0';
ALTER SYSTEM SET auth.rate_limit.email_otp = '0';
ALTER SYSTEM SET auth.rate_limit.invite = '0';

-- Reset the rate limit counters
DELETE FROM auth.users WHERE email = 'rate-limit-counter@supabase.io';

-- Restart auth service to apply changes
SELECT pg_reload_conf();
