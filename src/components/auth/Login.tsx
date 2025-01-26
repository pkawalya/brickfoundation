import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { AuthLayout } from './AuthLayout';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PasswordInput } from '../common/PasswordInput';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, loading: authLoading } = useAuthStore();
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

      await signIn(email.trim().toLowerCase(), password);
      console.log('Login successful, navigating to dashboard'); // Debug log
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error); // Debug log
      
      const errorMessage = error?.message || error?.error_description || 'An error occurred while signing in';
      
      if (errorMessage.includes('Email not confirmed')) {
        setMessage({
          type: 'error',
          text: 'Please verify your email address before signing in. Check your inbox for the verification link.'
        });
      } else if (errorMessage.includes('Invalid login credentials')) {
        setMessage({
          type: 'error',
          text: 'Invalid email or password. Please try again.'
        });
      } else {
        setMessage({
          type: 'error',
          text: errorMessage
        });
      }
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
            message.type === 'success' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm">{message.text}</p>
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
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || authLoading ? (
              <LoadingSpinner className="w-5 h-5" />
            ) : (
              'Sign in'
            )}
          </button>
        </div>

        <div className="text-sm text-center">
          <span className="text-gray-600">Don't have an account?</span>{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
