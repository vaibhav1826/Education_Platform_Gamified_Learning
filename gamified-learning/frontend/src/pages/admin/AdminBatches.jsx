import { useEffect, useMemo, useState } from 'react';
import useApi from '../../hooks/useApi.js';

const AdminBatches = () => {
  const api = useApi();
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/batches');
        setBatches(data || []);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const filtered = useMemo(
    () =>
      batches.filter(
        (b) =>
          !search ||
          b.name?.toLowerCase().includes(search.toLowerCase()) ||
          b.teacher?.name?.toLowerCase().includes(search.toLowerCase())
      ),
    [batches, search]
  );

  const handleDelete = async (batchId) => {
    if (!window.confirm('Delete this batch?')) return;
    try {
      await api.delete(`/admin/batches/${batchId}`);
      setBatches((prev) => prev.filter((b) => b._id !== batchId));
    } catch (err) {
      console.error('Failed to delete batch', err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Batches</h2>
          <p className="text-xs text-slate-400">All teacher-created batches with rosters.</p>
        </div>
        <input
          className="w-full max-w-xs rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-primary/60"
          placeholder="Search batch or teacher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading batches...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b._id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-slate-100">
                  <div className="font-semibold">{b.name}</div>
                  <p className="text-xs text-slate-500">{b.description || 'No description'}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{b.teacher?.name || '—'}</td>
                <td className="px-4 py-3 text-slate-200">{b.students?.length || 0}</td>
                <td className="px-4 py-3 text-right text-xs text-slate-200">
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    onClick={() => handleDelete(b._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-sm text-slate-400">
                  No batches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBatches;

