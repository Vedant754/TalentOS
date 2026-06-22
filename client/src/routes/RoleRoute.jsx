// src/routes/RoleRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layer 2: must be logged in AND have one of the allowed roles
// This is the FRONTEND mirror of Phase 5's authorize() middleware —
// pure UX, the backend still enforces the real boundary
const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user.role)) {
    // Don't show a blank/broken page — redirect to where they DO belong
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
};

// Single source of truth for "which dashboard does this role land on"
export const getDashboardPath = (role) => {
  const map = {
    ceo: '/dashboard/ceo',
    hr_manager: '/dashboard/hr',
    team_lead: '/dashboard/team-lead',
    employee: '/dashboard/employee',
  };
  return map[role] || '/login';
};

export default RoleRoute;