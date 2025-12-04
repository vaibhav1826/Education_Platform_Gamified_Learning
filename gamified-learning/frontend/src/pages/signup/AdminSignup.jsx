import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../context/AuthContext.jsx';
import api from '../../api/index.js';

const adminSignupEnabled = import.meta.env.VITE_ENABLE_ADMIN_SIGNUP === 'true';

const AdminSignup = () => {
  const navigate = useNavigate();
  const { signup } = useAuthContext();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!adminSignupEnabled) {
      setError('Admin signup is disabled. Enable it via VITE_ENABLE_ADMIN_SIGNUP for development.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { name, email, password, secretKey } = form;
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
          profileImage = undefined;
        }
      }
      const data = await signup({
        name,
        email,
        password,
        role: 'admin',
        secretKey,
        profileImage
      });
      const role = data?.user?.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create admin account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-rose-500/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="glass-card-premium relative overflow-hidden rounded-2xl border border-amber-400/40 p-8 shadow-[0_0_40px_rgba(251,191,36,0.3)]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-rose-500 opacity-80" />

          <div className="mb-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-rose-200"
            >
              Admin Signup
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-sm text-slate-300"
            >
              Restricted access for platform administrators. Use your secret admin key.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg border border-red-500/50 bg-red-500/15 p-3 text-center text-sm text-red-200"
              >
                {error}
              </motion.div>
            )}

            {!adminSignupEnabled && (
              <p className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-100">
                Admin signup is currently in development mode only. To enable it locally, set{' '}
                <span className="font-mono font-semibold">VITE_ENABLE_ADMIN_SIGNUP=true</span> in your frontend
                <span className="font-mono"> .env</span> and restart the dev server.
              </p>
            )}

            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-20 w-20">
                  <div className="h-20 w-20 rounded-full border border-white/15 bg-black/40 overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        Avatar
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-black shadow hover:bg-amber-300">
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
                className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-amber-400/70 input-glow transition-all"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-amber-400/70 input-glow transition-all"
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-amber-400/70 input-glow transition-all"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-amber-400/70 input-glow transition-all"
                placeholder="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-amber-400/60 bg-black/50 p-3 text-sm outline-none placeholder:text-amber-100/70 focus:border-amber-300 input-glow transition-all"
                placeholder="Secret admin key"
                type="password"
                value={form.secretKey}
                onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-rose-400 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-400/40 transition hover:shadow-amber-400/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Verifying...' : 'Create admin account'}
            </button>

            <p className="mt-3 text-center text-xs text-slate-300">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-amber-200 hover:text-amber-100">
                Login
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSignup;


