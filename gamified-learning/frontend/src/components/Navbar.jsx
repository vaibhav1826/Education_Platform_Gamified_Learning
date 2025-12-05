import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClasses = 'text-sm font-semibold text-slate-300 transition hover:text-white hover:drop-shadow-glow';

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4"
      >
        <Link to="/" className="group flex items-center gap-3 text-lg font-display tracking-wide">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-neon">
            <span className="absolute inset-0 rounded-2xl border border-white/20 opacity-50 transition group-hover:opacity-90" />
            GL
          </span>
          <div>
            <span className="block text-sm uppercase text-slate-400 tracking-[0.3em]">Neo</span>
            <span className="bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-2xl font-semibold text-transparent">
              Gamified Learning
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/courses" className={linkClasses}>
                Courses
              </Link>
              <Link to="/leaderboard" className={linkClasses}>
                Leaderboard
              </Link>
              <Link to="/profile" className={linkClasses}>
                Profile
              </Link>
              {user.role === 'teacher' && (
                <Link to="/teacher/dashboard" className={linkClasses}>
                  Teacher
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className={linkClasses}>
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-black/40">
                  {user.profileImage || user.avatar ? (
                    <img
                      src={((user.profileImage || user.avatar).startsWith('http')
                        ? (user.profileImage || user.avatar)
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profileImage || user.avatar}`)}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`flex h-full w-full items-center justify-center text-xs text-slate-300 ${user.profileImage || user.avatar ? 'hidden' : ''}`}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold shadow-neon"
              >
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.35),transparent,rgba(255,255,255,0.2))] opacity-0 transition duration-500 group-hover:opacity-60" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClasses}>
                Login
              </Link>
              <Link
                to="/choose-role"
                className="group relative overflow-hidden rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white shadow-neon"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/70 via-accent/60 to-primary/70 opacity-60 blur-lg transition group-hover:opacity-80" />
                <span className="relative">Signup</span>
              </Link>
            </>
          )}
        </div>
      </motion.nav>
    </header>
  );
};

export default Navbar;
