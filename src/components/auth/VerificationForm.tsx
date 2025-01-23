import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { AlertCircle, Mail } from 'lucide-react';

export function VerificationForm() {
  const navigate = useNavigate();
  const { verificationEmail, verifyOTP, resendVerificationEmail, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Redirect if already verified
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // If no verification email is present, check URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam && !verificationEmail) {
      useAuthStore.getState().setVerificationEmail(emailParam);
    }
  }, [verificationEmail]);

  // Show alternative content if no email to verify
  if (!verificationEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Mail className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Email Verification Required
          </h2>
          <p className="mt-2 text-center text-sm text-indigo-200">
            Please check your email for the verification link or return to the registration page.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await verifyOTP(verificationEmail, code);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendVerificationEmail(verificationEmail);
      setError('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <Mail className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Check your email
        </h2>
        <p className="mt-2 text-center text-sm text-indigo-200">
          We sent a verification code to {verificationEmail}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`rounded-md ${error.includes('sent') ? 'bg-green-50' : 'bg-red-50'} p-4`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className={`h-5 w-5 ${error.includes('sent') ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${error.includes('sent') ? 'text-green-800' : 'text-red-800'}`}>{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-white">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white bg-opacity-90"
                  placeholder="Enter verification code"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm font-medium text-white hover:text-indigo-200"
              >
                {resendLoading ? 'Sending...' : "Didn't receive the code? Click to resend"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}