import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';

/**
 * Wrap a route element with this to require login, and optionally admin status.
 *
 * <Route path="/dashboard" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
 * <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (adminOnly && !user?.isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}