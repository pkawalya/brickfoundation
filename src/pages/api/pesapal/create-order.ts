import type { NextApiRequest, NextApiResponse } from 'next';
import { PESAPAL_CONFIG } from '@/config/pesapal';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      email,
      phone,
      firstName,
      lastName,
      amount,
      callbackUrl
    } = req.body;

    // Format phone number
    const formattedPhone = phone.startsWith('0') 
      ? `256${phone.substring(1)}` 
      : phone.startsWith('256') 
        ? phone 
        : `256${phone}`;

    console.log('Formatted phone:', formattedPhone);

    // Get auth token
    const baseUrl = PESAPAL_CONFIG.IS_SANDBOX ? PESAPAL_CONFIG.SANDBOX_URL : PESAPAL_CONFIG.BASE_URL;
    
    console.log('Requesting token from:', `${baseUrl}/api/Auth/RequestToken`);
    
    const authResponse = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: PESAPAL_CONFIG.CONSUMER_KEY,
        consumer_secret: PESAPAL_CONFIG.CONSUMER_SECRET
      })
    });

    const authData = await authResponse.json();
    
    if (!authResponse.ok || !authData.token) {
      console.error('Auth error:', authData);
      return res.status(500).json({ error: 'Failed to authenticate with PesaPal' });
    }

    const token = authData.token;
    console.log('Got auth token');

    const orderRequest = {
      id: `REG_${userId}_${Date.now()}`.substring(0, 50),
      currency: 'UGX',
      amount: amount,
      description: 'Brick Foundation Registration Fee',
      callback_url: callbackUrl,
      notification_id: 'brickfoundation_reg',
      billing_phone: formattedPhone,
      billing_email: email,
      billing_first_name: firstName,
      billing_last_name: lastName,
      billing_address_1: 'Kampala',
      billing_city: 'Kampala',
      billing_state: 'Kampala',
      billing_postal: '256',
      billing_country_code: 'UG'
    };

    console.log('Sending order request to PesaPal');

    const orderResponse = await fetch(`${baseUrl}/api/Transactions/Submit`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderRequest)
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok || !orderData.redirect_url) {
      console.error('Order error:', orderData);
      return res.status(500).json({ error: 'Failed to create payment order' });
    }

    return res.status(200).json(orderData);
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
