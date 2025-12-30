import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@context/AuthContext';

/**
 * Route guard that requires authentication
 * Redirects to /signin if not authenticated
 * Preserves the intended destination for post-login redirect
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Render the protected content
  return <Outlet />;
}

/**
 * Route guard that requires admin rights
 * Use within a ProtectedRoute for proper auth checking
 */
export function AdminRoute() {
  const { rights, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!rights?.admin) {
    return <Navigate to="/deals" replace />;
  }

  return <Outlet />;
}
