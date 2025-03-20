import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!requiredRole.includes(user.role)) {
    // Redirect based on user's role
    if (user.role === 'Student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === 'Admin') {
      return <Navigate to="/dashboard" replace />;
    }
    // Default fallback
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;