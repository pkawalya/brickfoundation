import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Logo } from '../common/Logo';
import {
  Box,
  Users,
  BarChart,
  Settings,
  LogOut,
  User,
  Gift,
  DollarSign,
  Menu,
  X,
  Bell,
  ChevronDown,
  Home,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications] = useState(2);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Close mobile menu and profile dropdown when location changes
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  useEffect(() => {
    // Simulate page transition
    setIsLoading(true);
    console.log('DashboardLayout: Setting loading state to true');
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('DashboardLayout: Setting loading state to false');
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    console.log('DashboardLayout: Current user:', user);
  }, [user]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigation = [
    ...(isAdmin()
      ? [
          { name: 'Overview', href: '/admin', icon: BarChart },
          { name: 'Users', href: '/admin/users', icon: Users },
          { name: 'Settings', href: '/admin/settings', icon: Settings },
        ]
      : [
          { name: 'Overview', href: '/dashboard', icon: BarChart },
          { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
          { name: 'Earnings', href: '/dashboard/earnings', icon: DollarSign },
          { name: 'Raffles', href: '/dashboard/raffles', icon: Gift },
        ]),
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/dashboard' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      return {
        name: path.charAt(0).toUpperCase() + path.slice(1),
        href: url,
        current: index === paths.length - 1,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          {/* Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Mobile menu panel */}
          <div
            className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <Logo variant="dark" className="transform-gpu hover:scale-105 transition-transform duration-200" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-1 mt-5">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-150 ${
                      isCurrentPath(item.href)
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 h-5 w-5 ${
                        isCurrentPath(item.href) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="lg:flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <Logo variant="dark" className="transform-gpu hover:scale-105 transition-transform duration-200" />
            </div>
            <nav className="flex-1 px-4 space-y-1 mt-5">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isCurrentPath(item.href)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isCurrentPath(item.href) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Top navigation */}
          <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4 h-full">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Breadcrumbs - desktop */}
              <div className="hidden lg:flex items-center min-w-0 gap-2">
                {getBreadcrumbs().map((breadcrumb, index) => (
                  <React.Fragment key={breadcrumb.href}>
                    {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <Link
                      to={breadcrumb.href}
                      className={`text-sm font-medium ${
                        breadcrumb.current
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {breadcrumb.name}
                    </Link>
                  </React.Fragment>
                ))}
              </div>

              {/* Right side buttons */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="h-6 w-6" />
                  {notifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                  )}
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="hidden lg:flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700">
                        {user?.user_metadata?.full_name || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </span>
                  </button>

                  {/* Profile dropdown panel */}
                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="mr-3 h-4 w-4 text-gray-400" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  </div>
                ) : (
                  <div className="transition-opacity duration-200 ease-in-out">
                    {children}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}