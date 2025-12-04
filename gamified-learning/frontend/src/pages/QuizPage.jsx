import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useQuiz from '../hooks/useQuiz.js';
import useGamification from '../hooks/useGamification.js';

const QuizPage = () => {
  const { id } = useParams();
  const { quiz, answers, timeLeft, status, answerQuestion, submitQuiz } = useQuiz(id);
  const { triggerEvent } = useGamification();
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!quiz || status === 'finished') return;
    const outcome = await submitQuiz();
    if (outcome) {
      setResult(outcome);
      await triggerEvent('quiz_complete', outcome);
    }
  };

  const timerPct = useMemo(() => {
    if (!quiz) return 0;
    return Math.max(0, Math.round((timeLeft / quiz.timeLimit) * 100));
  }, [quiz, timeLeft]);

  if (!quiz) return <p className="p-6">Loading quiz...</p>;

  const renderQuestion = (question) => {
    if (question.type === 'short_answer') {
      return (
        <textarea
          className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white"
          rows={3}
          value={answers[question._id] || ''}
          onChange={(e) => answerQuestion(question._id, e.target.value)}
        />
      );
    }
    const options =
      question.type === 'true_false' ? ['True', 'False'] : question.options;
    return options.map((option) => (
      <label key={option} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm">
        <input
          type="radio"
          name={question._id}
          checked={answers[question._id] === option}
          onChange={() => answerQuestion(question._id, option)}
        />
        <span>{option}</span>
      </label>
    ));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Timed quiz</p>
            <h2 className="text-3xl font-bold">{quiz.title}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Time left</p>
            <p className="text-2xl font-semibold text-white">{timeLeft}s</p>
            <div className="mt-2 h-2 w-40 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${timerPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {quiz.questions.map((question, index) => (
        <div key={question._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
            <span>Question {index + 1}</span>
            <span>{question.type.replace('_', ' ')}</span>
          </div>
          <p className="text-lg font-semibold text-white">{question.prompt}</p>
          <div className="space-y-2">{renderQuestion(question)}</div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          disabled={status === 'finished'}
          onClick={handleSubmit}
          className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Submit Quiz
        </button>
        {result && (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm text-white">
            Score {result.score}/{result.totalPoints} • {result.correct}/{result.total} correct
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
