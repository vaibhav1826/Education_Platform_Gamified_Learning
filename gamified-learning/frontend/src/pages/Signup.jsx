import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthContext } from '../context/AuthContext.jsx';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuthContext();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    phone: '',
    avatar: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const payload = { ...form, role };
      const data = await signup(payload);
      const userRole = data?.user?.role;
      if (userRole === 'teacher') navigate('/teacher');
      else if (userRole === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const data = await loginWithGoogle({ credential: response.credential, role });
      const userRole = data?.user?.role;
      if (userRole === 'teacher') navigate('/teacher');
      else if (userRole === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google signup failed');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card-premium rounded-2xl p-8 relative overflow-hidden"
        >
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-pink-500 opacity-50" />

          <div className="mb-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 text-glow"
            >
              {role === 'student' && 'Create Student Account'}
              {role === 'teacher' && 'Create Teacher Account'}
              {role === 'admin' && 'Create Admin Account'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 mt-2 text-sm"
            >
              Join the community today
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm outline-none placeholder:text-slate-500 focus:border-pink-500/50 input-glow transition-all duration-300"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm outline-none placeholder:text-slate-500 focus:border-pink-500/50 input-glow transition-all duration-300"
                  placeholder="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm outline-none placeholder:text-slate-500 focus:border-pink-500/50 input-glow transition-all duration-300"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-3 gap-3"
              >
                {['student', 'teacher', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                      role === r
                        ? 'border-pink-500/70 bg-pink-500/10 text-white'
                        : 'border-white/10 bg-black/30 text-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm outline-none placeholder:text-slate-500 focus:border-pink-500/50 input-glow transition-all duration-300"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm outline-none placeholder:text-slate-500 focus:border-pink-500/50 input-glow transition-all duration-300"
                  placeholder="Mobile Number"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm outline-none placeholder:text-slate-500 focus:border-pink-500/50 input-glow transition-all duration-300"
                  placeholder="Profile photo URL (optional)"
                  type="url"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                />
              </motion.div>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create account'}
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col items-center gap-3 text-sm text-slate-400"
            >
              <span>or continue with</span>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google signup failed')} />
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;