-- Configure Supabase Auth to use Mailtrap with API token
UPDATE auth.config SET
    -- Email settings
    smtp_admin_email = 'admin@thebrickfoundation.org',
    smtp_host = 'send.smtp.mailtrap.io',
    smtp_port = 587,
    smtp_user = 'api',
    smtp_pass = '86f9af653b50718d331c248ced3f6f70',
    smtp_max_frequency = 60,
    
    -- Development settings
    mailer_autoconfirm = false,
    confirm_email_change = true,
    
    -- Email templates with development indicators
    mailer_template_confirmation = '
<h2>Welcome to The Brick Foundation (Development)</h2>
<p>Hello,</p>
<p>Please confirm your email address by clicking the button below:</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Thanks,<br>The Brick Foundation Team</p>
',
    mailer_template_recovery = '
<h2>Reset Your Password (Development)</h2>
<p>Hello,</p>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Thanks,<br>The Brick Foundation Team</p>
',
    mailer_template_magic_link = '
<h2>Magic Link Sign In (Development)</h2>
<p>Hello,</p>
<p>Click the button below to sign in to your account:</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Sign In</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Thanks,<br>The Brick Foundation Team</p>
',
    mailer_template_email_change = '
<h2>Confirm Email Change (Development)</h2>
<p>Hello,</p>
<p>Click the button below to confirm your new email address:</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Confirm Email Change</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Thanks,<br>The Brick Foundation Team</p>
';
