import React from 'react';
import { Link } from 'react-router-dom';
import { gradients } from '../utils/colors';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-12 w-12" />
            <span className="ml-3 text-2xl font-bold text-gray-900">The Brick</span>
          </Link>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
          <h2 className="text-3xl font-bold text-gray-900">Page not found</h2>
          <p className="text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          
          <div className="mt-8">
            <Link
              to="/"
              className={`${
                gradients.button
              } inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white shadow-sm ${
                gradients.buttonHover
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              Go back home
            </Link>
          </div>
          
          <div className="mt-6 text-base text-gray-500">
            Need help?{' '}
            <Link to="/contact" className="text-indigo-600 font-medium hover:text-indigo-500">
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
