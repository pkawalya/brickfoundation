import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { ReferralService, ReferralLink } from '../lib/referralService';
import { PaymentService } from '../lib/paymentService';
import { Link as LinkIcon, Users, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MyReferrals() {
  const { user } = useAuthStore();
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActivePayment, setHasActivePayment] = useState(false);
  const [copiedLinks, setCopiedLinks] = useState<Record<string, boolean>>({});
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          setError('Please log in to view your referrals');
          return;
        }

        // Fetch data in parallel
        const [links, latestPayment] = await Promise.all([
          ReferralService.getReferralLinks().catch(err => {
            console.error('Error fetching referral links:', err);
            throw new Error('Failed to load referral links');
          }),
          PaymentService.getLatestPayment(user.id).catch(err => {
            console.error('Error fetching payment status:', err);
            throw new Error('Failed to check payment status');
          })
        ]);

        setReferralLinks(links || []);
        setHasActivePayment(!!latestPayment && latestPayment.status === 'successful');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load referral data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    toast.promise(
      new Promise((resolve) => {
        setLoading(true);
        setTimeout(resolve, 500); // Give UI time to show loading state
      }),
      {
        loading: 'Retrying...',
        success: 'Retrying to load data',
        error: 'Failed to retry'
      }
    );
  };

  const copyToClipboard = async (code: string) => {
    try {
      const baseUrl = window.location.origin;
      const referralUrl = `${baseUrl}/signup?ref=${code}`;
      await navigator.clipboard.writeText(referralUrl);
      
      setCopiedLinks(prev => ({ ...prev, [code]: true }));
      toast.success('Referral link copied to clipboard!');
      
      setTimeout(() => {
        setCopiedLinks(prev => ({ ...prev, [code]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy referral link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Referral Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Invite friends and track your referrals
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
                <div>
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Quick Stats */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <LinkIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Links
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {referralLinks.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Referral Links Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Your Referral Links</h2>
                {referralLinks.length > 0 && hasActivePayment && (
                  <Link
                    to="/dashboard/get-referral-links"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Get More Links
                  </Link>
                )}
              </div>
              
              {referralLinks.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {referralLinks.map((link) => (
                      <li key={link.id} className="hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <LinkIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-indigo-600">
                                  {window.location.origin}/signup?ref={link.code}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Created {new Date(link.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                              <button
                                onClick={() => copyToClipboard(link.code)}
                                className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                title="Copy referral link"
                              >
                                {copiedLinks[link.code] ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-12 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                  <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No referral links</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Make a payment of UGX 90,000 to activate your referral links.
                  </p>
                  {!hasActivePayment && (
                    <div className="mt-6">
                      <Link
                        to="/dashboard/get-referral-links"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Get Referral Links
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Your Referrals Section */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Referrals</h2>
              
              <div className="text-center py-12 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals yet</h3>
                {referralLinks.length === 0 ? (
                  <p className="mt-1 text-sm text-gray-500">
                    You need to make a payment of UGX 90,000 to activate your referral links before you can create referrals.
                  </p>
                ) : (
                  <div className="mt-1 space-y-2">
                    <p className="text-sm text-gray-500">
                      Share your referral links with friends to start earning rewards.
                    </p>
                    <p className="text-sm text-gray-500">
                      When someone signs up using your link, they'll appear here.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
