import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  // TEMPORARY BYPASS: Force true for testing purposes
  const isAuthorized = true; 

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}