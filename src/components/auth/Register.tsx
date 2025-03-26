import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { createPesapalOrder } from '../../utils/pesapal';
import { PESAPAL_CONFIG } from '../../config/pesapal';
import { AuthLayout } from './AuthLayout';
import { FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

  useEffect(() => {
    checkPendingPayment();
  }, []);

  const checkPendingPayment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('payment_status')
        .eq('id', user.id)
        .single();

      if (profile?.payment_status === 'pending') {
        setPendingUser(user);
      }
    }
  };

  const handlePayment = async () => {
    if (!pendingUser) return;

    setLoading(true);
    try {
      const redirectUrl = await createPesapalOrder(
        pendingUser.id,
        pendingUser.email,
        pendingUser.user_metadata.phone,
        pendingUser.user_metadata.first_name,
        pendingUser.user_metadata.last_name
      );
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  if (pendingUser) {
    return (
      <AuthLayout type="register">
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
              Complete Your Registration
            </h2>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4B5563' }}>
              Your account is created but payment is pending
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#F3F4F6', 
            padding: '1rem', 
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
              Registration Fee
            </h4>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4F46E5' }}>
              UGX {PESAPAL_CONFIG.REGISTRATION_FEE.toLocaleString()}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Payment will be processed via Mobile Money
            </p>
          </div>

          {error && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.5rem', 
              fontSize: '0.875rem', 
              color: '#B91C1C', 
              backgroundColor: '#FEE2E2', 
              borderRadius: '0.375rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: loading ? '#9CA3AF' : '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            payment_status: 'pending'
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('User creation failed');

      // Create payment order
      const redirectUrl = await createPesapalOrder(
        user.id,
        email,
        phone,
        firstName,
        lastName
      );

      // Redirect to PesaPal
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout type="register">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
            padding: '0.5rem', 
            fontSize: '0.875rem', 
            color: '#B91C1C', 
            backgroundColor: '#FEE2E2', 
            borderRadius: '0.375rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>
                <FaUser size={14} />
              </span>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                placeholder="First name"
                style={{
                  width: '100%',
                  paddingLeft: '2rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.375rem',
                  paddingBottom: '0.375rem',
                  fontSize: '0.875rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>
                <FaUser size={14} />
              </span>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                placeholder="Last name"
                style={{
                  width: '100%',
                  paddingLeft: '2rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.375rem',
                  paddingBottom: '0.375rem',
                  fontSize: '0.875rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem'
                }}
              />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>
              <FaEnvelope size={14} />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              style={{
                width: '100%',
                paddingLeft: '2rem',
                paddingRight: '0.75rem',
                paddingTop: '0.375rem',
                paddingBottom: '0.375rem',
                fontSize: '0.875rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>
              <FaPhone size={14} />
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              pattern="[0-9]{10}"
              placeholder="Mobile Money Number (e.g., 0712345678)"
              style={{
                width: '100%',
                paddingLeft: '2rem',
                paddingRight: '0.75rem',
                paddingTop: '0.375rem',
                paddingBottom: '0.375rem',
                fontSize: '0.875rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>
              <FaLock size={14} />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Password (min. 8 characters)"
              style={{
                width: '100%',
                paddingLeft: '2rem',
                paddingRight: '0.75rem',
                paddingTop: '0.375rem',
                paddingBottom: '0.375rem',
                fontSize: '0.875rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>
              <FaLock size={14} />
            </span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Confirm password"
              style={{
                width: '100%',
                paddingLeft: '2rem',
                paddingRight: '0.75rem',
                paddingTop: '0.375rem',
                paddingBottom: '0.375rem',
                fontSize: '0.875rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem'
              }}
            />
          </div>

          <div style={{ 
            backgroundColor: '#F3F4F6', 
            padding: '0.75rem', 
            borderRadius: '0.375rem',
            marginTop: '0.5rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
              Registration Fee
            </h4>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4F46E5' }}>
              UGX {PESAPAL_CONFIG.REGISTRATION_FEE.toLocaleString()}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Payment will be processed via Mobile Money
            </p>
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
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Processing...' : 'Register & Pay'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
