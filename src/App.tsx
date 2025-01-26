import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/landing/LandingPage';
import { Register } from './components/auth/Register';
import { Login } from './components/auth/Login';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { ReferralsPage } from './components/dashboard/ReferralsPage';
import { PasswordResetRequest } from './components/auth/PasswordResetRequest';
import { PasswordReset } from './components/auth/PasswordReset';
import { useAuthStore } from './store/auth';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

function PrivateRoute({ children, requireAdmin = false }: PrivateRouteProps) {
  const { user, loading } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  console.log('PrivateRoute:', { user, loading, isAdmin, requireAdmin }); // Debug log

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    console.log('PrivateRoute: No user, redirecting to login'); // Debug log
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('PrivateRoute: Not admin, redirecting to dashboard'); // Debug log
    return <Navigate to="/dashboard" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  const { initializeSession, loading } = useAuthStore();

  useEffect(() => {
    console.log('App: Initializing session...'); // Debug log
    initializeSession();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password" element={<PasswordReset />} />

        {/* Protected routes */}
        <Route path="/dashboard">
          <Route
            index
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="referrals"
            element={
              <PrivateRoute>
                <ReferralsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="earnings"
            element={
              <PrivateRoute>
                <div className="p-4">Earnings Page Coming Soon</div>
              </PrivateRoute>
            }
          />
          <Route
            path="raffles"
            element={
              <PrivateRoute>
                <div className="p-4">Raffles Page Coming Soon</div>
              </PrivateRoute>
            }
          />
        </Route>

        {/* Admin routes */}
        <Route path="/admin">
          <Route
            index
            element={
              <PrivateRoute requireAdmin={true}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="users"
            element={
              <PrivateRoute requireAdmin={true}>
                <div className="p-4">User Management Coming Soon</div>
              </PrivateRoute>
            }
          />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;