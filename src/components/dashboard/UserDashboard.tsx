import React, { useEffect, useState, ErrorBoundary } from 'react';
import {
  Users,
  UserPlus,
  DollarSign,
  TrendingUp,
  Award,
  Star,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { ReferralTree } from './ReferralTree';
import { ReferralTiers } from './ReferralTiers';
import { ReferralShare } from './ReferralShare';
import { ReferralRewards } from './ReferralRewards';
import { ReferralLeaderboard } from './ReferralLeaderboard';
import { ReferralInsights } from './ReferralInsights';
import { ReferralService } from '../../lib/referralService';

export function UserDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    totalRewards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserDashboard: Component mounted');
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      console.log('UserDashboard: Fetching stats...');
      const statsData = await ReferralService.getReferralStats();
      console.log('UserDashboard: Stats data:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('UserDashboard: Error fetching stats:', error);
      setStats({
        total: 0,
        active: 0,
        pending: 0,
        inactive: 0,
        totalRewards: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    console.log('UserDashboard: No user found');
    return null;
  }

  if (loading) {
    console.log('UserDashboard: Loading stats...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  console.log('UserDashboard: Rendering with stats:', stats);

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.email}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your referrals and track your rewards
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Referrals</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserPlus className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Referrals</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.active}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                      <dd className="text-lg font-semibold text-gray-900">${stats.totalRewards.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Referrals</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.pending}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Share Section */}
              <ReferralShare />
              
              {/* Insights Section */}
              <ReferralInsights />
              
              {/* Referral Tree */}
              <ReferralTree />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Tiers Section */}
              <ReferralTiers />
              
              {/* Leaderboard Section */}
              <ReferralLeaderboard />
              
              {/* Rewards Section */}
              <ReferralRewards />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}