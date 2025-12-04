import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../context/AuthContext.jsx';
import api from '../../api/index.js';

const StudentSignup = () => {
  const navigate = useNavigate();
  const { signup } = useAuthContext();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { name, email, password } = form;
      let profileImage;
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          const { data: upload } = await api.post('/uploads/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          profileImage = upload.url;
        } catch {
          // If upload fails, continue signup without image instead of blocking the user
          profileImage = undefined;
        }
      }
      const data = await signup({ name, email, password, role: 'student', profileImage });
      const role = data?.user?.role;
      if (role === 'student') navigate('/student/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create student account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="glass-card-premium relative overflow-hidden rounded-2xl p-8"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 opacity-70" />

          <div className="mb-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-300"
            >
              Student Signup
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-sm text-slate-400"
            >
              Join quests, track your streaks and level up your skills.
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
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-20 w-20">
                  <div className="h-20 w-20 rounded-full border border-white/20 bg-black/40 overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        Avatar
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-black shadow hover:bg-emerald-400">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-emerald-400/60 input-glow transition-all"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-emerald-400/60 input-glow transition-all"
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-emerald-400/60 input-glow transition-all"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-emerald-400/60 input-glow transition-all"
                placeholder="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Creating account...' : 'Create student account'}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
                Login
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentSignup;


