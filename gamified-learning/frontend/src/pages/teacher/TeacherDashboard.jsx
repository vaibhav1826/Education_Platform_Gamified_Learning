import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, BookOpen, Users, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import AdminStatCard from '../../components/admin/AdminStatCard.jsx';
import useApi from '../../hooks/useApi.js';
import { useSocket } from '../../context/SocketContext.jsx';

const TeacherDashboard = () => {
  const api = useApi();
  const { subscribe } = useSocket();
  const [stats, setStats] = useState({
    batches: 0,
    students: 0,
    quizzes: 0,
    courses: 0,
    submissions: 0,
    avgPerformance: 0
  });
  const [pendingCourses, setPendingCourses] = useState(0);
  const [pendingQuizzes, setPendingQuizzes] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [recentBatches, setRecentBatches] = useState([]);
  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
      try {
        const [
          dashboardRes,
          batchesRes,
          quizzesRes,
          coursesRes,
          announcementsRes
        ] = await Promise.all([
          api.get('/teacher/dashboard'),
          api.get('/teacher/batches'),
          api.get('/teacher/quizzes'),
          api.get('/courses?mine=true'),
          api.get('/teacher/announcements/admin').catch(() => ({ data: [] }))
        ]);

        const dashboard = dashboardRes.data || {};
        const batches = batchesRes.data || [];
        const quizzes = quizzesRes.data || [];
        const courses = coursesRes.data || [];
        const announcements = announcementsRes.data || [];

        // Calculate stats
        const allStudentIds = [...new Set(batches.flatMap((b) => (b.students || []).map((s) => s.toString())))];
        const avgPerf = dashboard.stats?.averagePerformance || 0;

        setStats({
          batches: batches.length,
          students: allStudentIds.length,
          quizzes: quizzes.length,
          courses: courses.length,
          submissions: dashboard.recentActivities?.length || 0,
          avgPerformance: avgPerf
        });

        // Pending approvals
        const pendingC = courses.filter((c) => c.approvalStatus === 'pending').length;
        const pendingQ = quizzes.filter((q) => q.approvalStatus === 'pending').length;
        setPendingCourses(pendingC);
        setPendingQuizzes(pendingQ);

        // Upcoming tests
        const upcoming = quizzes
          .filter((q) => q.scheduledAt && new Date(q.scheduledAt) > new Date())
          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
          .slice(0, 5)
          .map((q) => ({
            id: q._id,
            title: q.title,
            scheduledAt: q.scheduledAt,
            batches: q.assignedBatches?.length || 0
          }));
        setUpcomingTests(upcoming);

        // Recent batches
        setRecentBatches(batches.slice(0, 3));

        // Admin announcements
        setAdminAnnouncements(announcements.slice(0, 3));

        // Build recent activity
        const activities = [];

        // Recent submissions from dashboard
        if (dashboard.recentActivities) {
          dashboard.recentActivities.forEach((act) => {
            activities.push({
              id: `sub-${act.createdAt}-${Math.random()}`,
              type: 'quiz_submission',
              message: `${act.student} submitted "${act.quiz}"`,
              time: act.createdAt,
              batch: act.batch,
              score: act.score
            });
          });
        }

        // Recent course approvals/rejections
        courses
          .filter((c) => c.approvalStatus !== 'approved' || new Date(c.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .slice(0, 3)
          .forEach((course) => {
            activities.push({
              id: `course-${course._id}`,
              type: 'course',
              message: `Course "${course.title}" ${course.approvalStatus === 'approved' ? 'approved' : course.approvalStatus === 'rejected' ? 'rejected' : 'pending approval'}`,
              time: course.updatedAt || course.createdAt,
              status: course.approvalStatus
            });
          });

        // Recent quiz approvals/rejections
        quizzes
          .filter((q) => q.approvalStatus !== 'approved' || new Date(q.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .slice(0, 2)
          .forEach((quiz) => {
            activities.push({
              id: `quiz-${quiz._id}`,
              type: 'quiz',
              message: `Quiz "${quiz.title}" ${quiz.approvalStatus === 'approved' ? 'approved' : quiz.approvalStatus === 'rejected' ? 'rejected' : 'pending approval'}`,
              time: quiz.updatedAt || quiz.createdAt,
              status: quiz.approvalStatus
            });
          });

        // Sort by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActivity(activities.slice(0, 10));
      } catch (err) {
        console.error('Dashboard load failed', err);
      } finally {
        setLoading(false);
      }
  }, [api]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Real-time updates via socket
  useEffect(() => {
    const unsubscribes = [
      subscribe('batch:created', () => loadDashboard()),
      subscribe('batch:updated', () => loadDashboard()),
      subscribe('batch:joined', () => loadDashboard()),
      subscribe('quiz:created', () => loadDashboard()),
      subscribe('quiz:assigned', () => loadDashboard()),
      subscribe('quiz:updated', () => loadDashboard()),
      subscribe('submission:new', () => loadDashboard()),
      subscribe('announcement:new', () => loadDashboard()),
      subscribe('notification:new', () => loadDashboard())
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [subscribe, loadDashboard]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminStatCard
          label="Total Batches"
          value={loading ? '...' : stats.batches.toLocaleString()}
          subtitle="Created batches"
        />
        <AdminStatCard
          label="Total Students"
          value={loading ? '...' : stats.students.toLocaleString()}
          subtitle="Across all batches"
        />
        <AdminStatCard
          label="Total Quizzes"
          value={loading ? '...' : stats.quizzes.toLocaleString()}
          subtitle={`${pendingQuizzes} pending`}
        />
        <AdminStatCard
          label="Total Courses"
          value={loading ? '...' : stats.courses.toLocaleString()}
          subtitle={`${pendingCourses} pending`}
        />
        <AdminStatCard
          label="Avg Performance"
          value={loading ? '...' : `${stats.avgPerformance}%`}
          subtitle="Student average"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1.3fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card">
          <h2 className="text-sm font-semibold text-white">Recent activity</h2>
          <p className="mb-4 mt-1 text-xs text-slate-400">Latest submissions and events.</p>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl border border-white/5 bg-black/40" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No recent activities</p>
          ) : (
            <ul className="space-y-3 text-sm text-slate-200">
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between rounded-xl border border-white/5 bg-black/40 px-3 py-2 transition hover:bg-black/60"
                >
                  <div className="pr-3 flex-1">
                    <p className="text-slate-100">{item.message}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      {item.type === 'quiz_submission' && `${item.batch} • Score: ${item.score || 'N/A'}`}
                      {item.type === 'course' && `Course • ${item.status || 'pending'}`}
                      {item.type === 'quiz' && `Quiz • ${item.status || 'pending'}`}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-black to-accent/10 p-5">
            <h2 className="text-sm font-semibold text-white">Upcoming tests</h2>
            <p className="mb-4 mt-1 text-xs text-slate-300">Scheduled quizzes for your batches.</p>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-black/40" />
                ))}
              </div>
            ) : upcomingTests.length === 0 ? (
              <p className="text-xs text-slate-400">No upcoming tests scheduled</p>
            ) : (
              <ul className="space-y-2 text-xs text-slate-200">
                {upcomingTests.map((test) => (
                  <li key={test.id} className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{test.title}</p>
                      <p className="text-slate-400">
                        {new Date(test.scheduledAt).toLocaleDateString()} • {test.batches} batch(es)
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(pendingCourses > 0 || pendingQuizzes > 0 || adminAnnouncements.length > 0) && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-semibold text-white">Notifications</h2>
              <p className="mb-4 mt-1 text-xs text-slate-400">Items requiring attention.</p>
              <div className="space-y-3">
                {pendingCourses > 0 && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-300">{pendingCourses} courses pending</p>
                        <p className="mt-1 text-[11px] text-slate-300">Awaiting admin approval</p>
                        <a href="/teacher/courses" className="mt-1 inline-block text-xs text-primary underline">
                          View courses →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                {pendingQuizzes > 0 && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-300">{pendingQuizzes} quizzes pending</p>
                        <p className="mt-1 text-[11px] text-slate-300">Awaiting admin approval</p>
                        <a href="/teacher/quizzes" className="mt-1 inline-block text-xs text-primary underline">
                          View quizzes →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                {adminAnnouncements.length > 0 && (
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-primary">Admin announcements</p>
                        <p className="mt-1 text-[11px] text-slate-300">{adminAnnouncements.length} new message(s)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-semibold text-white">Quick actions</h2>
            <div className="mt-3 space-y-2 text-xs">
              <a
                href="/teacher/batches/create"
                className="block rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-slate-200 hover:bg-white/5 transition"
              >
                Create Batch
              </a>
              <a
                href="/teacher/quizzes/create"
                className="block rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-slate-200 hover:bg-white/5 transition"
              >
                Create Quiz
              </a>
              <a
                href="/teacher/leaderboard"
                className="block rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-slate-200 hover:bg-white/5 transition"
              >
                View Leaderboard
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;

