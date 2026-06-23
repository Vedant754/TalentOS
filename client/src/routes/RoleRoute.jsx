import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authState';
import { getDashboardPath } from './dashboardPaths';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
