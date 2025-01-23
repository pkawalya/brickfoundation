import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Gift, ArrowRight } from 'lucide-react';
import { Logo } from '../common/Logo';
import { gradients } from '../../utils/colors';

export function LandingPage() {
  return (
    <div className={`min-h-screen ${gradients.hero}`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/auth-pattern.svg')] opacity-5"></div>
      </div>

      <nav className="relative bg-transparent py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Logo variant="light" className="transform hover:scale-105 transition-transform duration-200" />
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link
                to="/login"
                className="text-sm font-medium text-white hover:text-indigo-200 transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium 
                  rounded-full text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-200 
                  shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-white">
            <span className="block">Build Your Future</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400">
              Brick by Brick
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-indigo-200 md:mt-5 md:max-w-3xl">
            Join our community-driven platform where every referral builds your success. 
            Start earning today with our innovative referral program.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-x-6">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent 
                text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-indigo-500 
                hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-500/25 
                hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/20 
                text-base font-medium rounded-full text-white hover:bg-white/10 
                transition-all duration-200 hover:scale-105 hover:border-white/30"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8">
              <p className="text-3xl sm:text-4xl font-bold text-white">2,000+</p>
              <p className="mt-2 text-indigo-200">Active Members</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8">
              <p className="text-3xl sm:text-4xl font-bold text-white">UGX 90M+</p>
              <p className="mt-2 text-indigo-200">Total Earnings</p>
            </div>
            <div className="hidden lg:block bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8">
              <p className="text-3xl sm:text-4xl font-bold text-white">24/7</p>
              <p className="mt-2 text-indigo-200">Support Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-16 sm:py-24 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Choose The Brick?
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-indigo-200">
              Build your financial future with our proven system
            </p>
          </div>

          <div className="mt-12 sm:mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Building2,
                  title: 'Solid Foundation',
                  description: 'Built on trust and transparency, our platform provides a reliable way to grow your network and earnings. Our proven system ensures steady growth and reliable returns for active members.'
                },
                {
                  icon: Users,
                  title: 'Community Driven',
                  description: 'Join a thriving community of entrepreneurs who support and inspire each other. Connect with like-minded individuals, share experiences, and grow together in your journey to financial success.'
                },
                {
                  icon: Gift,
                  title: 'Rewards & Bonuses',
                  description: 'Earn additional rewards through our regular raffles and achievement bonuses. Every referral counts towards your success, with instant UGX 10,000 earnings per beneficiary in your network.'
                }
              ].map((feature, index) => (
                <div key={index} className="relative group h-full">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-25 group-hover:opacity-50 transition-opacity blur-lg" />
                  <div className="relative h-full">
                    <div className="flow-root bg-white/10 rounded-lg px-6 pb-8 backdrop-blur-xl h-full">
                      <div className="-mt-6 flex flex-col h-full">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <feature.icon className="h-6 w-6 text-white" />
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-white tracking-tight">{feature.title}</h3>
                        <p className="mt-5 text-base text-indigo-200 flex-grow">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/5">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <Logo variant="light" className="transform hover:scale-105 transition-transform duration-200" />
            <p className="text-sm sm:text-base text-indigo-200">
              {new Date().getFullYear()} The Brick. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}