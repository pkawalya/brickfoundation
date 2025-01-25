import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { EmailTemplate } from './templates.ts'

interface ReferralEmailPayload {
  type: 'welcome' | 'invitation' | 'milestone' | 'reward'
  referrer?: {
    name: string
    email: string
    referralCode: string
    tier: string
  }
  referred?: {
    name: string
    email: string
  }
  reward?: {
    amount: number
    type: string
  }
  milestone?: {
    tier: string
    reward: number
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { type, referrer, referred, reward, milestone } = await req.json() as ReferralEmailPayload

    // Get email service configuration
    const { data: config } = await supabaseClient
      .from('email_config')
      .select('*')
      .single()

    if (!config) {
      throw new Error('Email configuration not found')
    }

    const emailClient = new EmailClient(config)
    let emailContent: string
    let subject: string

    switch (type) {
      case 'welcome':
        emailContent = EmailTemplate.welcome({
          name: referred?.name || 'there',
          referrerName: referrer?.name || '',
        })
        subject = 'Welcome to Brick Foundation!'
        break

      case 'invitation':
        emailContent = EmailTemplate.invitation({
          referrerName: referrer?.name || '',
          referralCode: referrer?.referralCode || '',
          referralLink: `${Deno.env.get('APP_URL')}/register?ref=${
            referrer?.referralCode
          }`,
        })
        subject = `${referrer?.name} invited you to join Brick Foundation`
        break

      case 'milestone':
        emailContent = EmailTemplate.milestone({
          name: referrer?.name || '',
          tier: milestone?.tier || '',
          reward: milestone?.reward || 0,
        })
        subject = `Congratulations on reaching ${milestone?.tier} tier!`
        break

      case 'reward':
        emailContent = EmailTemplate.reward({
          name: referrer?.name || '',
          amount: reward?.amount || 0,
          type: reward?.type || '',
        })
        subject = 'You've earned a new reward!'
        break

      default:
        throw new Error('Invalid email type')
    }

    const result = await emailClient.send({
      to: referred?.email || referrer?.email || '',
      subject,
      html: emailContent,
    })

    // Log email sending
    await supabaseClient.from('email_logs').insert({
      type,
      recipient: referred?.email || referrer?.email || '',
      subject,
      status: result.success ? 'sent' : 'failed',
      error: result.error,
      metadata: {
        referrer,
        referred,
        reward,
        milestone,
      },
    })

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
