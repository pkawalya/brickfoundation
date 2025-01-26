import { NextApiRequest, NextApiResponse } from 'next';
import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY!,
  process.env.FLW_SECRET_KEY!,
  process.env.FLW_ENCRYPTION_KEY
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, email, phone, name } = req.body;
    const tx_ref = 'BF-' + Date.now();

    const payload = {
      tx_ref,
      amount,
      currency: 'UGX',
      payment_options: 'card,mobilemoney,ussd',
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      meta: {
        consumer_id: 23,
        consumer_mac: "92a3-912ba-1192a"
      },
      customer: {
        email,
        phonenumber: phone,
        name,
      },
      customizations: {
        title: 'Brick Foundation Referral Activation',
        description: 'Activate your referral links',
        logo: 'https://brickfoundations.com/logo.png'
      }
    };

    // Initialize payment
    const response = await flw.Charge.card(payload);
    
    if (response.status === 'error') {
      console.error('Payment initialization failed:', response);
      return res.status(400).json({ 
        message: response.message || 'Payment initialization failed'
      });
    }

    // Store the transaction reference
    const { data: { link } } = response;
    
    return res.status(200).json({ 
      payment_link: link,
      tx_ref 
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({ 
      message: 'Error initializing payment',
      error: error.message 
    });
  }
}
