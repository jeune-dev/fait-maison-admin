import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../constants/routes';

export default function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullPage />;
  if (user) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
}
