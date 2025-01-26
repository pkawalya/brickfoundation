import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { supabase } from '../../../config/supabaseClient';
import { ReferralService } from '../../../lib/referralService';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    await new Promise((resolve, reject) => {
      req.on('end', resolve);
      req.on('error', reject);
    });

    const body = Buffer.concat(chunks).toString('utf8');
    const data = JSON.parse(body);

    // Verify webhook signature
    const secretHash = process.env.FLW_SECRET_KEY;
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== secretHash) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Process the webhook
    const { event, data: eventData } = data;

    if (event === 'charge.completed' && eventData.status === 'successful') {
      const {
        tx_ref,
        amount,
        currency,
        customer: { email },
        flw_ref,
      } = eventData;

      // Get user from email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        console.error('User not found:', email);
        return res.status(404).json({ message: 'User not found' });
      }

      // Record payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userData.id,
          flw_tx_id: flw_ref,
          flw_tx_ref: tx_ref,
          amount,
          currency,
          status: 'completed',
          provider: 'flutterwave',
          metadata: {
            payment_type: 'referral_activation',
            webhook_event: event
          }
        });

      if (paymentError) {
        console.error('Error recording payment:', paymentError);
        return res.status(500).json({ message: 'Error recording payment' });
      }

      // Activate referral links
      if (amount >= 90000 && currency === 'UGX') {
        try {
          await ReferralService.activateReferralLinks(userData.id);
        } catch (error) {
          console.error('Error activating referral links:', error);
          return res.status(500).json({ message: 'Error activating referral links' });
        }
      }
    }

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
}
