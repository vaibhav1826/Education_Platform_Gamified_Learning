import { useEffect, useState } from 'react';
import useApi from '../../hooks/useApi.js';

const AdminLeaderboard = () => {
  const api = useApi();
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, tRes] = await Promise.all([
          api.get('/admin/leaderboard/students'),
          api.get('/admin/leaderboard/teachers')
        ]);
        setStudents(sRes.data || []);
        setTeachers(tRes.data || []);
      } catch (err) {
        console.error('Failed to load leaderboards', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Leaderboards</h2>
          <p className="text-xs text-slate-400">Students (global) and Teachers (activity score).</p>
        </div>
        <div className="flex gap-2 text-xs">
          {['students', 'teachers'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTab(f)}
              className={`rounded-full border px-3 py-1 font-semibold capitalize transition ${
                tab === f ? 'border-primary/70 bg-primary/20 text-white' : 'border-white/10 bg-black/40 text-slate-300 hover:border-white/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Name</th>
              {tab === 'students' ? (
                <>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Attempts</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3">Batches</th>
                  <th className="px-4 py-3">Quizzes</th>
                  <th className="px-4 py-3">Activity</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {(tab === 'students' ? students : teachers).map((entry, index) => (
              <tr key={entry.rank || entry.teacher?._id || entry.student?._id || index} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-slate-200">#{entry.rank || index + 1}</td>
                <td className="px-4 py-3 text-slate-100">{entry.student?.name || entry.teacher?.name || 'User'}</td>
                {tab === 'students' ? (
                  <>
                    <td className="px-4 py-3 text-slate-200">{entry.totalScore}</td>
                    <td className="px-4 py-3 text-slate-200">{entry.attempts}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-slate-200">{entry.batches}</td>
                    <td className="px-4 py-3 text-slate-200">{entry.quizzes}</td>
                    <td className="px-4 py-3 text-slate-200">{Math.round(entry.activityScore)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 p-4 text-xs text-slate-400">
        Hook charts here if needed. Data is live from admin leaderboards.
      </div>
    </div>
  );
};

export default AdminLeaderboard;


