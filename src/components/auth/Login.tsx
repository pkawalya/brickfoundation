import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AuthLayout } from './AuthLayout';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PasswordInput } from '../common/PasswordInput';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Check for reset success message
  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setMessage({
        type: 'success',
        text: 'Password has been reset successfully. Please sign in with your new password.'
      });
    } else if (searchParams.get('registered') === 'true') {
      setMessage({
        type: 'success',
        text: 'Registration successful! Please check your email to verify your account before signing in.'
      });
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      console.log('Attempting login with:', { email }); // Debug log

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('Login response:', { data, error }); // Debug log

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setMessage({
            type: 'error',
            text: 'Please verify your email address before signing in. Check your inbox for the verification link.'
          });
        } else if (error.message.includes('Invalid login credentials')) {
          setMessage({
            type: 'error',
            text: 'Invalid email or password. Please try again.'
          });
        } else {
          console.error('Login error:', error); // Debug log
          setMessage({
            type: 'error',
            text: 'An error occurred while signing in. Please try again.'
          });
        }
        return;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        setMessage({
          type: 'error',
          text: 'Please verify your email address before signing in. Check your inbox for the verification link.'
        });
        return;
      }

      // Successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Unexpected error:', error); // Debug log
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      type="login"
    >
      <form onSubmit={handleLogin} className="space-y-6">
        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        )}

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
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

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

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
              shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              'Sign in'
            )}
          </button>
        </div>

        <div className="text-sm text-center">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
