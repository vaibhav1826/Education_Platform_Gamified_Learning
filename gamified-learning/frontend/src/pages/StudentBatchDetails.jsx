import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useApi from '../hooks/useApi.js';

const StatPill = ({ label, value }) => (
  <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="text-lg font-semibold text-white">{value}</p>
  </div>
);

const StudentBatchDetails = () => {
  const { batchId } = useParams();
  const api = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: response } = await api.get(`/student/batches/${batchId}`);
        setData(response);
      } catch (err) {
        console.error('Failed to load batch detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api, batchId]);

  const testsByStatus = useMemo(() => {
    if (!data?.quizzes) return { active: [], upcoming: [], completed: [] };
    return data.quizzes.reduce(
      (acc, quiz) => {
        acc[quiz.status || 'active'].push(quiz);
        return acc;
      },
      { active: [], upcoming: [], completed: [] }
    );
  }, [data]);

  if (loading) return <main className="px-4 py-10 text-slate-400">Loading...</main>;
  if (!data) return <main className="px-4 py-10 text-slate-400">Batch not found.</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Batch</p>
          <h1 className="mt-2 text-3xl font-display">{data.batch.name}</h1>
          <p className="text-slate-400">Subject: {data.batch.subject || 'General'}</p>
        </div>
        <div className="flex gap-3">
          <StatPill label="Students" value={data.batch.students?.length || 0} />
          <StatPill label="Tests" value={data.quizzes?.length || 0} />
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Teacher</p>
                <h3 className="text-xl font-semibold">{data.batch.teacher?.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-black/50">
                  {data.batch.teacher?.profileImage && (
                    <img src={data.batch.teacher.profileImage} alt={data.batch.teacher.name} className="h-full w-full object-cover" />
                  )}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-400">{data.batch.description || 'No description provided.'}</p>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Batchmates</p>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{data.batch.students?.length} members</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.batch.students?.map((student) => (
                <div key={student._id} className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.email || 'Student'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tests & Quizzes</p>
              <Link to="/student/tests" className="text-sm text-primary">View all</Link>
            </div>
            {['active', 'upcoming', 'completed'].map((status) => (
              <div key={status}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{status} </p>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {testsByStatus[status]?.length === 0 && <p className="text-sm text-slate-500">No {status} tests.</p>}
                  {testsByStatus[status]?.map((quiz) => (
                    <div key={quiz._id} className="rounded-xl border border-white/5 bg-black/40 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{quiz.title}</h4>
                          <p className="text-xs text-slate-500">
                            {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No timer'} · {quiz.questions?.length || 0} questions
                          </p>
                        </div>
                        <Link
                          to={`/student/tests/${quiz._id}`}
                          className="text-xs rounded-full bg-primary/20 px-3 py-1 text-primary shadow-neon"
                        >
                          Open
                        </Link>
                      </div>
                      {quiz.score !== undefined && (
                        <p className="mt-2 text-sm text-emerald-400">
                          Score {quiz.score}/{quiz.totalQuestions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Batch Leaderboard</p>
              <Link to={`/student/batches/${batchId}#leaderboard`} className="text-xs text-primary">Refresh</Link>
            </div>
            <ul className="space-y-3">
              {data.leaderboard?.map((entry) => (
                <li key={entry.student?._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">#{entry.rank}</span>
                    <div className="h-9 w-9 rounded-full border border-white/10 bg-black/60" />
                    <div>
                      <p className="font-semibold">{entry.student?.name}</p>
                      <p className="text-xs text-slate-500">{entry.totalScore} pts</p>
                    </div>
                  </div>
                  <div className="h-2 w-24 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${Math.min(100, (entry.totalScore / (entry.totalQuestions || 1)) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
              {(!data.leaderboard || data.leaderboard.length === 0) && (
                <p className="text-sm text-slate-500">No leaderboard data yet.</p>
              )}
            </ul>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Announcements</p>
              <Link to="/student/dashboard" className="text-xs text-primary">View dashboard</Link>
            </div>
            <div className="space-y-3">
              {data.announcements?.map((note) => (
                <div key={note._id} className="rounded-xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{note.author?.name}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 font-semibold">{note.title}</p>
                  <p className="text-sm text-slate-300">{note.body}</p>
                </div>
              ))}
              {(!data.announcements || data.announcements.length === 0) && (
                <p className="text-sm text-slate-500">No announcements yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default StudentBatchDetails;


