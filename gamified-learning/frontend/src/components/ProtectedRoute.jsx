import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';
import AccessDenied from '../pages/AccessDenied.jsx';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <AccessDenied requiredRole={roles} userRole={user.role} />;
  }

  return children;
};

export default ProtectedRoute;