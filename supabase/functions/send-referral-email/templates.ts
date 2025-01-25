export const EmailTemplate = {
  welcome: ({ name, referrerName }: { name: string; referrerName: string }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #fff; }
          .footer { padding: 20px; text-align: center; color: #6B7280; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Brick Foundation!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            ${
              referrerName
                ? `<p>Thanks for joining Brick Foundation through ${referrerName}'s invitation!</p>`
                : '<p>Thanks for joining Brick Foundation!</p>'
            }
            <p>We're excited to have you on board. Here's what you can do next:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Explore our features</li>
              <li>Start inviting friends</li>
            </ul>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${
                Deno.env.get('APP_URL')
              }/dashboard" class="button">Get Started</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Brick Foundation. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,

  invitation: ({
    referrerName,
    referralCode,
    referralLink,
  }: {
    referrerName: string
    referralCode: string
    referralLink: string
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #fff; }
          .footer { padding: 20px; text-align: center; color: #6B7280; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
          .code { background: #F3F4F6; padding: 8px 16px; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Join Brick Foundation</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>${referrerName} has invited you to join Brick Foundation!</p>
            <p>Use this referral code when signing up:</p>
            <p style="text-align: center;">
              <span class="code">${referralCode}</span>
            </p>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${referralLink}" class="button">Join Now</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Brick Foundation. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,

  milestone: ({
    name,
    tier,
    reward,
  }: {
    name: string
    tier: string
    reward: number
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #fff; }
          .footer { padding: 20px; text-align: center; color: #6B7280; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
          .achievement { text-align: center; margin: 30px 0; }
          .badge { width: 80px; height: 80px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Achievement Unlocked!</h1>
          </div>
          <div class="content">
            <p>Congratulations ${name}!</p>
            <div class="achievement">
              <img src="${Deno.env.get(
                'APP_URL'
              )}/badges/${tier.toLowerCase()}.svg" class="badge" />
              <h2>You've reached ${tier} Tier!</h2>
              <p>You've earned a bonus reward of $${reward.toFixed(2)}!</p>
            </div>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${
                Deno.env.get('APP_URL')
              }/dashboard/referrals" class="button">View Your Achievements</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Brick Foundation. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,

  reward: ({
    name,
    amount,
    type,
  }: {
    name: string
    amount: number
    type: string
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #fff; }
          .footer { padding: 20px; text-align: center; color: #6B7280; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
          .reward { text-align: center; margin: 30px 0; }
          .amount { font-size: 2em; color: #4F46E5; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Reward Earned!</h1>
          </div>
          <div class="content">
            <p>Great news ${name}!</p>
            <div class="reward">
              <p>You've earned a new ${type} reward:</p>
              <p class="amount">$${amount.toFixed(2)}</p>
            </div>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${
                Deno.env.get('APP_URL')
              }/dashboard/referrals" class="button">View Your Rewards</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Brick Foundation. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,
}
