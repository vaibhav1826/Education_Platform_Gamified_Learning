import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, User } from 'lucide-react';
import api from '../../api/index.js';

const SubmissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const { data } = await api.get(`/teacher/submissions/${id}`);
      setSubmission(data);
    } catch (err) {
      console.error('Failed to load submission:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading submission...</div>;
  }

  if (!submission) {
    return <div className="text-slate-400">Submission not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(`/teacher/quizzes/${submission.quiz?._id}/submissions`)}
          className="text-slate-400 hover:text-white mb-2"
        >
          ← Back to Submissions
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Submission Details</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border-2 border-white/20 bg-black/40 overflow-hidden flex items-center justify-center">
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
              <span className={`text-lg font-semibold text-slate-300 ${submission.student?.profileImage || submission.student?.avatar ? 'hidden' : ''}`}>
                {submission.student?.name?.charAt(0)?.toUpperCase() || (
                  <User className="w-8 h-8 text-slate-300" />
                )}
              </span>
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{submission.student?.name}</p>
              <p className="text-sm text-slate-400">{submission.student?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {submission.correctAnswers}/{submission.totalQuestions}
            </p>
            <p className="text-lg text-slate-400">
              {Math.round((submission.score / submission.totalQuestions) * 100)}%
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {submission.quiz?.questions?.map((question, qIdx) => {
          const answer = submission.answers?.find((a) => a.questionIndex === qIdx);
          const isCorrect = answer?.isCorrect;
          return (
            <motion.div
              key={qIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIdx * 0.1 }}
              className={`rounded-2xl border-2 border-white/10 bg-white/5 p-5 shadow-glass-card ${
                isCorrect ? 'border-green-500/30' : 'border-red-500/30'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white mb-3">
                    {qIdx + 1}. {question.questionText}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((opt, oIdx) => {
                      const isSelected = answer?.selectedIndex === oIdx;
                      const isCorrectAnswer = oIdx === question.correctIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-lg text-sm ${
                            isCorrectAnswer
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : isSelected
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-black/20 text-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                          {isCorrectAnswer && ' ✓ Correct'}
                          {isSelected && !isCorrectAnswer && ' ✗ Selected'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionDetails;

