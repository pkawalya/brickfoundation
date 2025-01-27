import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { ReferralService, Referral } from '../lib/referralService';
import {
  Users,
  UserPlus,
  Mail,
  Share2,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

export default function MyReferrals() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralEmail, setReferralEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReferrals();
  }, [user, navigate]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const data = await ReferralService.getReferralTree();
      setReferrals(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralEmail) return;

    try {
      setSubmitting(true);
      setError(null);

      const result = await ReferralService.createReferral(referralEmail);
      if (result.success) {
        await fetchReferrals();
        setReferralEmail('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error creating referral:', err);
      setError(err instanceof Error ? err.message : 'Failed to create referral');
    } finally {
      setSubmitting(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      if (!user) return;
      const link = ReferralService.generateReferralLink(user.id);
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copying link:', err);
      setError('Failed to copy referral link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Invite friends and track your referrals
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Referral</h2>
            <form onSubmit={handleCreateReferral} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={referralEmail}
                      onChange={(e) => setReferralEmail(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md pl-10 sm:text-sm border-gray-300"
                      placeholder="friend@example.com"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Clock className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Invite
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700">Share Your Referral Link</h3>
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={copyReferralLink}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      Copy Link
                    </>
                  )}
                </button>
                {navigator.share && (
                  <button
                    onClick={() => ReferralService.shareReferralLink('share')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Referrals</h2>
            {referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referred User
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rewards
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.map((referral) => (
                      <tr key={referral.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {referral.referred_user ? (
                            <>
                              <div className="font-medium">{referral.referred_user.full_name}</div>
                              <div className="text-gray-500">{referral.referred_user.email}</div>
                            </>
                          ) : (
                            <div className="text-gray-500">Pending Invitation</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              referral.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : referral.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {referral.status === 'active' ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : referral.status === 'pending' ? (
                              <Clock className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${referral.total_rewards.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start inviting friends to join the platform.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
