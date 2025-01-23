import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  UserCircleIcon,
  BellIcon,
  CogIcon,
  LogoutIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/outline';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profile);

      // Get user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setSettings(settings);

      // Get recent activities
      const { data: activities } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setActivities(activities);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <BellIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <CogIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <LogoutIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-16 w-16 text-gray-400" />
              )}
              <div>
                <h2 className="text-xl font-semibold">{profile?.full_name}</h2>
                <p className="text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {profile?.role === 'admin' ? 'Admin' : 'User'}
                </div>
                <div className="text-sm text-gray-500">Role</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {profile?.status === 'active' ? 'Active' : 'Pending'}
                </div>
                <div className="text-sm text-gray-500">Status</div>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Theme</span>
                <span className="text-indigo-600 capitalize">{settings?.theme}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email Notifications</span>
                <span className={settings?.email_notifications ? 'text-green-600' : 'text-red-600'}>
                  {settings?.email_notifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Push Notifications</span>
                <span className={settings?.push_notifications ? 'text-green-600' : 'text-red-600'}>
                  {settings?.push_notifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Two-Factor Auth</span>
                <span className={settings?.two_factor_enabled ? 'text-green-600' : 'text-red-600'}>
                  {settings?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activities?.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.activity_type === 'registration' && (
                      <UserCircleIcon className="h-5 w-5 text-blue-500" />
                    )}
                    {activity.activity_type === 'login' && (
                      <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                    )}
                    {activity.activity_type === 'profile_update' && (
                      <CogIcon className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium">Edit Profile</span>
              <UserCircleIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </button>
          <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium">Security Settings</span>
              <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </button>
          <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium">View Statistics</span>
              <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </button>
          <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium">Activity Log</span>
              <ClockIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
