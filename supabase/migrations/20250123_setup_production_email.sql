-- Enable email confirmation and security features
UPDATE auth.config SET
    -- Basic auth settings
    enable_signup = true,
    mailer_autoconfirm = false,
    confirm_email_change = true,
    enable_user_deletion = false,
    
    -- Email configuration
    smtp_admin_email = '{{ADMIN_EMAIL}}',
    smtp_host = 'smtp.sendgrid.net',
    smtp_port = 587,
    smtp_user = 'apikey',
    smtp_pass = '{{SENDGRID_API_KEY}}',
    smtp_max_frequency = 60,
    
    -- Token expiry settings
    confirm_email_token_expiry_seconds = 24 * 60 * 60, -- 24 hours
    invite_token_expiry_seconds = 24 * 60 * 60,        -- 24 hours
    recovery_token_expiry_seconds = 2 * 60 * 60,       -- 2 hours
    
    -- Rate limiting
    rate_limit_email_sent = 20,        -- Max emails per hour
    rate_limit_sms_sent = 10,          -- Max SMS per hour
    rate_limit_authenticator_verify = 10, -- Max 2FA attempts per hour
    rate_limit_authenticator_resend = 5,  -- Max 2FA resend attempts per hour
    
    -- Security settings
    jwt_exp = 3600,                    -- 1 hour token expiry
    security_captcha_enabled = true,   -- Enable CAPTCHA
    security_bruteforce_detection = true, -- Enable brute force protection
    
    -- Email template settings
    mailer_template_forgot_password = '
<h2>Reset Your Password</h2>
<p>Hello,</p>
<p>Someone has requested a password reset for your account. If this was you, click the button below to reset your password. If you didn''t request this, you can safely ignore this email.</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
<p>This link will expire in 2 hours.</p>
<p>Best regards,<br>The Brick Foundation Team</p>
',
    mailer_template_magic_link = '
<h2>Sign In to Your Account</h2>
<p>Hello,</p>
<p>Click the button below to sign in to your account. This link will expire in 24 hours.</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Sign In</a></p>
<p>If you didn''t request this link, you can safely ignore this email.</p>
<p>Best regards,<br>The Brick Foundation Team</p>
',
    mailer_template_confirmation = '
<h2>Verify Your Email Address</h2>
<p>Hello,</p>
<p>Thank you for registering with The Brick Foundation. Please click the button below to verify your email address.</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
<p>This link will expire in 24 hours.</p>
<p>Best regards,<br>The Brick Foundation Team</p>
',
    mailer_template_change_email = '
<h2>Confirm Email Change</h2>
<p>Hello,</p>
<p>You recently requested to change your email address. Click the button below to confirm this change.</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Confirm Email Change</a></p>
<p>This link will expire in 24 hours.</p>
<p>If you didn''t request this change, please contact us immediately.</p>
<p>Best regards,<br>The Brick Foundation Team</p>
';
