import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Gift, TrendingUp, ArrowRight, Box, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <nav className="bg-transparent py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Box className="h-8 w-8 text-white" />
              <span className="ml-2 text-2xl font-bold text-white">The Brick Foundation</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/signin"
                className="text-white hover:text-indigo-200 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Build Your Future</span>
            <span className="block text-indigo-200">Brick by Brick</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-indigo-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Join our community-driven platform where every referral builds your success. Start earning today with our innovative referral program.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 bg-opacity-20 hover:bg-opacity-30 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white bg-opacity-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Why Choose The Brick?
            </h2>
            <p className="mt-4 text-xl text-indigo-200">
              Build your financial future with our proven system
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white bg-opacity-10 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-md shadow-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-white tracking-tight">Solid Foundation</h3>
                    <p className="mt-5 text-base text-indigo-200">
                      Built on trust and transparency, our platform provides a reliable way to grow your network and earnings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white bg-opacity-10 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-md shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-white tracking-tight">Community Driven</h3>
                    <p className="mt-5 text-base text-indigo-200">
                      Join a thriving community of like-minded individuals all working towards financial growth.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white bg-opacity-10 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-md shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-white tracking-tight">Guaranteed Growth</h3>
                    <p className="mt-5 text-base text-indigo-200">
                      Our proven referral system ensures steady growth and reliable returns for active members.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-indigo-200">
              Simple steps to start your journey with The Brick
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10">
              {[
                {
                  id: 1,
                  title: 'Register and Verify',
                  description: 'Create your account and complete the verification process.',
                },
                {
                  id: 2,
                  title: 'Make Your Investment',
                  description: 'Complete your registration with a one-time investment of 90,000 UGX.',
                },
                {
                  id: 3,
                  title: 'Start Referring',
                  description: 'Share your unique referral link and start building your network.',
                },
                {
                  id: 4,
                  title: 'Earn Rewards',
                  description: 'Earn 10,000 UGX for each successful referral in your network.',
                },
              ].map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                      {step.id}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">{step.title}</h3>
                    <p className="mt-2 text-base text-indigo-200">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-white bg-opacity-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Member Benefits
            </h2>
            <p className="mt-4 text-xl text-indigo-200">
              Enjoy exclusive benefits as a member of The Brick
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                'Earn from multiple referral levels',
                'Weekly raffle entries',
                'Community support and networking',
                'Real-time earnings tracking',
                'Secure payment processing',
                'Dedicated support team',
              ].map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-indigo-400" />
                  </div>
                  <p className="ml-3 text-lg text-white">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Start Building?
            </h2>
            <p className="mt-4 text-xl text-indigo-200">
              Join thousands of successful members who are building their future with The Brick
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white bg-opacity-5">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Box className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">The Brick Foundation</span>
            </div>
            <p className="text-base text-indigo-200">
              © {new Date().getFullYear()} The Brick Foundation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}