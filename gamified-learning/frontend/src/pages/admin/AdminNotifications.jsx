import { useState } from 'react';
import useApi from '../../hooks/useApi.js';

const roles = ['students', 'teachers'];

const AdminNotifications = () => {
  const api = useApi();
  const [form, setForm] = useState({ title: '', message: '', targetRole: 'students' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/notifications', {
        title: form.title,
        message: form.message,
        targetRole: form.targetRole === 'students' ? 'student' : 'teacher'
      });
      setSent('Notification sent.');
      setForm({ title: '', message: '', targetRole: form.targetRole });
    } catch (err) {
      console.error('Failed to send notification', err);
      setSent('Failed to send.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">Notifications</h2>
        <p className="text-xs text-slate-400">Send system notifications to students or teachers.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((p) => ({ ...p, targetRole: r }))}
              className={`rounded-full border px-3 py-1 font-semibold transition ${
                form.targetRole === r ? 'border-primary/70 bg-primary/20 text-white' : 'border-white/10 bg-black/40 text-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
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
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">{sent}</p>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold text-white shadow-neon"
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Send notification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminNotifications;

