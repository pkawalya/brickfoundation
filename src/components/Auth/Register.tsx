import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import AuthLayout from './AuthLayout';
import { checkRateLimit, setRateLimit, formatTimeLeft } from '../../utils/rateLimiting';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      if (!showOTP) {
        const emailInput = formData.get('email') as string;
        const passwordInput = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const phoneInput = formData.get('phone') as string;

        if (passwordInput !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        if (!phoneInput || phoneInput.length !== 10 || !/^\d+$/.test(phoneInput)) {
          setError('Please enter a valid 10-digit phone number');
          return;
        }

        // Check rate limit before sending
        const { canSend, timeLeft } = checkRateLimit();
        if (!canSend) {
          setTimeLeft(timeLeft);
          throw new Error(formatTimeLeft(timeLeft));
        }

        // First step: Sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: emailInput,
          password: passwordInput,
          options: {
            emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`,
            data: {
              email_confirmed: false,
              phone: phoneInput
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('rate limit')) {
            setRateLimit();
            throw new Error('Too many attempts. Please try again in 60 seconds.');
          }
          throw signUpError;
        }

        // Store in users table
        if (signUpData.user) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: signUpData.user.id,
                email: emailInput,
                phone: phoneInput
              }
            ]);

          if (insertError) throw insertError;
        }

        // Set rate limit after successful send
        setRateLimit();
        
        // Store credentials
        setEmail(emailInput);
        setPassword(passwordInput);
        setPhone(phoneInput);
        setShowOTP(true);
      } else {
        // Verify OTP
        const otpInput = formData.get('otp') as string;
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otpInput,
          type: 'email'
        });

        if (verifyError) throw verifyError;

        // Navigate to login
        navigate('/login', { 
          state: { 
            message: 'Registration successful! You can now log in.' 
          }
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!showOTP ? (
            <>
              {/* Email field */}
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
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Phone field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  pattern="[0-9]{10}"
                  placeholder="0712345678"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a 10-digit phone number without spaces or special characters
                </p>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Confirm Password field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
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
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
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
                  setPhone('');
                }}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
              >
                Use different details
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : showOTP ? 'Verify Code' : 'Create Account'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
