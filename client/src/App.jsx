import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute, { getDashboardPath } from './routes/RoleRoute';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import CEODashboard from './pages/dashboards/CEODashboard';
import HRDashboard from './pages/dashboards/HRDashboard';
import TeamLeadDashboard from './pages/dashboards/TeamLeadDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loader">Loading...</div>;

  return <Navigate to={user ? getDashboardPath(user.role) : '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route element={<RoleRoute allowedRoles={['ceo']} />}>
                <Route path="/dashboard/ceo" element={<CEODashboard />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['hr_manager']} />}>
                <Route path="/dashboard/hr" element={<HRDashboard />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['team_lead']} />}>
                <Route path="/dashboard/team-lead" element={<TeamLeadDashboard />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['employee']} />}>
                <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
