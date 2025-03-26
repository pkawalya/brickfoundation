import React, { useEffect, useState } from 'react';
import { ReferralService, ReferralLink } from '../lib/referralService';
import { PaymentService } from '../lib/paymentService';
import { useAuthStore } from '../store/auth';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Share2, Copy, CheckCircle, RefreshCw, Users, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function MyReferrals() {
  const { user } = useAuthStore();
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActivePayment, setHasActivePayment] = useState(false);
  const [copiedLinks, setCopiedLinks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('Please log in to view your referrals');
        return;
      }

      const [links, latestPayment] = await Promise.all([
        ReferralService.getReferralLinks(),
        PaymentService.getLatestPayment(user.id)
      ]);

      setReferralLinks(links);
      setHasActivePayment(!!latestPayment && latestPayment.status === 'successful');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleGetMoreLinks = async () => {
    try {
      setLoading(true);
      const newLinks = await ReferralService.createReferralLinks(3);
      setReferralLinks(newLinks);
      toast.success('Successfully created new referral links!');
    } catch (err) {
      console.error('Error creating referral links:', err);
      toast.error('Failed to create new referral links');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      const baseUrl = window.location.origin;
      const referralUrl = `${baseUrl}/signup?ref=${code}`;
      await navigator.clipboard.writeText(referralUrl);
      
      setCopiedLinks(prev => ({ ...prev, [code]: true }));
      toast.success('Referral link copied!');
      
      setTimeout(() => {
        setCopiedLinks(prev => ({ ...prev, [code]: false }));
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareLink = async (code: string) => {
    try {
      const baseUrl = window.location.origin;
      const referralUrl = `${baseUrl}/signup?ref=${code}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Join The Brick Foundation',
          text: 'Join me on The Brick Foundation and let\'s build together!',
          url: referralUrl,
        });
        toast.success('Thanks for sharing!');
      } else {
        await copyToClipboard(code);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Failed to share link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-medium text-gray-900">Error Loading Referrals</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Referral Program
            </h1>
            <p className="mt-4 text-xl text-indigo-100">
              Share The Brick Foundation with friends and earn rewards
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Section */}
        <div className="mb-12">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
              <dt>
                <div className="absolute bg-indigo-500 rounded-md p-3">
                  <LinkIcon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">Active Links</p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{referralLinks.length}</p>
              </dd>
            </div>
          </dl>
        </div>

        {/* Referral Links Section */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Your Referral Links</h2>
              {hasActivePayment && (
                <button
                  onClick={handleGetMoreLinks}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Get More Links
                </button>
              )}
            </div>

            {referralLinks.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active referral links</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {hasActivePayment 
                    ? 'Get started by creating your first referral link.'
                    : 'Make a payment to activate your referral program.'}
                </p>
                {hasActivePayment ? (
                  <button
                    onClick={handleGetMoreLinks}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Referral Links
                  </button>
                ) : (
                  <Link
                    to="/dashboard/payments"
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Make Payment
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {referralLinks.map((link) => (
                  <div
                    key={link.id}
                    className="relative group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Referral Link {link.code}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Created {new Date(link.created_at).toLocaleDateString()}
                        </p>
                        <div className="bg-gray-50 rounded-md p-3 mb-4">
                          <p className="text-sm font-mono text-gray-600 break-all">
                            {`${window.location.origin}/signup?ref=${link.code}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => copyToClipboard(link.code)}
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {copiedLinks[link.code] ? (
                            <><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Copied</>
                          ) : (
                            <><Copy className="h-4 w-4 mr-2" /> Copy</>
                          )}
                        </button>
                        <button
                          onClick={() => shareLink(link.code)}
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Share2 className="h-4 w-4 mr-2" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
