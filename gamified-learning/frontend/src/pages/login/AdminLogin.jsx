import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthContext } from '../../context/AuthContext.jsx';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuthContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await login({ email: form.email, password: form.password, role: 'admin' });
      const role = data?.user?.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const data = await loginWithGoogle({ credential: response.credential, role: 'admin' });
      const role = data?.user?.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-rose-500/25 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="glass-card-premium relative overflow-hidden rounded-2xl p-8"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-500 opacity-70" />

          <div className="mb-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-300"
            >
              Admin Login
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-sm text-slate-400"
            >
              Access the admin control panel and manage the platform.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-center text-sm text-red-300"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-amber-400/60 input-glow transition-all"
                  placeholder="Email address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-amber-400/60 input-glow transition-all"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </motion.div>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-3 text-sm text-slate-400"
            >
              <span>or continue with</span>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in failed')} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-3 text-center text-xs text-slate-400"
            >
              Don't have an account?{' '}
              <Link to="/signup/admin" className="font-semibold text-amber-300 hover:text-amber-200">
                Sign up
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;

