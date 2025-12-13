import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi.js';

const AdminGamification = () => {
  const api = useApi();
  const [config, setConfig] = useState({
    xpPerLesson: 50,
    xpPerQuiz: 100,
    xpPerStreakDay: 20
  });
  const [badges, setBadges] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings
        const { data: settings } = await api.get('/admin/settings');
        if (settings?.xpRules) {
          setConfig({
            xpPerLesson: settings.xpRules.find(r => r.action === 'lesson.complete')?.xp ?? 50,
            xpPerQuiz: settings.xpRules.find(r => r.action === 'quiz.complete')?.xp ?? 100,
            xpPerStreakDay: settings.xpRules.find(r => r.action === 'streak.day')?.xp ?? 20
          });
        }

        // Load badges from auth seed or database
        try {
          const { data: badgeData } = await api.get('/admin/badges');
          if (badgeData?.length) {
            setBadges(badgeData.map(b => ({ ...b, active: true })));
          }
        } catch {
          // Badges endpoint may not exist, use defaults
          setBadges([
            { _id: 1, name: '5 Day Streak', description: 'Keep learning 5 days in a row', active: true },
            { _id: 2, name: 'Quiz Hero', description: 'Score full marks in a quiz', active: true },
            { _id: 3, name: 'Early Bird', description: 'Complete a lesson before 8 AM', active: false }
          ]);
        }
      } catch (err) {
        console.error('Failed to load gamification settings', err);
      }
    };
    loadData();
  }, [api]);

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/admin/settings', {
        xpRules: [
          { action: 'lesson.complete', xp: config.xpPerLesson },
          { action: 'quiz.complete', xp: config.xpPerQuiz },
          { action: 'streak.day', xp: config.xpPerStreakDay },
          { action: 'quiz.submit', xp: 20 },
          { action: 'quiz.correct', xp: 10 }
        ]
      });
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleBadge = (badgeId) => {
    setBadges(prev => prev.map(b =>
      b._id === badgeId ? { ...b, active: !b.active } : b
    ));
    // Note: Badge toggle would need a backend endpoint to persist
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <form
        onSubmit={handleSave}
        className="grid gap-6 rounded-2xl border border-white/10 bg-black/40 p-5 md:grid-cols-3"
      >
        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold text-white">XP configuration</h2>
          <p className="text-xs text-slate-400">Tune the reward curve for lessons, quizzes and streaks.</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">XP per completed lesson</label>
          <input
            type="number"
            min="0"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={config.xpPerLesson}
            onChange={(e) => handleChange('xpPerLesson', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">XP per quiz completion</label>
          <input
            type="number"
            min="0"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={config.xpPerQuiz}
            onChange={(e) => handleChange('xpPerQuiz', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-300">XP per streak day</label>
          <input
            type="number"
            min="0"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            value={config.xpPerStreakDay}
            onChange={(e) => handleChange('xpPerStreakDay', e.target.value)}
          />
        </div>
        <div className="md:col-span-3 space-y-2">
          {message.text && (
            <p className={`text-xs ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold text-white shadow-neon disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save configuration'}
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-white/10 bg-black/40 p-5">
        <h2 className="text-sm font-semibold text-white">Badges</h2>
        <p className="mb-3 text-xs text-slate-400">
          Toggle which badges are currently active. Badge state is managed locally for now.
        </p>
        <div className="space-y-2">
          {badges.map((badge) => (
            <div
              key={badge._id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-semibold text-slate-50">{badge.name}</p>
                <p className="text-xs text-slate-400">{badge.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleBadge(badge._id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.active
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60'
                    : 'bg-slate-700/40 text-slate-200 border border-slate-500/60'
                  }`}
              >
                {badge.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminGamification;
