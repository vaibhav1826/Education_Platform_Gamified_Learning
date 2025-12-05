import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, Users, Eye, Trash2 } from 'lucide-react';
import api from '../../api/index.js';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/teacher/quizzes');
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/teacher/quizzes/${id}`);
      setQuizzes(quizzes.filter((q) => q._id !== id));
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading quizzes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Quizzes</h1>
          <p className="text-slate-400">Create and manage quizzes for your batches</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/teacher/quizzes/create')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create Quiz
        </motion.button>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center shadow-glass-card">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No quizzes created yet</p>
          <button
            onClick={() => navigate('/teacher/quizzes/create')}
            className="px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition"
          >
            Create your first quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card hover:border-white/20 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{quiz.title}</h3>
                  {quiz.instructions && (
                    <p className="text-sm text-slate-400 line-clamp-2">{quiz.instructions}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <FileText className="w-4 h-4" />
                  {quiz.questions?.length || 0} questions
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users className="w-4 h-4" />
                  {quiz.assignedBatches?.length || 0} batch(es)
                </div>
                {quiz.scheduledAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(quiz.scheduledAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/teacher/quizzes/${quiz._id}`)}
                  className="flex-1 px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition flex items-center justify-center gap-1 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleDelete(quiz._id)}
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

export default Quizzes;

