import { PESAPAL_CONFIG } from '../config/pesapal';

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: string;
  error_description?: string;
}

interface PesapalOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  branch: string;
  channel: string;
  billing_address: {
    email_address: string;
    phone_number: string;
    country_code: string;
    first_name: string;
    last_name: string;
    line_1: string;
    city: string;
    state: string;
    postal_code: string;
  };
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: string;
  error_description?: string;
}

export async function getPesapalAuthToken(): Promise<string> {
  try {
    const baseUrl = PESAPAL_CONFIG.IS_SANDBOX ? PESAPAL_CONFIG.SANDBOX_URL : PESAPAL_CONFIG.BASE_URL;
    
    console.log('Getting auth token from:', `${baseUrl}/api/Auth/RequestToken`);
    
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PesaPal auth error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PesapalAuthResponse = await response.json();
    console.log('Auth response:', data);
    
    if (data.error || !data.token) {
      throw new Error(data.error_description || data.error || 'Failed to get auth token');
    }

    return data.token;
  } catch (error) {
    console.error('PesaPal auth error:', error);
    throw new Error('Failed to authenticate with PesaPal. Please try again later.');
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
    const baseUrl = PESAPAL_CONFIG.IS_SANDBOX ? PESAPAL_CONFIG.SANDBOX_URL : PESAPAL_CONFIG.BASE_URL;

    // Format phone number for mobile money
    // Remove leading 0 and add country code if needed
    const formattedPhone = phone.startsWith('0') 
      ? `256${phone.substring(1)}` 
      : phone.startsWith('256') 
        ? phone 
        : `256${phone}`;

    const orderRequest: PesapalOrderRequest = {
      id: `REG_${userId}_${Date.now()}`.substring(0, 50), // Ensure ID is not too long
      currency: PESAPAL_CONFIG.CURRENCY,
      amount: PESAPAL_CONFIG.REGISTRATION_FEE,
      description: 'Brick Foundation Registration Fee',
      callback_url: PESAPAL_CONFIG.CALLBACK_URL,
      notification_id: PESAPAL_CONFIG.IPN_ID,
      branch: PESAPAL_CONFIG.BRANCH,
      channel: PESAPAL_CONFIG.CHANNEL,
      billing_address: {
        email_address: email,
        phone_number: formattedPhone,
        country_code: 'UG',
        first_name: firstName,
        last_name: lastName,
        line_1: 'Kampala', // Default address line
        city: 'Kampala',
        state: 'Kampala',
        postal_code: '256'
      }
    };

    console.log('Creating order at:', `${baseUrl}/api/Transactions/SubmitOrderRequest`);
    console.log('Order request:', JSON.stringify(orderRequest, null, 2));
    console.log('Auth token:', token);

    const response = await fetch(`${baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderRequest)
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('PesaPal order error response:', responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PesapalOrderResponse = JSON.parse(responseText);
    console.log('Order response:', data);

    if (data.error || !data.redirect_url) {
      throw new Error(data.error_description || data.error || 'Failed to create order');
    }

    return data.redirect_url;
  } catch (error) {
    console.error('PesaPal order error:', error);
    throw new Error('Failed to create payment order. Please try again later.');
  }
}
