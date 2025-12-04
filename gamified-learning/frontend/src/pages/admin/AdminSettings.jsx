// import axios from 'axios'; // TODO: connect to backend API
import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';

const AdminSettings = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: ''
  });
  const [platform, setPlatform] = useState({
    name: 'Neo Gamified Learning',
    logoText: 'GL'
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // TODO: PATCH `/api/admin/profile` with profile
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // TODO: POST `/api/admin/change-password` with passwords
  };

  const handlePlatformSubmit = (e) => {
    e.preventDefault();
    // TODO: PATCH `/api/admin/settings` with platform
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <form
        onSubmit={handleProfileSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold text-white">Profile</h2>
          <p className="text-xs text-slate-400">Update your admin profile information.</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Name</label>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold text-white shadow-neon"
          >
            Save profile
          </button>
        </div>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 md:grid-cols-3"
      >
        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold text-white">Password</h2>
          <p className="text-xs text-slate-400">Change your admin password.</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Current password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">New password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={passwords.next}
            onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Confirm new password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
        </div>
        <div className="md:col-span-3">
          <button
            type="submit"
            className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10"
          >
            Update password
          </button>
        </div>
      </form>

      <form
        onSubmit={handlePlatformSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold text-white">Platform settings</h2>
          <p className="text-xs text-slate-400">Basic branding for the platform.</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Platform name</label>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={platform.name}
            onChange={(e) => setPlatform({ ...platform, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">Logo text</label>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={platform.logoText}
            onChange={(e) => setPlatform({ ...platform, logoText: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10"
          >
            Save platform settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;


