-- Update auth settings to use confirmation email
UPDATE auth.config SET
  enable_signup = true,
  enable_confirmations = true,   -- Enable email confirmation
  mailer_autoconfirm = false,    -- Disable auto-confirm
  sms_autoconfirm = false,       -- Disable SMS auto-confirm
  enable_signup_email_otp = false; -- Disable email OTP
