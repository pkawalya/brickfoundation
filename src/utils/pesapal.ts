import { PESAPAL_CONFIG } from '../config/pesapal';

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: string;
}

interface PesapalOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number: string;
    first_name: string;
    last_name: string;
  };
  payment_method: string;
  account_number: string;
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: string;
}

export async function getPesapalAuthToken(): Promise<string> {
  try {
    const response = await fetch(`${PESAPAL_CONFIG.BASE_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: PESAPAL_CONFIG.CONSUMER_KEY,
        consumer_secret: PESAPAL_CONFIG.CONSUMER_SECRET
      })
    });

    const data: PesapalAuthResponse = await response.json();
    
    if (data.error || !data.token) {
      throw new Error(data.error || 'Failed to get auth token');
    }

    return data.token;
  } catch (error) {
    console.error('PesaPal auth error:', error);
    throw error;
  }
}

export async function createPesapalOrder(
  userId: string,
  email: string,
  phone: string,
  firstName: string,
  lastName: string
): Promise<string> {
  try {
    // First get the auth token
    const token = await getPesapalAuthToken();

    // Format phone number for mobile money
    // Remove leading 0 and add country code if needed
    const formattedPhone = phone.startsWith('0') 
      ? `256${phone.substring(1)}` 
      : phone.startsWith('256') 
        ? phone 
        : `256${phone}`;

    const orderRequest: PesapalOrderRequest = {
      id: `REG_${userId}_${Date.now()}`, // Unique order ID
      currency: PESAPAL_CONFIG.CURRENCY,
      amount: PESAPAL_CONFIG.REGISTRATION_FEE,
      description: 'Brick Foundation Registration Fee',
      callback_url: PESAPAL_CONFIG.CALLBACK_URL,
      notification_id: PESAPAL_CONFIG.IPN_ID,
      billing_address: {
        email_address: email,
        phone_number: formattedPhone,
        first_name: firstName,
        last_name: lastName
      },
      payment_method: 'MOBILE_MONEY', // Specify mobile money as payment method
      account_number: formattedPhone // Use phone number as account number
    };

    const response = await fetch(`${PESAPAL_CONFIG.BASE_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderRequest)
    });

    const data: PesapalOrderResponse = await response.json();

    if (data.error || !data.redirect_url) {
      throw new Error(data.error || 'Failed to create order');
    }

    return data.redirect_url;
  } catch (error) {
    console.error('PesaPal order error:', error);
    throw error;
  }
}
