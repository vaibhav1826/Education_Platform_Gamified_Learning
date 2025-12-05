import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Users, Eye, Calendar } from 'lucide-react';
import api from '../../api/index.js';

const QuizDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const { data } = await api.get(`/teacher/quizzes/${id}`);
      setQuiz(data);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading quiz details...</div>;
  }

  if (!quiz) {
    return <div className="text-slate-400">Quiz not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="text-slate-400 hover:text-white mb-2"
          >
            ← Back to Quizzes
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
          {quiz.instructions && <p className="text-slate-400">{quiz.instructions}</p>}
        </div>
        <button
          onClick={() => navigate(`/teacher/quizzes/${id}/submissions`)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold flex items-center gap-2"
        >
          <Eye className="w-5 h-5" />
          View Submissions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Questions ({quiz.questions?.length || 0})
            </h2>
            <div className="space-y-4">
              {quiz.questions?.map((q, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-black/20 border border-white/5">
                  <p className="text-sm font-medium text-white mb-3">
                    {idx + 1}. {q.questionText}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg text-sm ${
                          oIdx === q.correctIndex
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-black/20 text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                        {oIdx === q.correctIndex && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Quiz Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="w-4 h-4" />
                <span>{quiz.assignedBatches?.length || 0} batch(es)</span>
              </div>
              {quiz.scheduledAt && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(quiz.scheduledAt).toLocaleString()}</span>
                </div>
              )}
              {quiz.timeLimit && (
                <div className="text-sm text-slate-400">
                  Time Limit: {quiz.timeLimit} minutes
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;

