import { useEffect, useState } from 'react';
import useApi from '../../hooks/useApi.js';

const targets = ['all', 'students', 'teachers'];

const AdminAnnouncements = () => {
  const api = useApi();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', target: 'all' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/admin/announcements/all');
      setList(data || []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/announcements', form);
      setForm({ title: '', message: '', target: 'all' });
      await load();
    } catch (err) {
      console.error('Failed to create announcement', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Broadcast</p>
            <h2 className="text-lg font-semibold text-white">New Announcement</h2>
          </div>
          <select
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm"
            value={form.target}
            onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
          >
            {targets.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary/60"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
        />
        <textarea
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary/60"
          rows="3"
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold text-white shadow-neon"
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Send announcement'}
          </button>
        </div>
      </form>

      <div className="glass-panel rounded-2xl border border-white/10 bg-black/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent</p>
            <h3 className="text-lg font-semibold text-white">Announcements</h3>
          </div>
        </div>
        {loading ? <p className="text-sm text-slate-400 mt-3">Loading announcements...</p> : null}
        <div className="mt-4 space-y-3">
          {list.map((a) => (
            <div key={a._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Target: {a.target || 'all'}</span>
                <span>{new Date(a.createdAt).toLocaleString()}</span>
              </div>
              <p className="font-semibold text-white">{a.title}</p>
              <p className="text-sm text-slate-300">{a.body || a.message}</p>
            </div>
          ))}
          {list.length === 0 && !loading && <p className="text-sm text-slate-500">No announcements yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;

