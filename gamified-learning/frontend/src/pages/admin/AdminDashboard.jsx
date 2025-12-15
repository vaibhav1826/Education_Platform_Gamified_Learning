import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import useApi from '../../hooks/useApi.js';
import { useSocket } from '../../context/SocketContext.jsx';
import AdminStatCard from '../../components/admin/AdminStatCard.jsx';

const AdminDashboard = () => {
  const api = useApi();
  const { subscribe } = useSocket();

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    quizzes: 0,
    batches: 0
  });

  const [pendingCourses, setPendingCourses] = useState(0);
  const [pendingQuizzes, setPendingQuizzes] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIXED: clean load function without recursion
  const loadDashboard = useCallback(async () => {
    try {
      const [
        studentsRes,
        teachersRes,
        coursesRes,
        quizzesRes,
        batchesRes,
        submissionsRes
      ] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/teachers'),
        api.get('/admin/courses'),
        api.get('/admin/quizzes'),
        api.get('/admin/batches'),
        api.get('/admin/submissions?limit=10')
      ]);

      const students = studentsRes.data || [];
      const teachers = teachersRes.data || [];
      const courses = coursesRes.data || [];
      const quizzes = quizzesRes.data || [];
      const batches = batchesRes.data || [];
      const submissions = submissionsRes.data || [];

      setStats({
        students: students.length,
        teachers: teachers.length,
        courses: courses.length,
        quizzes: quizzes.length,
        batches: batches.length
      });

      const pendingC = courses.filter((c) => c.approvalStatus === 'pending').length;
      const pendingQ = quizzes.filter((q) => q.approvalStatus === 'pending').length;

      setPendingCourses(pendingC);
      setPendingQuizzes(pendingQ);

      const activities = [];

      // Submissions
      submissions.slice(0, 5).forEach((sub) => {
        activities.push({
          id: `sub-${sub._id}`,
          type: 'quiz',
          message: `${sub.student?.name || 'Student'} submitted "${sub.quiz?.title || 'Quiz'}"`,
          time: sub.submittedAt || sub.createdAt,
          link: `/admin/submissions`
        });
      });

      // Pending Courses
      courses
        .filter((c) => c.approvalStatus === 'pending')
        .slice(0, 3)
        .forEach((course) => {
          activities.push({
            id: `course-${course._id}`,
            type: 'course',
            message: `Course "${course.title}" needs approval`,
            time: course.createdAt,
            link: `/admin/courses`
          });
        });

      // Pending Quizzes
      quizzes
        .filter((q) => q.approvalStatus === 'pending')
        .slice(0, 2)
        .forEach((quiz) => {
          activities.push({
            id: `quiz-${quiz._id}`,
            type: 'quiz',
            message: `Quiz "${quiz.title}" needs approval`,
            time: quiz.createdAt,
            link: `/admin/quizzes`
          });
        });

      activities.sort((a, b) => new Date(b.time) - new Date(a.time));

      setRecentActivity(activities.slice(0, 8));
    } catch (err) {
      console.error('Dashboard load failed', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // FIXED: Run loadDashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Real-time updates
  useEffect(() => {
    const unsubscribes = [
      subscribe('batch:created', loadDashboard),
      subscribe('batch:updated', loadDashboard),
      subscribe('quiz:created', loadDashboard),
      subscribe('quiz:updated', loadDashboard),
      subscribe('course:created', loadDashboard),
      subscribe('course:updated', loadDashboard),
      subscribe('submission:new', loadDashboard),
      subscribe('announcement:new', loadDashboard)
    ];

    return () => unsubscribes.forEach((u) => u());
  }, [subscribe, loadDashboard]);


  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminStatCard label="Total Students" value={loading ? '...' : stats.students.toLocaleString()} subtitle="Across all cohorts" />
        <AdminStatCard label="Total Teachers" value={loading ? '...' : stats.teachers.toLocaleString()} subtitle="Active accounts" />
        <AdminStatCard label="Total Courses" value={loading ? '...' : stats.courses.toLocaleString()} subtitle={`${pendingCourses} pending`} />
        <AdminStatCard label="Total Quizzes" value={loading ? '...' : stats.quizzes.toLocaleString()} subtitle={`${pendingQuizzes} pending`} />
        <AdminStatCard label="Total Batches" value={loading ? '...' : stats.batches.toLocaleString()} subtitle="Active batches" />
      </section>

      {/* Recent Activity + Quick Actions */}
      <section className="grid gap-4 lg:grid-cols-[2fr_1.3fr]">

        {/* RECENT ACTIVITY */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card">
          <h2 className="text-sm font-semibold text-white">Recent activity</h2>
          <p className="mb-4 mt-1 text-xs text-slate-400">Latest events across the platform.</p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl border border-white/5 bg-black/40" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400">No recent activity.</p>
          ) : (
            <ul className="space-y-3 text-sm text-slate-200">
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between rounded-xl border border-white/5 bg-black/40 px-3 py-2 transition hover:bg-black/60"
                >
                  <div className="pr-3 flex-1">
                    <p className="text-slate-100">{item.message}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.type}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-black to-accent/10 p-5">
          <h2 className="text-sm font-semibold text-white">Quick actions</h2>
          <p className="mb-4 mt-1 text-xs text-slate-300">Pending items requiring attention.</p>

          <div className="space-y-3">
            {pendingCourses > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-xs font-semibold text-amber-300">{pendingCourses} courses pending</p>
                <p className="mt-1 text-[11px] text-slate-300">Review and approve courses</p>
                <Link to="/admin/courses" className="mt-2 inline-block text-xs text-primary underline">
                  Go to courses →
                </Link>
              </div>
            )}

            {pendingQuizzes > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-xs font-semibold text-amber-300">{pendingQuizzes} quizzes pending</p>
                <p className="mt-1 text-[11px] text-slate-300">Review and approve quizzes</p>
                <Link to="/admin/quizzes" className="mt-2 inline-block text-xs text-primary underline">
                  Go to quizzes →
                </Link>
              </div>
            )}

            {pendingCourses === 0 && pendingQuizzes === 0 && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                <p className="text-xs font-semibold text-emerald-300">All clear!</p>
                <p className="mt-1 text-[11px] text-slate-300">No pending approvals</p>
              </div>
            )}

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <Link to="/admin/users" className="block rounded-lg border border-white/10 bg-black/40 px-3 py-2 hover:bg-white/5">
                Manage Users
              </Link>
              <Link to="/admin/batches" className="block rounded-lg border border-white/10 bg-black/40 px-3 py-2 hover:bg-white/5">
                View Batches
              </Link>
              <Link to="/admin/settings" className="block rounded-lg border border-white/10 bg-black/40 px-3 py-2 hover:bg-white/5">
                Platform Settings
              </Link>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};

export default AdminDashboard;
