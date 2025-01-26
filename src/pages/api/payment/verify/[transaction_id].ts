import { NextApiRequest, NextApiResponse } from 'next';
import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY!,
  process.env.FLW_SECRET_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { transaction_id } = req.query;

    const response = await flw.Transaction.verify({ id: transaction_id as string });
    
    if (response.data.status === 'successful' 
        && response.data.currency === 'UGX'
        && response.data.amount >= 90000) {
      return res.status(200).json({
        status: 'successful',
        transaction_id: response.data.id,
        amount: response.data.amount
      });
    } else {
      return res.status(400).json({
        status: 'failed',
        message: 'Payment verification failed or amount is incorrect'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      message: 'Error verifying payment' 
    });
  }
}
