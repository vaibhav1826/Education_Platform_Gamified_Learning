import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useApi from '../hooks/useApi.js';

const StudentTestDetails = () => {
  const { quizId } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/student/quizzes/${quizId}`);
        setQuiz(data);
      } catch (err) {
        console.error('Failed to load quiz', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api, quizId]);

  if (loading) return <main className="px-4 py-10 text-slate-400">Loading quiz...</main>;
  if (!quiz) return <main className="px-4 py-10 text-slate-400">Quiz not found.</main>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="glass-panel rounded-3xl border border-white/10 p-8 shadow-glass-card">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Quiz</p>
        <h1 className="mt-2 text-3xl font-display">{quiz.title}</h1>
        <p className="mt-2 text-slate-300">{quiz.instructions || 'Follow the instructions from your teacher and do your best.'}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
          <span className="rounded-full bg-white/5 px-3 py-1">{quiz.questions?.length || 0} questions</span>
          <span className="rounded-full bg-white/5 px-3 py-1">{quiz.timeLimit ? `${quiz.timeLimit} mins` : 'No time limit'}</span>
          <span className="rounded-full bg-white/5 px-3 py-1 capitalize">{quiz.status}</span>
        </div>

        <div className="mt-6 flex gap-3">
          {quiz.status === 'completed' ? (
            <Link to={`/student/tests/${quiz._id}/result`} className="rounded-full bg-emerald-500/80 px-5 py-2 text-sm font-semibold shadow-neon">
              View result
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/student/tests/${quiz._id}/start`, { state: { batchId: quiz.assignedBatches?.[0]?._id } })}
              className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold shadow-neon"
            >
              Start quiz
            </button>
          )}
          <Link to="/student/tests" className="rounded-full border border-white/10 px-5 py-2 text-sm text-slate-300">
            Back
          </Link>
        </div>
      </div>

      <section className="glass-panel rounded-2xl border border-white/10 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
        <div className="mt-4 space-y-4">
          {quiz.questions?.map((question, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/5 bg-white/5 p-4"
            >
              <p className="text-sm text-slate-400">Q{idx + 1}</p>
              <p className="text-lg font-semibold">{question.questionText}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {question.options.map((opt, optIdx) => (
                  <span key={optIdx} className="rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-slate-300">
                    {opt}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default StudentTestDetails;


