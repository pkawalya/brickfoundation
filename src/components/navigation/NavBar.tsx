import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Users, LogOut, Settings, Home, Gift, Link as LinkIcon } from 'lucide-react';

export function NavBar() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'My Referrals', href: '/dashboard/referrals', icon: Users },
    { name: 'Get Referral Links', href: '/dashboard/get-referral-links', icon: LinkIcon },
    { name: 'Rewards', href: '/dashboard/rewards', icon: Gift },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                Brick Foundation
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  <item.icon className="h-5 w-5 mr-1" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative flex items-center space-x-4">
              <Link
                to="/settings"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Settings className="h-6 w-6" />
              </Link>
              <button
                onClick={handleSignOut}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
