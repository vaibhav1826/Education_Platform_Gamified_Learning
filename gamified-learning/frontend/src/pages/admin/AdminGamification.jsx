// import axios from 'axios'; // TODO: connect to backend API
import { useState } from 'react';

const AdminGamification = () => {
  const [config, setConfig] = useState({
    xpPerLesson: 50,
    xpPerQuiz: 100,
    xpPerStreakDay: 20
  });

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: POST/PATCH to `/api/admin/gamification` with config
    // await axios.post('/api/admin/gamification', config);
  };

  const badges = [
    { id: 1, name: '5 Day Streak', description: 'Keep learning 5 days in a row', active: true },
    { id: 2, name: 'Quiz Hero', description: 'Score full marks in a quiz', active: true },
    { id: 3, name: 'Early Bird', description: 'Complete a lesson before 8 AM', active: false }
  ];

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
        <div className="md:col-span-3">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold text-white shadow-neon"
          >
            Save configuration
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-white/10 bg-black/40 p-5">
        <h2 className="text-sm font-semibold text-white">Badges</h2>
        <p className="mb-3 text-xs text-slate-400">
          Toggle which badges are currently active. Editing criteria can be wired to a backend later.
        </p>
        <div className="space-y-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-semibold text-slate-50">{badge.name}</p>
                <p className="text-xs text-slate-400">{badge.description}</p>
              </div>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  badge.active
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/60'
                    : 'bg-slate-700/40 text-slate-200 border border-slate-500/60'
                }`}
                // TODO: toggle badge active state via API
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


