import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { User } from 'lucide-react';

const TeacherTopbar = ({ title = 'Teacher Dashboard' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <p className="text-xs text-slate-400">Teacher view · Manage your batches and quizzes</p>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/40">
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
              <span className={`text-xs font-semibold ${user.profileImage || user.avatar ? 'hidden' : ''}`}>
                {user.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4 text-slate-300" />}
              </span>
            </div>
            <div className="hidden text-left text-xs sm:block">
              <p className="font-semibold text-slate-100 text-ellipsis overflow-hidden max-w-[140px]">
                {user.name || 'Teacher'}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Teacher</p>
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

export default TeacherTopbar;

