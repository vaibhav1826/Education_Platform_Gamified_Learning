import { motion } from 'framer-motion';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useGamification from '../hooks/useGamification.js';
import useCourses from '../hooks/useCourses.js';
import useLeaderboardData from '../hooks/useLeaderboardData.js';
import useAnalytics from '../hooks/useAnalytics.js';
import useApi from '../hooks/useApi.js';
import { useSocket } from '../context/SocketContext.jsx';
import LeaderboardWidget from '../components/LeaderboardWidget.jsx';
import GamificationProgress from '../components/GamificationProgress.jsx';
import CourseCard from '../components/CourseCard.jsx';

const StudentDashboard = () => {
  const api = useApi();
  const { subscribe } = useSocket();
  const { courses } = useCourses();
  const { leaders } = useLeaderboardData();
  const { user, requirements, progress } = useGamification();
  const { data: analytics } = useAnalytics('student');
  const [assignedTests, setAssignedTests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  const load = useCallback(async () => {
    try {
      const [testsRes, batchesRes, announcementRes] = await Promise.all([
        api.get('/student/quizzes/assigned'),
        api.get('/student/batches'),
        api.get('/student/announcements?limit=5')
      ]);
      setAssignedTests(testsRes.data || []);
      setBatches(batchesRes.data || []);
      setRecentAnnouncements(announcementRes.data || []);
    } catch (err) {
      console.error('Dashboard fetch failed', err);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time updates via socket
  useEffect(() => {
    const unsubscribes = [
      subscribe('batch:joined', () => load()),
      subscribe('batch:updated', () => load()),
      subscribe('quiz:assigned', () => load()),
      subscribe('announcement:new', () => load()),
      subscribe('submission:created', () => load()),
      subscribe('notification:new', () => load())
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [subscribe, load]);

  const upcomingTests = useMemo(
    () => assignedTests.filter((t) => t.status === 'upcoming' || t.status === 'active').slice(0, 3),
    [assignedTests]
  );
  const batchSummary = useMemo(() => batches.slice(0, 3), [batches]);

  const completedCourses = analytics?.enrollments?.filter((enrollment) => enrollment.status === 'completed').length || 0;
  const highlightCards = [
    { label: 'Current XP', value: `${user?.xp ?? 0} XP`, detail: 'Daily growth +320', accent: 'from-primary/80 to-primary/30' },
    {
      label: 'Learning Streak',
      value: `${user?.streak?.count ?? 1} days`,
      detail: 'Keep momentum going',
      accent: 'from-rose-500/70 to-rose-500/20'
    },
    { label: 'Courses Completed', value: completedCourses, detail: 'Keep finishing modules', accent: 'from-emerald-400/70 to-emerald-400/10' }
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 p-8 shadow-glass-card"
      >
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-b from-primary/10 via-transparent to-accent/10 blur-3xl" aria-hidden />
        <div className="relative grid gap-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Welcome back</p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl">
                {user?.name ? `Ready for your next quest, ${user.name}?` : 'Ready to level up your knowledge?'}
              </h1>
            </div>
            <GamificationProgress xp={user?.xp || 0} requirement={requirements || 100} />
            <div className="grid gap-4 sm:grid-cols-3">
              {highlightCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</div>
                  <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                  <p className="text-xs text-slate-400">{card.detail}</p>
                  <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${card.accent}`} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Upcoming tests</p>
              {upcomingTests.length === 0 && <p className="text-sm text-slate-500">No upcoming tests.</p>}
              {upcomingTests.map((quiz) => (
                <div key={quiz._id} className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="font-semibold">{quiz.title}</p>
                  <p className="text-xs text-slate-500">{quiz.questions?.length || 0} questions</p>
                </div>
              ))}
            </div>
            <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Batches</p>
              {batchSummary.length === 0 && <p className="text-sm text-slate-500">Join a batch to start.</p>}
              {batchSummary.map((batch) => (
                <div key={batch._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                  <div>
                    <p className="font-semibold">{batch.name}</p>
                    <p className="text-xs text-slate-500">{batch.students?.length || 0} students</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary">Batch</span>
                </div>
              ))}
            </div>
            <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quick links</p>
              <div className="flex flex-wrap gap-2">
                <Link to="/student/tests" className="rounded-full bg-white/5 px-3 py-1 text-xs hover:bg-primary/20">
                  Tests
                </Link>
                <Link to="/student/batches" className="rounded-full bg-white/5 px-3 py-1 text-xs hover:bg-primary/20">
                  Batches
                </Link>
                <Link to="/student/leaderboard" className="rounded-full bg-white/5 px-3 py-1 text-xs hover:bg-primary/20">
                  Leaderboard
                </Link>
                <Link to="/student/courses" className="rounded-full bg-white/5 px-3 py-1 text-xs hover:bg-primary/20">
                  Courses
                </Link>
              </div>
              <div className="mt-2 h-16 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-emerald-400/10 p-[1px]">
                <div className="h-full rounded-[14px] bg-black/70" />
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl border border-white/10 p-6 shadow-glass-card space-y-6"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Announcements</p>
              <div className="mt-3 space-y-3">
                {(recentAnnouncements?.length ? recentAnnouncements : analytics?.announcements || []).slice(0, 3).map((announcement) => (
                  <div key={announcement._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{announcement.author?.name}</span>
                      <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-slate-300">{announcement.body}</p>
                  </div>
                ))}
                {(!recentAnnouncements || recentAnnouncements.length === 0) && (!analytics?.announcements || analytics.announcements.length === 0) && (
                  <p className="text-sm text-slate-400">No announcements yet. Stay tuned!</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Recent Quiz History</p>
              <div className="mt-3 space-y-3">
                {(analytics?.attempts || []).slice(0, 4).map((attempt) => (
                  <div key={attempt._id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{attempt.quiz?.title || 'Quiz'}</span>
                      <span className="font-semibold text-white">{attempt.score} pts</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(attempt.createdAt).toLocaleString()} &middot; {attempt.correctCount}/{attempt.totalQuestions}{' '}
                      correct
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <div className="space-y-6">
          <LeaderboardWidget data={leaders} />

          {/* Certificates Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl border border-white/10 p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-xl text-yellow-500">
                🏆
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Certificates</p>
                <h3 className="text-lg font-semibold">Your Achievements</h3>
              </div>
            </div>

            <div className="space-y-3">
              {progress?.filter(p => p.completed || p.completionPct === 100).length > 0 ? (
                progress.filter(p => p.completed || p.completionPct === 100).map((p) => (
                  <div key={p._id} className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{p.course?.title || 'Course Completion'}</p>
                        <p className="text-xs text-slate-400">Completed on {new Date(p.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => alert(`Downloading certificate for ${p.course?.title}...`)}
                        className="rounded-full bg-white/10 p-2 text-white hover:bg-primary hover:text-black transition-colors"
                        title="Download Certificate"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                  <p className="text-sm text-slate-500">Complete courses to earn certificates!</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl border border-emerald-400/30 p-5 shadow-neon"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400/80 to-emerald-500/20 p-[2px] shadow-neon">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-black/60 text-xl">✨</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Achievement unlocked</p>
                <h3 className="text-xl font-semibold">Lumina Scholar</h3>
                <p className="text-sm text-slate-300">Complete 5 mastery modules to trigger holographic certificate animations.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main >
  );
};

export default StudentDashboard;