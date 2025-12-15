import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';
import useApi from '../hooks/useApi.js';

const StudentBatches = () => {
  const api = useApi();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const fetchBatches = async () => {
    try {
      const { data } = await api.get('/student/batches');
      setBatches(data || []);
    } catch (err) {
      console.error('Failed to load batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [api]);

  const handleJoinBatch = async (e) => {
    e.preventDefault();
    setError('');
    setJoining(true);
    try {
      await api.post('/student/batches/join', { inviteCode: inviteCode.trim().toUpperCase() });
      setIsModalOpen(false);
      setInviteCode('');
      fetchBatches(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join batch. Please check the code.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Your cohorts</p>
          <h1 className="mt-2 text-3xl font-display">Batches</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={18} /> Join Batch
        </button>
      </div>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-slate-400">Loading batches...</p>}
        {!loading && batches.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed border-white/10 rounded-2xl">
            <p className="text-slate-400">You&apos;re not in any batches yet.</p>
            <p className="text-sm text-slate-500 mt-2">Click "Join Batch" to enter an invite code from your teacher.</p>
          </div>
        )}
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

      {/* Join Batch Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-midnight p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Join a Batch</h2>
                <button
                  onClick={() => { setIsModalOpen(false); setError(''); setInviteCode(''); }}
                  className="rounded-full p-1 hover:bg-white/10"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Enter the invite code provided by your teacher to join their batch.
              </p>
              <form onSubmit={handleJoinBatch} className="space-y-4">
                <input
                  required
                  placeholder="Enter invite code (e.g., ABC123)"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-center text-lg font-mono uppercase tracking-widest focus:border-primary focus:outline-none"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                {error && (
                  <p className="text-sm text-rose-400 text-center">{error}</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setError(''); setInviteCode(''); }}
                    className="flex-1 rounded-xl bg-white/5 py-3 font-semibold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={joining || inviteCode.length < 4}
                    className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {joining ? 'Joining...' : 'Join Batch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default StudentBatches;
