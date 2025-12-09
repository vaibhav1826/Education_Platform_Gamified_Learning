import { useEffect, useMemo, useState } from 'react';
import useApi from '../../hooks/useApi.js';

const AdminQuizzes = () => {
  const api = useApi();
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/quizzes');
        setQuizzes(data || []);
      } catch (err) {
        console.error('Failed to load quizzes', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const filtered = useMemo(
    () =>
      quizzes.filter(
        (q) =>
          !search ||
          q.title?.toLowerCase().includes(search.toLowerCase()) ||
          q.createdBy?.name?.toLowerCase().includes(search.toLowerCase())
      ),
    [quizzes, search]
  );

  const setStatus = async (quiz, status) => {
    try {
      const { data } = await api.patch(`/admin/quizzes/${quiz._id}/status`, { status });
      setQuizzes((prev) => prev.map((q) => (q._id === quiz._id ? data : q)));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await api.delete(`/admin/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error('Failed to delete quiz', err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Quizzes</h2>
          <p className="text-xs text-slate-400">Moderate teacher-created quizzes.</p>
        </div>
        <input
          className="w-full max-w-xs rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-primary/60"
          placeholder="Search quiz or teacher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading quizzes...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Quiz</th>
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Questions</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q._id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-slate-100">
                  <div className="font-semibold">{q.title}</div>
                  <p className="text-xs text-slate-500">{q.instructions || 'No instructions'}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{q.createdBy?.name || '—'}</td>
                <td className="px-4 py-3 text-slate-200">{q.questions?.length || 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      q.approvalStatus === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : q.approvalStatus === 'pending'
                        ? 'bg-amber-500/15 text-amber-200'
                        : 'bg-rose-500/15 text-rose-200'
                    }`}
                  >
                    {q.approvalStatus || 'approved'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-200 space-x-2">
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    onClick={() => setStatus(q, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    onClick={() => setStatus(q, 'rejected')}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10 text-rose-200"
                    onClick={() => handleDelete(q._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-400">
                  No quizzes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminQuizzes;

