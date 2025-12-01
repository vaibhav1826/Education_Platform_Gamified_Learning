import { useParams } from 'react-router-dom';
import useQuiz from '../hooks/useQuiz.js';
import useGamification from '../hooks/useGamification.js';

const QuizPage = () => {
  const { id } = useParams();
  const { quiz, answers, timeLeft, status, answerQuestion, submitQuiz } = useQuiz(id);
  const { triggerEvent } = useGamification();

  const handleSubmit = async () => {
    if (!quiz) return;
    const result = await submitQuiz(quiz.lesson);
    await triggerEvent('quiz_complete', result);
  };

  if (!quiz) return <p className="p-6">Loading quiz...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{quiz.title}</h2>
        <span className="text-accent font-semibold">Time left: {timeLeft}s</span>
      </div>
      {quiz.questions.map((question) => (
        <div key={question._id} className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-2">
          <p className="font-semibold">{question.prompt}</p>
          {question.options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={question._id}
                checked={answers[question._id] === option}
                onChange={() => answerQuestion(question._id, option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ))}
      <button
        disabled={status === 'finished'}
        onClick={handleSubmit}
        className="bg-primary px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default QuizPage;