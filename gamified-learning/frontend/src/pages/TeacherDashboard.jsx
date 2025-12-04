import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useCourses from '../hooks/useCourses.js';
import useAnalytics from '../hooks/useAnalytics.js';
import useApi from '../hooks/useApi.js';

const emptyQuestion = { prompt: '', type: 'mcq', options: ['', '', '', ''], answer: '', points: 1 };

const TeacherDashboard = () => {
  const { courses, refetch } = useCourses({ mine: true });
  const { data: analytics } = useAnalytics('teacher');
  const api = useApi();
  const [courseForm, setCourseForm] = useState({ title: '', description: '', category: '', levelRequirement: 1 });
  const [quizForm, setQuizForm] = useState({ title: '', courseId: '', timeLimit: 300, questions: [emptyQuestion] });
  const [announcement, setAnnouncement] = useState({ courseId: '', title: '', body: '' });
  const [status, setStatus] = useState(null);

  const averageProgress =
    analytics?.stats && analytics.stats.length > 0
      ? Math.round(analytics.stats.reduce((sum, entry) => sum + (entry.avgProgress || 0), 0) / analytics.stats.length)
      : 0;

  const stats = useMemo(
    () => [
      { label: 'Active Courses', value: courses.length },
      { label: 'Total Students', value: analytics?.stats?.reduce((sum, entry) => sum + (entry.totalStudents || 0), 0) || 0 },
      { label: 'Avg Progress', value: `${averageProgress}%` }
    ],
    [courses.length, analytics, averageProgress]
  );

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setStatus('Creating course...');
    await api.post('/courses', courseForm);
    setCourseForm({ title: '', description: '', category: '', levelRequirement: 1 });
    setStatus('Course created!');
    refetch();
  };

  const updateQuestion = (index, field, value) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      if (field === 'type' && value !== 'mcq') questions[index].options = [];
      if (field === 'type' && value === 'mcq' && questions[index].options.length === 0) {
        questions[index].options = ['', '', '', ''];
      }
      return { ...prev, questions };
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setStatus('Saving quiz...');
    const { data: quiz } = await api.post('/quizzes', {
      title: quizForm.title,
      course: quizForm.courseId,
      timeLimit: Number(quizForm.timeLimit)
    });
    await Promise.all(
      quizForm.questions.map((question) =>
        api.post(`/quizzes/${quiz._id}/questions`, {
          prompt: question.prompt,
          type: question.type,
          options: question.type === 'mcq' ? question.options : [],
          answer: question.answer,
          points: question.points || 1
        })
      )
    );
    setQuizForm({ title: '', courseId: '', timeLimit: 300, questions: [emptyQuestion] });
    setStatus('Quiz created!');
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.courseId) return;
    await api.post(`/courses/${announcement.courseId}/announcements`, {
      title: announcement.title,
      body: announcement.body
    });
    setAnnouncement({ courseId: '', title: '', body: '' });
    setStatus('Announcement sent!');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Teacher Command</p>
        <h1 className="text-3xl font-bold">Design learning journeys, track outcomes, inspire students.</h1>
        {status && <p className="text-sm text-emerald-300">{status}</p>}
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleCreateCourse} className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Course Builder</p>
            <h2 className="text-2xl font-semibold">Launch a new cohort</h2>
          </div>
          <input
            required
            placeholder="Course title"
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
          />
          <textarea
            required
            placeholder="Course description"
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
            rows={3}
            value={courseForm.description}
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Category"
              className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
              value={courseForm.category}
              onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
            />
            <input
              type="number"
              min="1"
              placeholder="Level requirement"
              className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
              value={courseForm.levelRequirement}
              onChange={(e) => setCourseForm({ ...courseForm, levelRequirement: Number(e.target.value) })}
            />
          </div>
          <button className="rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white">
            Create course
          </button>
        </form>

        <form onSubmit={handleCreateQuiz} className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Quiz Architect</p>
            <h2 className="text-2xl font-semibold">Design assessments</h2>
          </div>
          <input
            required
            placeholder="Quiz title"
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
            value={quizForm.title}
            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
          />
          <select
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
            value={quizForm.courseId}
            onChange={(e) => setQuizForm({ ...quizForm, courseId: e.target.value })}
          >
            <option value="">Attach to course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="30"
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
            value={quizForm.timeLimit}
            onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) })}
          />
          <div className="space-y-3">
            {quizForm.questions.map((question, index) => (
              <div key={`question-${index}`} className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
                <input
                  required
                  placeholder={`Question ${index + 1}`}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-sm"
                  value={question.prompt}
                  onChange={(e) => updateQuestion(index, 'prompt', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="rounded-xl border border-white/10 bg-black/40 p-2 text-sm"
                    value={question.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    className="rounded-xl border border-white/10 bg-black/40 p-2 text-sm"
                    value={question.points}
                    onChange={(e) => updateQuestion(index, 'points', Number(e.target.value))}
                  />
                </div>
                {question.type === 'mcq' &&
                  question.options.map((option, optIndex) => (
                    <input
                      key={`option-${optIndex}`}
                      placeholder={`Option ${optIndex + 1}`}
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-sm"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[optIndex] = e.target.value;
                        updateQuestion(index, 'options', newOptions);
                      }}
                    />
                  ))}
                <input
                  placeholder="Answer"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-sm"
                  value={question.answer}
                  onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setQuizForm((prev) => ({ ...prev, questions: [...prev.questions, emptyQuestion] }))}
              className="text-xs font-semibold text-slate-300"
            >
              + Add question
            </button>
          </div>
          <button className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white">
            Publish quiz
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Performance pulse</p>
              <h2 className="text-2xl font-semibold">Recent quiz outcomes</h2>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={analytics?.recentAttempts || []}>
                <XAxis
                  dataKey={(attempt) => new Date(attempt.createdAt).toLocaleDateString()}
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }} />
                <Line type="monotone" dataKey="score" stroke="#f472b6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <form onSubmit={handleAnnouncement} className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Announcements</p>
          <select
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
            value={announcement.courseId}
            onChange={(e) => setAnnouncement({ ...announcement, courseId: e.target.value })}
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Subject"
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
            value={announcement.title}
            onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
          />
          <textarea
            required
            placeholder="Message"
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm"
            value={announcement.body}
            onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })}
          />
          <button className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white">
            Send announcement
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My cohorts</h2>
          <span className="text-sm text-slate-400">Manage enrolled students & progress</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{course.title}</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {course.enrollmentCount} students
                </span>
              </div>
              <p className="text-sm text-slate-400">{course.description}</p>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                <span>{course.modules?.length || 0} modules</span>
                <span>&#x2022;</span>
                <span>{course.category || 'General'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;

