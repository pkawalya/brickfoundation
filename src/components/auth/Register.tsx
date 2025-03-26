import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { AuthLayout } from './AuthLayout';

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const emailInput = formData.get('email') as string;
      const passwordInput = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;
      const phoneInput = formData.get('phone') as string;
      const firstNameInput = formData.get('firstName') as string;
      const lastNameInput = formData.get('lastName') as string;

      if (!firstNameInput || !lastNameInput) {
        setError('First name and last name are required');
        return;
      }

      if (passwordInput !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!phoneInput || phoneInput.length !== 10 || !/^\d+$/.test(phoneInput)) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }

      // Sign up with confirmation email
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: emailInput,
        password: passwordInput,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`,
          data: {
            phone: phoneInput,
            first_name: firstNameInput,
            last_name: lastNameInput,
            full_name: `${firstNameInput} ${lastNameInput}`
          }
        }
      });

      if (signUpError) throw signUpError;

      // Store email for reference
      setEmail(emailInput);
      setEmailSent(true);

    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout type="register">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
            Create your account
          </h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4B5563' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4F46E5', fontWeight: '500' }}>
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            fontSize: '0.875rem', 
            color: '#B91C1C', 
            backgroundColor: '#FEE2E2', 
            borderRadius: '0.5rem' 
          }}>
            {error}
          </div>
        )}

        {emailSent ? (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Check your email
            </h3>
            <p style={{ color: '#4B5563', marginBottom: '1rem' }}>
              We've sent a confirmation link to <strong>{email}</strong>
            </p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Click the link in the email to complete your registration. If you don't see it, check your spam folder.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                marginTop: '2rem',
                width: '100%',
                padding: '0.5rem 1rem',
                backgroundColor: '#4F46E5',
                color: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="firstName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  style={{
                    marginTop: '0.25rem',
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <label htmlFor="lastName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  style={{
                    marginTop: '0.25rem',
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                style={{
                  marginTop: '0.25rem',
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="phone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
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
                style={{
                  marginTop: '0.25rem',
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem'
                }}
              />
              <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6B7280' }}>
                Enter a 10-digit phone number without spaces or special characters
              </p>
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                style={{
                  marginTop: '0.25rem',
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                style={{
                  marginTop: '0.25rem',
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                backgroundColor: loading ? '#9CA3AF' : '#4F46E5',
                color: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
