import React from 'react';
import { Link } from 'react-router-dom';
import { gradients } from '../../utils/colors';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand/Logo */}
      <div className={`hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center ${gradients.authLeft}`}>
        <Link to="/" className="flex items-center space-x-3">
          <img src="/logo.svg" alt="Logo" className="h-12 w-12 text-white" />
          <span className="text-2xl font-bold text-white">The Brick</span>
        </Link>
        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-white">Build Your Future</h2>
          <p className="mt-4 text-lg text-indigo-100">Join our community of entrepreneurs</p>
        </div>
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={gradients.pattern}></div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className={`flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 ${gradients.authRight}`}>
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3">
              <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
              <span className="text-xl font-bold text-gray-900">The Brick</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
