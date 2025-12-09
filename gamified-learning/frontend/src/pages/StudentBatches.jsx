import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useApi from '../hooks/useApi.js';

const StudentBatches = () => {
  const api = useApi();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/student/batches');
        setBatches(data || []);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Your cohorts</p>
          <h1 className="mt-2 text-3xl font-display">Batches</h1>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-slate-400">Loading batches...</p>}
        {!loading && batches.length === 0 && <p className="text-slate-400">You&apos;re not in any batches yet.</p>}
        {batches.map((batch, idx) => (
          <motion.div
            key={batch._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-panel rounded-2xl border border-white/10 p-5 shadow-neon hover:-translate-y-1 hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Batch</p>
                <h3 className="text-xl font-semibold">{batch.name}</h3>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                {batch.students?.length || 0} students
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
              Teacher: {batch.teacher?.name || 'Unknown'}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">Joined {new Date(batch.createdAt).toLocaleDateString()}</div>
              <Link
                to={`/student/batches/${batch._id}`}
                className="rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold shadow-neon"
              >
                Go to Batch
              </Link>
            </div>
          </motion.div>
        ))}
      </section>
    </main>
  );
};

export default StudentBatches;


