import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useApi from '../hooks/useApi.js';

const StudentTestStart = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApi();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/student/quizzes/${quizId}`);
        setQuiz(data);
      } catch (err) {
        console.error('Failed to load quiz', err);
      }
    };
    load();
  }, [api, quizId]);

  const handleSelect = (questionIndex, selectedIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: selectedIndex }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionIndex, selectedIndex]) => ({
        questionIndex: Number(questionIndex),
        selectedIndex
      }));
      const batchId = location.state?.batchId || quiz.assignedBatches?.[0]?._id || quiz.assignedBatches?.[0];
      await api.post(`/student/quizzes/${quiz._id}/submit`, { answers: payload, batchId });
      navigate(`/student/tests/${quiz._id}/result`);
    } catch (err) {
      console.error('Submit failed', err);
      alert(err?.response?.data?.message || 'Unable to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz) return <main className="px-4 py-10 text-slate-400">Loading quiz...</main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="glass-panel rounded-3xl border border-white/10 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quiz in progress</p>
        <h1 className="text-3xl font-display">{quiz.title}</h1>
      </div>

      <section className="space-y-6">
        {quiz.questions?.map((question, idx) => (
          <div key={idx} className="glass-panel rounded-2xl border border-white/10 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Question {idx + 1}</p>
                <p className="mt-1 text-lg font-semibold">{question.questionText}</p>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{question.points || 1} pts</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {question.options.map((opt, optIdx) => {
                const isSelected = answers[idx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelect(idx, optIdx)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      isSelected ? 'border-primary bg-primary/10 text-white shadow-neon' : 'border-white/5 bg-black/40 text-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold shadow-neon disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </main>
  );
};

export default StudentTestStart;

