import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext.jsx';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuthContext();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to signup');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="relative z-10 flex w-full justify-center">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel w-full max-w-md space-y-4 rounded-2xl border border-white/10 p-8 shadow-glass-card"
        >
          <h2 className="text-2xl font-semibold">Create Account</h2>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <input
            className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-accent"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-accent"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/50 p-3 text-sm outline-none placeholder:text-slate-500 focus:border-accent"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="w-full rounded-lg bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold shadow-neon">
            Signup
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default Signup;