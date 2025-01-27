import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth';
import { ReferralService, ReferralLink, ReferralStats } from '../../../lib/referralService';

export default function Referrals() {
  const { user } = useAuthStore();
  const [referrals, setReferrals] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingLink, setCreatingLink] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalClicks: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadReferrals();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadReferrals = async () => {
    try {
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }

      setLoading(true);
      setError('');

      const [links, referralStats] = await Promise.all([
        ReferralService.getReferralLinks(user.id),
        ReferralService.getReferralStats(user.id)
      ]);

      setReferrals(links);
      setStats(referralStats);
    } catch (error) {
      console.error('Error loading referrals:', error);
      setError('Failed to load your referral links');
    } finally {
      setLoading(false);
    }
  };

  const createReferralLink = async () => {
    try {
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }

      setCreatingLink(true);
      setError('');

      const result = await ReferralService.createReferralLink(user.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      await loadReferrals();
    } catch (error) {
      console.error('Error creating referral link:', error);
      setError('Failed to create referral link');
    } finally {
      setCreatingLink(false);
    }
  };

  const shareLink = async (code: string, method: 'email' | 'copy' | 'share') => {
    const result = await ReferralService.shareReferralLink(code, method);
    if (result.success) {
      alert(result.message);
    } else {
      alert('Failed to share link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">My Referrals</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage your referral links
          </p>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Total Links</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Active Links</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.active}</dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Inactive Links</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-600">{stats.inactive}</dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Total Clicks</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.totalClicks}</dd>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={createReferralLink}
                disabled={creatingLink}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {creatingLink ? 'Creating...' : 'Create New Referral Link'}
              </button>
            </div>

            <div className="mt-8">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Code
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Clicks
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {referrals.map((referral) => (
                            <tr key={referral.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {referral.code}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  referral.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {referral.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {referral.clicks}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(referral.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => shareLink(referral.code, 'copy')}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                  Copy
                                </button>
                                <button
                                  onClick={() => shareLink(referral.code, 'email')}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                  Email
                                </button>
                                <button
                                  onClick={() => shareLink(referral.code, 'share')}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Share
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
