import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, AlertCircle, Search, Filter, RefreshCw } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { supabase } from '../../lib/supabase';

interface UserStats {
  totalUsers: number;
  activeReferrals: number;
  totalRevenue: number;
  pendingVerifications: number;
}

interface RecentActivity {
  id: string;
  event: string;
  time: string;
  details: string;
  type: 'registration' | 'payment' | 'referral';
}

export function AdminDashboard() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeReferrals: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'registration' | 'payment' | 'referral'>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats - only get what we know exists
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, status, created_at, email, full_name');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Calculate stats
      setStats({
        totalUsers: users?.length || 0,
        activeReferrals: 0, // We'll implement this later
        totalRevenue: 0, // We'll implement this later
        pendingVerifications: users?.filter(u => u.status === 'pending').length || 0,
      });

      // Set recent activities from users table
      if (users) {
        const recentActivities = users
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map(user => ({
            id: user.id,
            event: 'New user registration',
            time: new Date(user.created_at).toLocaleString(),
            details: `${user.full_name || 'Unknown'} (${user.email})`,
            type: 'registration' as const
          }));
        
        setActivities(recentActivities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't throw the error, just log it
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities
    .filter(activity => 
      activity.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType === 'all' || activity.type === filterType)
    );

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={fetchDashboardData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-900">View all users</a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Referrals</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeReferrals}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-900">View referral chains</a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats.totalRevenue.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-900">View financial reports</a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Verifications</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingVerifications}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-900">Review pending</a>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Activity
                  </h3>
                  <div className="flex space-x-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Search activities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                    >
                      <option value="all">All Activities</option>
                      <option value="registration">Registrations</option>
                      <option value="payment">Payments</option>
                      <option value="referral">Referrals</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flow-root">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                    </div>
                  ) : (
                    <ul role="list" className="-mb-8">
                      {filteredActivities.map((activity, activityIdx) => (
                        <li key={activity.id}>
                          <div className="relative pb-8">
                            {activityIdx !== filteredActivities.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  activity.type === 'registration' ? 'bg-blue-500' :
                                  activity.type === 'payment' ? 'bg-green-500' : 'bg-purple-500'
                                }`}>
                                  {activity.type === 'registration' ? (
                                    <Users className="h-4 w-4 text-white" />
                                  ) : activity.type === 'payment' ? (
                                    <DollarSign className="h-4 w-4 text-white" />
                                  ) : (
                                    <TrendingUp className="h-4 w-4 text-white" />
                                  )}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {activity.event}{' '}
                                    <span className="font-medium text-gray-900">
                                      {activity.details}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={activity.time}>{activity.time}</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}