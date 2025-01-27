import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { supabase } from '../../../config/supabaseClient';
import { ReferralService } from '../../../lib/referralService';

// Verify Flutterwave webhook signature
const verifySignature = (req: NextApiRequest): boolean => {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash) {
    console.error('FLW_SECRET_HASH not configured');
    return false;
  }

  const signature = req.headers['verif-hash'];
  if (!signature) {
    console.error('No verification signature found');
    return false;
  }

  return signature === secretHash;
};

// Handle webhook request
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    if (!verifySignature(req)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const data = req.body;
    console.log('Received webhook data:', JSON.stringify(data, null, 2));

    // Validate webhook data
    if (!data || !data.event || !data.data) {
      console.error('Invalid webhook data format');
      return res.status(400).json({ message: 'Invalid webhook data' });
    }

    const { event, data: eventData } = data;

    // Handle successful payment
    if (event === 'charge.completed' && eventData.status === 'successful') {
      const {
        tx_ref,
        amount,
        currency,
        customer: { email },
        flw_ref,
      } = eventData;

      // Validate required payment data
      if (!tx_ref || !amount || !currency || !email || !flw_ref) {
        console.error('Missing required payment data');
        return res.status(400).json({ message: 'Invalid payment data' });
      }

      // Verify payment amount and currency
      if (amount < 90000 || currency !== 'UGX') {
        console.error('Invalid payment amount or currency:', { amount, currency });
        return res.status(400).json({ message: 'Invalid payment amount or currency' });
      }

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

      // Check for duplicate payment
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('flw_tx_ref', tx_ref)
        .single();

      if (existingPayment) {
        console.log('Payment already processed:', tx_ref);
        return res.status(200).json({ message: 'Payment already processed' });
      }

      // Begin transaction
      const { error: transactionError } = await supabase.rpc('process_payment', {
        p_user_id: userData.id,
        p_flw_tx_id: flw_ref,
        p_flw_tx_ref: tx_ref,
        p_amount: amount,
        p_currency: currency
      });

      if (transactionError) {
        console.error('Transaction failed:', transactionError);
        return res.status(500).json({ message: 'Failed to process payment' });
      }

      try {
        // Activate referral links
        await ReferralService.activateReferralLinks(userData.id);
        
        // Send confirmation email
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Payment Successful - Referral Links Activated',
            template: 'payment_success',
            data: {
              amount: amount.toLocaleString('en-UG', { style: 'currency', currency: 'UGX' }),
              date: new Date().toLocaleDateString('en-UG'),
              tx_ref
            }
          })
        });

        return res.status(200).json({
          message: 'Payment processed successfully',
          data: {
            tx_ref,
            status: 'success'
          }
        });
      } catch (error) {
        console.error('Error activating referral links:', error);
        return res.status(500).json({ message: 'Error activating referral links' });
      }
    }

    // Handle other webhook events
    console.log('Unhandled webhook event:', event);
    return res.status(200).json({ message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
