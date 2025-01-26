import { supabase } from '../config/supabaseClient';

interface PaymentResponse {
  status: 'success' | 'failed';
  flw_tx_id?: string;
  flw_tx_ref?: string;
  error?: string;
}

export const PaymentService = {
  async initializePayment(amount: number, email: string, phone: string, name: string): Promise<string> {
    try {
      console.log('Initializing payment:', { amount, email, phone, name });
      const tx_ref = 'BF-' + Date.now();

      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          email,
          phone,
          name,
          currency: 'UGX',
          tx_ref
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Payment initialization failed:', data);
        throw new Error(data.message);
      }
      
      console.log('Payment initialized:', data);
      return data.payment_link;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  },

  async verifyPayment(tx_ref: string): Promise<PaymentResponse> {
    try {
      console.log('Verifying payment:', tx_ref);
      const response = await fetch(`/api/payment/verify/${tx_ref}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Payment verification failed:', data);
        throw new Error(data.message);
      }

      console.log('Payment verification response:', data);

      if (data.status === 'successful' && data.amount >= 90000) {
        return {
          status: 'success',
          flw_tx_id: data.id,
          flw_tx_ref: data.tx_ref
        };
      } else {
        return {
          status: 'failed',
          error: 'Payment verification failed or amount is incorrect'
        };
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        status: 'failed',
        error: error.message
      };
    }
  },

  async recordPayment(userId: string, flw_tx_id: string, flw_tx_ref: string, amount: number): Promise<void> {
    try {
      console.log('Recording payment:', { userId, flw_tx_id, flw_tx_ref, amount });
      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          flw_tx_id,
          flw_tx_ref,
          amount,
          currency: 'UGX',
          status: 'completed',
          provider: 'flutterwave',
          metadata: {
            payment_type: 'referral_activation'
          }
        });

      if (error) {
        console.error('Error recording payment:', error);
        throw error;
      }

      console.log('Payment recorded successfully');
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }
};
