import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { PaymentService } from '../lib/paymentService';
import { ReferralService } from '../lib/referralService';
import {
  CreditCard,
  Link as LinkIcon,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Phone,
  Mail,
  User,
} from 'lucide-react';

interface PaymentForm {
  name: string;
  email: string;
  phone: string;
}

export default function GetReferralLinks() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveLinks, setHasActiveLinks] = useState(false);
  const [formData, setFormData] = useState<PaymentForm>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    checkActiveLinks();
  }, [user, navigate]);

  const checkActiveLinks = async () => {
    try {
      const links = await ReferralService.getReferralLinks();
      setHasActiveLinks(links.some(link => link.status === 'active'));
    } catch (err) {
      console.error('Error checking active links:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await PaymentService.initializePayment(
        90000, // Fixed amount for referral links
        formData.email,
        formData.phone,
        formData.name
      );

      if (result.status === 'success' && result.payment_link) {
        // Redirect to Flutterwave payment page
        window.location.href = result.payment_link;
      } else {
        setError(result.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (hasActiveLinks) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Active Referral Links Available
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You already have active referral links. Visit your referrals page to view and manage
                  them.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={() => navigate('/dashboard/referrals')}
                    className="bg-yellow-100 px-3 py-2 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    View My Referrals
                    <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <LinkIcon className="mx-auto h-12 w-12 text-indigo-600" />
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Get Referral Links</h2>
        <p className="mt-2 text-lg text-gray-600">
          Make a one-time payment of UGX 90,000 to activate your referral links
        </p>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900">What You Get</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  3 unique referral links to share with potential members
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Track referral status and rewards in real-time
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Earn rewards for successful referrals
                </p>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="+256 700 000000"
                />
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Amount</p>
                  <p className="text-sm text-gray-500">One-time payment</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">UGX 90,000</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Clock className="animate-spin h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Make Payment
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          By proceeding with the payment, you agree to our terms and conditions regarding referral
          links and rewards.
        </p>
      </div>
    </div>
  );
}
