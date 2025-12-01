import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="flex justify-center mt-16 px-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 w-full max-w-md p-8 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-2xl font-bold">Create Account</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="w-full bg-primary py-3 rounded-lg font-semibold">Signup</button>
      </form>
    </div>
  );
};

export default Signup;