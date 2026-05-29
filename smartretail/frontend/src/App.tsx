import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppShell } from './components/Layout';
import { useAuth } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { InventoryPage } from './pages/InventoryPage';
import { LoginPage } from './pages/LoginPage';
import { ReportsPage } from './pages/ReportsPage';
import { SalesAnalyticsPage } from './pages/SalesAnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function RequireAuth({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div className="min-h-screen bg-navy" />;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <AppShell>{children}</AppShell>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/sales" element={<RequireAuth><SalesAnalyticsPage /></RequireAuth>} />
      <Route path="/inventory" element={<RequireAuth><InventoryPage /></RequireAuth>} />
      <Route path="/forecast" element={<RequireAuth><ForecastingPage /></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
    </Routes>
  );
}
