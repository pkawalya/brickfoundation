-- Update auth settings to use OTP instead of confirmation email
UPDATE auth.config SET
  enable_signup = true,
  enable_confirmations = false, -- Disable email confirmation
  mailer_autoconfirm = false,  -- Disable auto-confirm
  sms_autoconfirm = false,     -- Disable SMS auto-confirm
  enable_signup_email_otp = true; -- Enable email OTP
