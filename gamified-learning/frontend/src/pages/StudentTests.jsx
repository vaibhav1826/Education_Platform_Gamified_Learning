import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useApi from '../hooks/useApi.js';

const statusLabels = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed'
};

const StudentTests = () => {
  const api = useApi();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/student/quizzes/assigned');
        setTests(data || []);
      } catch (err) {
        console.error('Failed to load tests', err);
      }
    };
    load();
  }, [api]);

  const grouped = useMemo(
    () =>
      tests.reduce(
        (acc, quiz) => {
          acc[quiz.status || 'active'].push(quiz);
          return acc;
        },
        { upcoming: [], active: [], completed: [] }
      ),
    [tests]
  );

  const renderCard = (quiz, idx) => (
    <motion.div
      key={quiz._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="glass-panel rounded-2xl border border-white/10 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{statusLabels[quiz.status] || 'Active'}</p>
          <h3 className="text-xl font-semibold">{quiz.title}</h3>
          <p className="text-xs text-slate-500">
            {quiz.timeLimit ? `${quiz.timeLimit} min · ` : ''}
            {quiz.questions?.length || 0} questions
          </p>
        </div>
        <Link
          to={quiz.status === 'completed' ? `/student/tests/${quiz._id}/result` : `/student/tests/${quiz._id}`}
          className="rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold shadow-neon"
        >
          {quiz.status === 'completed' ? 'View result' : 'Open'}
        </Link>
      </div>
      {quiz.assignedBatches?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
          {quiz.assignedBatches.map((b) => (
            <span key={b._id || b} className="rounded-full bg-white/5 px-2 py-1">
              {b.name || 'Batch'}
            </span>
          ))}
        </div>
      )}
      {quiz.score !== undefined && (
        <p className="mt-3 text-sm text-emerald-400">
          You scored {quiz.score}/{quiz.totalQuestions}
        </p>
      )}
    </motion.div>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Assessments</p>
          <h1 className="mt-2 text-3xl font-display">Tests & Quizzes</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(grouped).map(([status, quizzes]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{statusLabels[status]}</p>
              <span className="text-xs text-slate-400">{quizzes.length} items</span>
            </div>
            <div className="space-y-3">
              {quizzes.length === 0 && <p className="text-sm text-slate-500">No {status} tests.</p>}
              {quizzes.map(renderCard)}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default StudentTests;


