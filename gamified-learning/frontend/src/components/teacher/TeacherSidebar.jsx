import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Trophy, Settings } from 'lucide-react';

const navItems = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/teacher/batches', label: 'Batches', icon: Users },
  { to: '/teacher/quizzes', label: 'Quizzes', icon: FileText },
  { to: '/teacher/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/teacher/settings', label: 'Settings', icon: Settings }
];

const TeacherSidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="px-5 pb-4 pt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Teacher</p>
        <p className="mt-1 text-sm font-semibold text-slate-100">Control Panel</p>
      </div>
      <nav className="flex-1 space-y-1 px-2 pb-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-primary/20 text-white border border-primary/60 shadow-neon'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              ].join(' ')
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default TeacherSidebar;

