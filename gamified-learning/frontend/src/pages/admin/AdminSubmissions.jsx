import { useEffect, useState } from 'react';
import useApi from '../../hooks/useApi.js';

const AdminSubmissions = () => {
  const api = useApi();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/submissions');
        setSubs(data || []);
      } catch (err) {
        console.error('Failed to load submissions', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Submissions</h2>
          <p className="text-xs text-slate-400">Recent quiz submissions for moderation.</p>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading submissions...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Quiz</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s._id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-slate-100">{s.student?.name || 'Student'}</td>
                <td className="px-4 py-3 text-slate-300">{s.quiz?.title || 'Quiz'}</td>
                <td className="px-4 py-3 text-slate-300">{s.batch?.name || 'Batch'}</td>
                <td className="px-4 py-3 text-slate-200">
                  {s.score}/{s.totalQuestions}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(s.createdAt || s.submittedAt).toLocaleString()}</td>
              </tr>
            ))}
            {subs.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-400">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSubmissions;

