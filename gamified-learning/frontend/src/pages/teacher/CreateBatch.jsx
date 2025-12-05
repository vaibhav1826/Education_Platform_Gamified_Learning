import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import api from '../../api/index.js';

const CreateBatch = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    subject: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter a batch name');
      return;
    }
    setLoading(true);
    try {
      await api.post('/teacher/batches', form);
      navigate('/teacher/batches');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create batch';
      alert(message);
      console.error('Create batch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/teacher/batches')}
          className="text-slate-400 hover:text-white mb-2"
        >
          ← Back to Batches
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Create Batch</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Batch Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50"
              placeholder="Enter batch name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50"
              placeholder="Optional description"
              rows={4}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/teacher/batches')}
              className="px-6 py-3 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/60 transition"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Creating...' : 'Create Batch'}
            </motion.button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default CreateBatch;

