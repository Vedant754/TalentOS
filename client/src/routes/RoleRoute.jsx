import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
};

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
