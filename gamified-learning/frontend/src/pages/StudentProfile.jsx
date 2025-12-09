import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';

const StudentProfile = () => {
  const api = useApi();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', phone: '', specialization: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/student/profile');
        setProfile(data);
        setForm({
          name: data.user?.name || '',
          city: data.user?.city || '',
          phone: data.user?.phone || '',
          specialization: data.user?.specialization || ''
        });
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    load();
  }, [api]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/student/profile', form);
      setProfile((prev) => ({ ...prev, user: data }));
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  const saveAvatar = async () => {
    if (!form.profileImage) return;
    await api.patch('/student/profile-image', { profileImage: form.profileImage });
    setProfile((prev) => ({ ...prev, user: { ...prev.user, profileImage: form.profileImage } }));
  };

  if (!profile) return <main className="px-4 py-10 text-slate-400">Loading profile...</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Profile</p>
          <h1 className="mt-2 text-3xl font-display">{profile.user?.name}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Profile info</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-slate-400">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-400">City</span>
              <input
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-400">Phone</span>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-400">Specialization</span>
              <input
                value={form.specialization}
                onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold shadow-neon disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </section>

        <aside className="space-y-4">
          <div className="glass-panel rounded-2xl border border-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Avatar</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                {profile.user?.profileImage && <img src={profile.user.profileImage} alt={profile.user.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <input
                  placeholder="Image URL"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                  value={form.profileImage || ''}
                  onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={saveAvatar}
                  className="mt-2 rounded-full bg-white/10 px-4 py-1 text-xs text-slate-200"
                >
                  Update photo
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Batches</p>
            <div className="space-y-2">
              {profile.batches?.map((batch) => (
                <div key={batch._id} className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                  <p className="font-semibold">{batch.name}</p>
                  <p className="text-xs text-slate-500">Teacher: {batch.teacher?.name}</p>
                </div>
              ))}
              {(!profile.batches || profile.batches.length === 0) && <p className="text-sm text-slate-500">No batches</p>}
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Badges</p>
            <div className="flex flex-wrap gap-2">
              {profile.badges?.map((badge) => (
                <span key={badge._id} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  {badge.name || 'Badge'}
                </span>
              ))}
              {(!profile.badges || profile.badges.length === 0) && <p className="text-sm text-slate-500">No badges yet.</p>}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default StudentProfile;


