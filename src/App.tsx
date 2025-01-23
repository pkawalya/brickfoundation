import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/landing/LandingPage';
import { RegistrationForm } from './components/auth/RegistrationForm';
import { SignInForm } from './components/auth/SignInForm';
import { VerificationForm } from './components/auth/VerificationForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { useAuthStore } from './store/auth';

function PrivateRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isAdmin } = useAuthStore();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { user, isAdmin } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/verify" element={<VerificationForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute requireAdmin={false}>
              {isAdmin() ? <AdminDashboard /> : <UserDashboard />}
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;