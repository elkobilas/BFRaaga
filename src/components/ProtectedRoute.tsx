import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  sellerOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly, sellerOnly }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin, isSeller } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (sellerOnly && !isSeller) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
