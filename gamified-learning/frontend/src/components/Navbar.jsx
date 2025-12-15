import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, BookOpen, Trophy, User, LogOut, Shield, GraduationCap } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';
import LogoutConfirmModal from './LogoutConfirmModal.jsx';

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const linkClasses = 'text-sm font-semibold text-slate-300 transition hover:text-white hover:drop-shadow-glow';
  const mobileLinkClasses = 'flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition rounded-xl';

  const navLinks = [
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:py-4"
        >
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2 md:gap-3 text-lg font-display tracking-wide" onClick={closeMobileMenu}>
            <span className="relative flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-accent text-white text-sm md:text-base shadow-neon">
              <span className="absolute inset-0 rounded-xl md:rounded-2xl border border-white/20 opacity-50 transition group-hover:opacity-90" />
              GL
            </span>
            <div className="hidden sm:block">
              <span className="block text-xs uppercase text-slate-400 tracking-[0.3em]">Neo</span>
              <span className="bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-xl md:text-2xl font-semibold text-transparent">
                Gamified Learning
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} className={linkClasses}>
                    {link.label}
                  </Link>
                ))}
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
                  onClick={() => setShowLogoutModal(true)}
                  className="relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold shadow-neon"
                >
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

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-72 bg-[#0f1014] border-l border-white/10 md:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Menu</span>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-4">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-white/20 bg-black/40 flex items-center justify-center text-white font-semibold">
                        {user.profileImage || user.avatar ? (
                          <img
                            src={((user.profileImage || user.avatar).startsWith('http')
                              ? (user.profileImage || user.avatar)
                              : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profileImage || user.avatar}`)}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <Link to="/" onClick={closeMobileMenu} className={mobileLinkClasses}>
                      <Home className="w-5 h-5" />
                      Home
                    </Link>
                    {navLinks.map((link) => (
                      <Link key={link.to} to={link.to} onClick={closeMobileMenu} className={mobileLinkClasses}>
                        <link.icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    ))}
                    {user.role === 'teacher' && (
                      <Link to="/teacher/dashboard" onClick={closeMobileMenu} className={mobileLinkClasses}>
                        <GraduationCap className="w-5 h-5" />
                        Teacher Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" onClick={closeMobileMenu} className={mobileLinkClasses}>
                        <Shield className="w-5 h-5" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-white/10 my-4" />

                    <button
                      onClick={() => {
                        closeMobileMenu();
                        setShowLogoutModal(true);
                      }}
                      className={`${mobileLinkClasses} w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10`}
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/" onClick={closeMobileMenu} className={mobileLinkClasses}>
                      <Home className="w-5 h-5" />
                      Home
                    </Link>
                    <Link to="/login" onClick={closeMobileMenu} className={mobileLinkClasses}>
                      <User className="w-5 h-5" />
                      Login
                    </Link>
                    <Link
                      to="/choose-role"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Navbar;
