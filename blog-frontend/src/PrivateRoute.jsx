import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function PrivateRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  return token ? <Outlet /> : <Navigate to="/signin" replace />;
}
