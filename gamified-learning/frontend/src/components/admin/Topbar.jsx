import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext.jsx';

const titleMap = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/users': 'Users',
  '/admin/courses': 'Courses',
  '/admin/gamification': 'Gamification',
  '/admin/leaderboard': 'Leaderboard',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings'
};

const Topbar = () => {
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const title =
    titleMap[location.pathname] ||
    location.pathname
      .replace('/admin/', '')
      .split('/')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') ||
    'Admin';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <p className="text-xs text-slate-400">Admin view · Manage the learning platform</p>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/40">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              )}
            </div>
            <div className="hidden text-left text-xs sm:block">
              <p className="font-semibold text-slate-100 text-ellipsis overflow-hidden max-w-[140px]">
                {user.name || 'Admin'}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Admin</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-white/10"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;


