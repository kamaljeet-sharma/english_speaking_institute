import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Spinner } from './ui';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
