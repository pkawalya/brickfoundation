import { supabase } from '../config/supabaseClient';

interface PaymentResponse {
  status: 'success' | 'failed';
  flw_tx_id?: string;
  flw_tx_ref?: string;
  payment_link?: string;
  error?: string;
}

interface PaymentMetadata {
  payment_type: 'referral_activation';
  processed_at?: string;
}

interface Payment {
  id: string;
  user_id: string;
  flw_tx_id: string;
  flw_tx_ref: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  provider: 'flutterwave';
  metadata: PaymentMetadata;
  created_at: string;
  updated_at: string;
}

class PaymentServiceClass {
  private async getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }

  async initializePayment(amount: number, email: string, phone: string, name: string): Promise<PaymentResponse> {
    try {
      console.log('Initializing payment:', { amount, email, phone, name });
      
      // Validate input
      if (amount < 90000) {
        throw new Error('Minimum payment amount is UGX 90,000');
      }

      if (!email || !phone || !name) {
        throw new Error('Email, phone, and name are required');
      }

      const tx_ref = 'BF-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

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
          tx_ref,
          redirect_url: window.location.origin + '/dashboard/referrals',
          payment_options: 'card,mobilemoney,ussd',
          meta: {
            payment_type: 'referral_activation',
            user_id: await this.getCurrentUserId()
          }
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Payment initialization failed:', data);
        return {
          status: 'failed',
          error: data.message || 'Failed to initialize payment'
        };
      }
      
      console.log('Payment initialized:', data);
      return {
        status: 'success',
        payment_link: data.data.link,
        flw_tx_ref: tx_ref
      };
    } catch (error) {
      console.error('Error initializing payment:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to initialize payment'
      };
    }
  }

  async verifyPayment(tx_ref: string): Promise<PaymentResponse> {
    try {
      console.log('Verifying payment:', tx_ref);
      
      // Check local payment status first
      const { data: localPayment, error: localError } = await supabase
        .from('payments')
        .select('status, flw_tx_id')
        .eq('flw_tx_ref', tx_ref)
        .single();

      if (localPayment?.status === 'completed') {
        return {
          status: 'success',
          flw_tx_id: localPayment.flw_tx_id,
          flw_tx_ref: tx_ref
        };
      }

      // Verify with Flutterwave
      const response = await fetch(`/api/payment/verify/${tx_ref}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Payment verification failed:', data);
        return {
          status: 'failed',
          error: data.message || 'Payment verification failed'
        };
      }

      if (data.status === 'successful' && data.amount >= 90000) {
        return {
          status: 'success',
          flw_tx_id: data.id,
          flw_tx_ref: tx_ref
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
        error: error instanceof Error ? error.message : 'Failed to verify payment'
      };
    }
  }

  async getPaymentHistory(): Promise<Payment[]> {
    try {
      const userId = await this.getCurrentUserId();
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  async getLatestPayment(): Promise<Payment | null> {
    try {
      const userId = await this.getCurrentUserId();
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No payment found
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting latest payment:', error);
      throw error;
    }
  }
}

export const PaymentService = new PaymentServiceClass();
