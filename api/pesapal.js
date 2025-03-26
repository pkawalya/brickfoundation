import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const PESAPAL_CONFIG = {
  CONSUMER_KEY: process.env.PESAPAL_CONSUMER_KEY || 'CmDBcSQcP3p4krrNNb7ufrUn7qK6j2us',
  CONSUMER_SECRET: process.env.PESAPAL_CONSUMER_SECRET || '6am5uuDHalbrInizsE6Aonoyfq8=',
  BASE_URL: 'https://pay.pesapal.com/v3',
  SANDBOX_URL: 'https://cybqa.pesapal.com/pesapalv3',
  IS_SANDBOX: true
};

// Get PesaPal auth token
async function getPesapalAuthToken() {
  try {
    const baseUrl = PESAPAL_CONFIG.IS_SANDBOX ? PESAPAL_CONFIG.SANDBOX_URL : PESAPAL_CONFIG.BASE_URL;
    
    console.log('Requesting token from:', `${baseUrl}/api/Auth/RequestToken`);
    
    const response = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
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

    const responseText = await response.text();
    console.log('Raw auth response:', responseText);

    if (!response.ok) {
      console.error('Auth error response:', responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed auth response:', data);

      if (!data.token) {
        console.error('No token in response:', data);
        throw new Error('Invalid auth response');
      }

      return data.token;
    } catch (e) {
      console.error('Failed to parse auth response:', e);
      throw new Error('Invalid auth response format');
    }
  } catch (error) {
    console.error('PesaPal auth error:', error);
    throw error;
  }
}

// Create PesaPal order
router.post('/create-order', async (req, res) => {
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

    console.log('Received order request:', {
      userId,
      email,
      phone,
      firstName,
      lastName,
      amount,
      callbackUrl
    });

    // Format phone number
    const formattedPhone = phone.startsWith('0') 
      ? `256${phone.substring(1)}` 
      : phone.startsWith('256') 
        ? phone 
        : `256${phone}`;

    console.log('Formatted phone:', formattedPhone);

    // Get auth token
    const token = await getPesapalAuthToken();
    console.log('Got auth token:', token);

    const baseUrl = PESAPAL_CONFIG.IS_SANDBOX ? PESAPAL_CONFIG.SANDBOX_URL : PESAPAL_CONFIG.BASE_URL;

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

    console.log('Sending order request:', orderRequest);
    console.log('To URL:', `${baseUrl}/api/Transactions/Submit`);

    const response = await fetch(`${baseUrl}/api/Transactions/Submit`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderRequest)
    });

    const responseText = await response.text();
    console.log('Raw order response:', responseText);

    if (!response.ok) {
      console.error('Order error response:', responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed order response:', data);

      if (!data.redirect_url) {
        console.error('No redirect URL in response:', data);
        throw new Error('Invalid order response');
      }

      res.json(data);
    } catch (e) {
      console.error('Failed to parse order response:', e);
      throw new Error('Invalid order response format');
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
