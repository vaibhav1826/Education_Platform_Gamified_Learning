import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';

const StudentLeaderboard = () => {
  const api = useApi();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/student/leaderboard/global');
        setEntries(data || []);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      }
    };
    load();
  }, [api]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Global</p>
        <h1 className="mt-2 text-3xl font-display">Leaderboard</h1>
        <p className="text-slate-400">Across all batches under your teacher(s).</p>
      </div>

      <div className="glass-panel rounded-3xl border border-white/10 p-6 shadow-glass-card">
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.student?._id}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-primary">#{entry.rank}</span>
                <div>
                  <p className="font-semibold">{entry.student?.name}</p>
                  <p className="text-xs text-slate-500">{entry.totalScore} pts</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{entry.quizAttempts} quizzes</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">XP {entry.student?.xp ?? 0}</span>
              </div>
            </li>
          ))}
          {entries.length === 0 && <p className="text-sm text-slate-500">No leaderboard data yet.</p>}
        </ul>
      </div>
    </main>
  );
};

export default StudentLeaderboard;


