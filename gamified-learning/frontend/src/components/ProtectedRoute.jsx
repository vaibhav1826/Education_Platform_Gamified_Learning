import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuthContext();

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;