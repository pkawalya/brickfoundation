-- Disable email confirmation requirement temporarily for development
UPDATE auth.config 
SET confirm_email_change = false,
    enable_signup = true,
    mailer_autoconfirm = true,
    sms_autoconfirm = true;

-- Update existing unconfirmed users to confirmed
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Optional: Set a longer confirmation token expiry time
UPDATE auth.config
SET confirm_email_token_expiry_seconds = 24 * 60 * 60; -- 24 hours
