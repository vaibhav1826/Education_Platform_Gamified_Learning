import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useApi from '../hooks/useApi.js';

const Stat = ({ label, value, accent }) => (
  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${accent || ''}`}>{value}</p>
  </div>
);

const StudentTestResult = () => {
  const { quizId } = useParams();
  const api = useApi();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/student/quizzes/${quizId}/result`);
        setResult(data);
      } catch (err) {
        console.error('Failed to load result', err);
      }
    };
    load();
  }, [api, quizId]);

  if (!result) return <main className="px-4 py-10 text-slate-400">Loading result...</main>;

  const percent = Math.round((result.submission.score / (result.submission.totalQuestions || 1)) * 100);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="glass-panel rounded-3xl border border-white/10 p-8 shadow-glass-card">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Quiz Result</p>
        <h1 className="mt-2 text-3xl font-display">{result.submission.quiz?.title}</h1>
        <p className="text-sm text-slate-400">
          Submitted on {new Date(result.submission.submittedAt || result.submission.createdAt).toLocaleString()}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Score" value={`${result.submission.score} pts`} accent="text-emerald-400" />
        <Stat label="Correct" value={`${result.submission.correctAnswers}/${result.submission.totalQuestions}`} />
        <Stat label="Accuracy" value={`${percent}%`} />
        <Stat label="Rank" value={`#${result.rank || '-'}`} />
        <Stat label="Participants" value={result.totalParticipants || 0} />
      </section>

      <div className="flex items-center justify-between">
        <Link to="/student/tests" className="text-sm text-primary">
          Back to tests
        </Link>
        <Link to="/student/dashboard" className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold shadow-neon">
          Go to dashboard
        </Link>
      </div>
    </main>
  );
};

export default StudentTestResult;


