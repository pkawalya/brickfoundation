import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AuthLayout } from './AuthLayout';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PasswordInput } from '../common/PasswordInput';
import { validatePassword } from '../../utils/passwordValidation';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user makes changes
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('All fields are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting registration process...'); // Debug log

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });

      console.log('Auth registration response:', { authData, authError }); // Debug log

      if (authError) {
        console.error('Auth error:', authError); // Debug log
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from auth');
      }

      // Sign out the user since we want them to verify their email first
      await supabase.auth.signOut();

      // Navigate to login page with success message
      navigate('/login?registered=true');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.message || error?.error_description || 'An error occurred during registration';
      
      if (errorMessage.includes('already registered')) {
        setError('This email is already registered. Please sign in or use a different email.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started with your free account"
      type="register"
    >
      <form onSubmit={handleRegister} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName')(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                  shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                  focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="lastName"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName')(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                  shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                  focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email')(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={formData.password}
          onChange={handleInputChange('password')}
          showStrengthMeter
          autoComplete="new-password"
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          autoComplete="new-password"
        />

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
              'Create account'
            )}
          </button>
        </div>

        <div className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
