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
  billing_phone: string;
  billing_email: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_address_1: string;
  billing_city: string;
  billing_state: string;
  billing_postal: string;
  billing_country_code: string;
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: string;
  error_description?: string;
}

export async function createPesapalOrder(
  userId: string,
  email: string,
  phone: string,
  firstName: string,
  lastName: string
): Promise<string> {
  try {
    const response = await fetch('/api/pesapal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        email,
        phone,
        firstName,
        lastName,
        amount: PESAPAL_CONFIG.REGISTRATION_FEE,
        callbackUrl: PESAPAL_CONFIG.CALLBACK_URL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PesaPal API error:', errorText);
      throw new Error('Failed to create payment order');
    }

    const data: PesapalOrderResponse = await response.json();
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
