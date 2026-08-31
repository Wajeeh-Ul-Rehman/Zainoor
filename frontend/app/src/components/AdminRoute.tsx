import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  // If user logs out, this triggers instantly and redirects cleanly without conflicts
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}