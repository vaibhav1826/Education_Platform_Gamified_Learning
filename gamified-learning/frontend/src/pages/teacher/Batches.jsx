import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, Trash2, Edit2, Eye } from 'lucide-react';
import api from '../../api/index.js';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data } = await api.get('/teacher/batches');
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await api.delete(`/teacher/batches/${id}`);
      setBatches(batches.filter((b) => b._id !== id));
    } catch (err) {
      alert('Failed to delete batch');
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading batches...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Batches</h1>
          <p className="text-slate-400">Create and manage your student batches</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/teacher/batches/create')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create Batch
        </motion.button>
      </div>

      {batches.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center shadow-glass-card">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No batches created yet</p>
          <button
            onClick={() => navigate('/teacher/batches/create')}
            className="px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition"
          >
            Create your first batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <motion.div
              key={batch._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card hover:border-white/20 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{batch.name}</h3>
                  {batch.subject && (
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {batch.subject}
                    </p>
                  )}
                </div>
              </div>
              {batch.description && (
                <p className="text-sm text-slate-300 mb-4 line-clamp-2">{batch.description}</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {batch.students?.length || 0} student{batch.students?.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/teacher/batches/${batch._id}`)}
                  className="flex-1 px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition flex items-center justify-center gap-1 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleDelete(batch._id)}
                  className="px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Batches;

