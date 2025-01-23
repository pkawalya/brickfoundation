import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import Overview from './views/Overview';
import Profile from './views/Profile';
import Analytics from './views/Analytics';
import Documents from './views/Documents';
import Settings from './views/Settings';
import Security from './views/Security';

export default function DashboardRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="documents" element={<Documents />} />
        <Route path="settings" element={<Settings />} />
        <Route path="security" element={<Security />} />
      </Route>
    </Routes>
  );
}
