import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import AuthLayout from './AuthLayout';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (!showOTP) {
        // First step: Store credentials and send OTP
        const emailInput = formData.get('email') as string;
        const passwordInput = formData.get('password') as string;
        
        setEmail(emailInput);
        setPassword(passwordInput);

        // Send OTP
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: emailInput,
          options: {
            shouldCreateUser: false,
          },
        });

        if (otpError) throw otpError;

        setShowOTP(true);
        setError(null);
      } else {
        // Second step: Verify OTP and sign in
        const otpInput = formData.get('otp') as string;

        // Verify OTP
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otpInput,
          type: 'email',
        });

        if (verifyError) throw verifyError;

        // After OTP verification, proceed with password login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (!data.user?.email_confirmed_at) {
          await supabase.auth.signOut();
          throw new Error('Please verify your email first.');
        }

        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>

        {message && (
          <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!showOTP ? (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter the code sent to your email"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the verification code sent to {email}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setEmail('');
                  setPassword('');
                }}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
              >
                Use a different email
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : (showOTP ? 'Verify Code' : 'Send Code')}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
