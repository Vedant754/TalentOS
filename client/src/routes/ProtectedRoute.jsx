// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layer 1: must be logged in at all
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loader">Loading…</div>; // avoid flash-redirect before session restore finishes

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />; // renders the matched child route
};

export default ProtectedRoute;