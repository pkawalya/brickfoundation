import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { AuthLayout } from './AuthLayout';

export function PaymentRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        const orderTrackingId = searchParams.get('OrderTrackingId');
        const merchantReference = searchParams.get('OrderMerchantReference');
        const orderNotificationId = searchParams.get('OrderNotificationId');

        if (!orderTrackingId || !merchantReference) {
          throw new Error('Invalid payment response');
        }

        // Extract user ID from merchant reference (REG_userId_timestamp)
        const userId = merchantReference.split('_')[1];

        if (!userId) {
          throw new Error('Invalid merchant reference');
        }

        // Update user's payment status in the database
        const { error: updateError } = await supabase
          .from('users')
          .update({
            payment_status: 'completed',
            payment_reference: orderTrackingId,
            payment_date: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) throw updateError;

        // Navigate to login with success message
        navigate('/login', {
          state: {
            message: 'Registration and payment successful! You can now log in.'
          }
        });
      } catch (error: any) {
        console.error('Payment callback error:', error);
        setError(error.message || 'Failed to process payment');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentCallback();
  }, [searchParams, navigate]);

  return (
    <AuthLayout type="payment">
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        {loading ? (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Processing Payment
            </h3>
            <p style={{ color: '#6B7280' }}>
              Please wait while we confirm your payment...
            </p>
          </div>
        ) : error ? (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#B91C1C', marginBottom: '1rem' }}>
              Payment Error
            </h3>
            <p style={{ color: '#B91C1C', marginBottom: '1rem' }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4F46E5',
                color: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
}
