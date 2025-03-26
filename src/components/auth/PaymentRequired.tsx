import React from 'react';
import { Link } from 'react-router-dom';

export function PaymentRequired() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '32rem',
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1rem'
        }}>
          Payment Required
        </h2>
        <p style={{
          color: '#4B5563',
          marginBottom: '2rem'
        }}>
          Your account registration is not complete. Please complete the payment process to access the dashboard.
        </p>
        <Link
          to="/register"
          style={{
            display: 'inline-block',
            backgroundColor: '#4F46E5',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Complete Registration
        </Link>
      </div>
    </div>
  );
}
