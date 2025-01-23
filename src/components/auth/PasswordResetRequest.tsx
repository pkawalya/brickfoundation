import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AuthLayout } from './AuthLayout';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { rateLimiter } from '../../utils/rateLimiter';

export function PasswordResetRequest() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(true);

  // Check email format in real-time
  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsEmailValid(emailRegex.test(email));
    }
  }, [email]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate email format
    if (!isEmailValid) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid email address'
      });
      return;
    }

    // Check rate limit
    const { allowed, waitTime } = rateLimiter.checkLimit(email.toLowerCase());
    if (!allowed) {
      setMessage({
        type: 'error',
        text: `Too many reset attempts. Please try again in ${rateLimiter.formatWaitTime(waitTime)}.`
      });
      return;
    }

    setIsLoading(true);
    const remaining = rateLimiter.getRemainingAttempts(email.toLowerCase());
    setRemainingAttempts(remaining - 1);

    try {
      // Check if user exists before sending reset email
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (!user) {
        // Don't reveal if email exists or not for security
        setMessage({
          type: 'success',
          text: 'If an account exists with this email, you will receive a password reset link shortly.'
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'If an account exists with this email, you will receive a password reset link shortly.'
      });
      setEmail('');
    } catch (error) {
      // Don't expose specific error messages
      setMessage({
        type: 'error',
        text: 'Unable to process your request. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
      type="login"
    >
      <form onSubmit={handleResetRequest} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border 
                ${!isEmailValid && email ? 'border-red-300' : 'border-gray-300'}
                rounded-md shadow-sm placeholder-gray-400 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                sm:text-sm ${!isEmailValid && email ? 'text-red-900' : ''}`}
              placeholder="you@example.com"
            />
          </div>
          {!isEmailValid && email && (
            <p className="mt-2 text-sm text-red-600">
              Please enter a valid email address
            </p>
          )}
        </div>

        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' ? 'bg-green-50' :
            message.type === 'error' ? 'bg-red-50' : 'bg-blue-50'
          }`}>
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' : 'text-blue-800'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {remainingAttempts !== null && remainingAttempts > 0 && (
          <p className="text-sm text-gray-500">
            {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !isEmailValid}
            className="w-full flex justify-center py-2 px-4 border border-transparent 
              rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              'Send reset link'
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to sign in
            </Link>
          </div>
          <div className="text-sm">
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create an account
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
