import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          Gamified Learning
        </Link>
        <div className="flex gap-4 items-center text-sm font-semibold">
          {user ? (
            <>
              <Link to="/courses" className="hover:text-accent">Courses</Link>
              <Link to="/leaderboard" className="hover:text-accent">Leaderboard</Link>
              <Link to="/profile" className="hover:text-accent">Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-accent">Admin</Link>
              )}
              <button onClick={handleLogout} className="bg-primary px-4 py-2 rounded-lg">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-accent">Login</Link>
              <Link to="/signup" className="bg-primary px-4 py-2 rounded-lg">Signup</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;