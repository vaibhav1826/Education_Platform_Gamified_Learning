import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, X, Save } from 'lucide-react';
import api from '../../api/index.js';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    title: '',
    instructions: '',
    assignedBatches: [],
    scheduledAt: '',
    timeLimit: ''
  });
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctIndex: 0, points: 1 }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data } = await api.get('/teacher/batches');
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches:', err);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctIndex: 0, points: 1 }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a quiz title');
      return;
    }
    if (questions.some((q) => !q.questionText.trim() || q.options.some((o) => !o.trim()))) {
      alert('Please fill all question fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/teacher/quizzes', {
        ...form,
        questions: questions.map((q) => ({
          ...q,
          correctIndex: Number(q.correctIndex)
        })),
        assignedBatches: form.assignedBatches,
        scheduledAt: form.scheduledAt || undefined,
        timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined
      });
      navigate('/teacher/quizzes');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create quiz';
      alert(message);
      console.error('Create quiz error:', err);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Create Quiz</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quiz Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50"
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Instructions</label>
              <textarea
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50"
                placeholder="Enter instructions for students"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Scheduled Date</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={form.timeLimit}
                  onChange={(e) => setForm({ ...form, timeLimit: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Assign to Batches</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {batches.map((batch) => (
                  <label
                    key={batch._id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-black/20 hover:bg-black/30 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.assignedBatches.includes(batch._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, assignedBatches: [...form.assignedBatches, batch._id] });
                        } else {
                          setForm({
                            ...form,
                            assignedBatches: form.assignedBatches.filter((id) => id !== batch._id)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-white">{batch.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="p-4 rounded-lg bg-black/20 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-300">Question {qIndex + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                    placeholder="Enter question text"
                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctIndex === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correctIndex', oIndex)}
                          className="rounded"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          className="flex-1 rounded-xl border border-white/10 bg-black/40 p-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/teacher/quizzes')}
            className="px-6 py-3 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-black/60 transition"
          >
            Cancel
          </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Creating...' : 'Create Quiz'}
            </motion.button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;

