import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/Layout.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { ForecastingPage } from './pages/ForecastingPage.jsx';
import { InventoryPage } from './pages/InventoryPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { SalesAnalyticsPage } from './pages/SalesAnalyticsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import AgentQueuePage from './pages/AgentQueue.jsx';

function RequireAuth({ children }) {
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
      <Route path="/agent-queue" element={<RequireAuth><AgentQueuePage /></RequireAuth>} />
      <Route path="/forecast" element={<RequireAuth><ForecastingPage /></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
    </Routes>
  );
}