import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import {
  Box,
  Users,
  BarChart,
  Settings,
  LogOut,
  User,
  Gift,
  DollarSign,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    ...(isAdmin()
      ? [
          { name: 'Overview', href: '/dashboard', icon: BarChart },
          { name: 'Users', href: '/dashboard/users', icon: Users },
          { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        ]
      : [
          { name: 'Overview', href: '/dashboard', icon: BarChart },
          { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
          { name: 'Earnings', href: '/dashboard/earnings', icon: DollarSign },
          { name: 'Raffles', href: '/dashboard/raffles', icon: Gift },
        ]),
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-900">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Box className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">The Brick</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-indigo-800"
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-indigo-800">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.full_name}</p>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-sm text-indigo-200 hover:text-white"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}