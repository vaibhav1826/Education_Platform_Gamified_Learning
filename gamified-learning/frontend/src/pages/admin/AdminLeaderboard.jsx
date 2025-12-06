// import axios from 'axios'; // TODO: connect to backend API
import { useState } from 'react';

const mockLeaderboard = [
  { id: 1, name: 'Alex Carter', xp: 5400, level: 12 },
  { id: 2, name: 'Priya Sharma', xp: 5100, level: 11 },
  { id: 3, name: 'Jordan Lee', xp: 4800, level: 10 }
];

const filters = ['all-time', 'weekly', 'monthly'];

const AdminLeaderboard = () => {
  const [filter, setFilter] = useState('all-time');

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Global leaderboard</h2>
          <p className="text-xs text-slate-400">
            Inspect rankings across the platform. You can later hook this into your actual leaderboard API.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 font-semibold capitalize transition ${
                filter === f
                  ? 'border-primary/70 bg-primary/20 text-white'
                  : 'border-white/10 bg-black/40 text-slate-300 hover:border-white/30'
              }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Level</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((entry, index) => (
              <tr key={entry.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-slate-200">#{index + 1}</td>
                <td className="px-4 py-3 text-slate-100">{entry.name}</td>
                <td className="px-4 py-3 text-slate-200">{entry.xp.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-200">{entry.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 p-4 text-xs text-slate-400">
        Placeholder chart area – you can mount a small chart component (e.g. Recharts) here to visualize XP over time.
      </div>
    </div>
  );
};

export default AdminLeaderboard;


