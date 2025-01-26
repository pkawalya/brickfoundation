import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/auth';
import { PaymentService } from '../../lib/paymentService';
import { ReferralService } from '../../lib/referralService';

export default function PaymentCallback() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');
  const [referralCodes, setReferralCodes] = useState<string[]>([]);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const { tx_ref, status: txStatus } = router.query;

        if (!tx_ref || !user) {
          console.error('Invalid payment callback:', { tx_ref, user });
          setStatus('error');
          setMessage('Invalid payment session');
          return;
        }

        console.log('Verifying payment:', { tx_ref, txStatus });

        // Verify the payment
        const paymentResult = await PaymentService.verifyPayment(tx_ref as string);

        if (paymentResult.status === 'success' && paymentResult.flw_tx_id && paymentResult.flw_tx_ref) {
          console.log('Payment verified successfully:', paymentResult);

          // Record the payment
          await PaymentService.recordPayment(
            user.id, 
            paymentResult.flw_tx_id,
            paymentResult.flw_tx_ref,
            90000
          );

          // Activate referral links
          const result = await ReferralService.activateReferralLinks(user.id);
          setReferralCodes(result.referralCodes);

          setStatus('success');
          setMessage('Payment successful! Your referral links have been activated.');
        } else {
          console.error('Payment verification failed:', paymentResult);
          setStatus('error');
          setMessage(paymentResult.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Error in payment callback:', error);
        setStatus('error');
        setMessage('An error occurred while processing your payment');
      }
    };

    if (router.isReady) {
      verifyPayment();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
            )}
            
            {status === 'success' && (
              <div className="rounded-full h-12 w-12 bg-green-100 text-green-500 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="rounded-full h-12 w-12 bg-red-100 text-red-500 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}

            <h2 className="mt-4 text-lg font-medium text-gray-900">{message}</h2>

            {status === 'success' && referralCodes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Your Referral Codes:</h3>
                <div className="mt-2 space-y-2">
                  {referralCodes.map((code, index) => (
                    <div
                      key={code}
                      className="bg-gray-50 px-4 py-2 rounded-md text-sm font-mono text-gray-900"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
