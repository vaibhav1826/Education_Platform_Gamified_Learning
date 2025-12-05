import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, User, Calendar } from 'lucide-react';
import api from '../../api/index.js';

const SubmissionsList = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [quizId]);

  const fetchSubmissions = async () => {
    try {
      const { data } = await api.get(`/teacher/quizzes/${quizId}/submissions`);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(`/teacher/quizzes/${quizId}`)}
          className="text-slate-400 hover:text-white mb-2"
        >
          ← Back to Quiz
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Submissions</h1>
        <p className="text-slate-400">{submissions.length} submission(s)</p>
      </div>

      <div className="space-y-3">
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center shadow-glass-card">
            <p className="text-slate-400">No submissions yet</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <motion.div
              key={submission._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full border-2 border-white/20 bg-black/40 overflow-hidden flex items-center justify-center">
                    {submission.student?.profileImage || submission.student?.avatar ? (
                      <img
                        src={((submission.student.profileImage || submission.student.avatar).startsWith('http')
                          ? (submission.student.profileImage || submission.student.avatar)
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${submission.student.profileImage || submission.student.avatar}`)}
                        alt={submission.student.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`text-sm font-semibold text-slate-300 ${submission.student?.profileImage || submission.student?.avatar ? 'hidden' : ''}`}>
                      {submission.student?.name?.charAt(0)?.toUpperCase() || (
                        <User className="w-6 h-6 text-slate-300" />
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{submission.student?.name}</p>
                    <p className="text-sm text-slate-400">{submission.student?.email}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {submission.correctAnswers}/{submission.totalQuestions}
                  </p>
                  <p className="text-sm text-slate-400">
                    {Math.round((submission.score / submission.totalQuestions) * 100)}%
                  </p>
                  <button
                    onClick={() => navigate(`/teacher/submissions/${submission._id}`)}
                    className="mt-2 px-4 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition flex items-center gap-1 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubmissionsList;

