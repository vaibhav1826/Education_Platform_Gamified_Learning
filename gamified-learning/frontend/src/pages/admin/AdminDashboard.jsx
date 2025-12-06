import AdminStatCard from '../../components/admin/AdminStatCard.jsx';

// TODO: connect to backend API for real stats
const mockStats = {
  students: 1240,
  teachers: 38,
  courses: 72,
  quizzes: 310
};

const recentActivity = [
  { id: 1, type: 'user', message: 'New student joined: Alex Carter', time: '2 min ago' },
  { id: 2, type: 'course', message: 'Course "Advanced React" submitted for review', time: '18 min ago' },
  { id: 3, type: 'quiz', message: '120 quiz attempts in the last hour', time: '1 hr ago' },
  { id: 4, type: 'leaderboard', message: 'Leaderboard recalculated for weekly rankings', time: '3 hr ago' }
];

const AdminDashboard = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total Students" value={mockStats.students} subtitle="Across all cohorts" />
        <AdminStatCard label="Total Teachers" value={mockStats.teachers} subtitle="Active this month" />
        <AdminStatCard label="Total Courses" value={mockStats.courses} subtitle="Published & draft" />
        <AdminStatCard label="Total Quizzes" value={mockStats.quizzes} subtitle="Available to learners" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1.3fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card">
          <h2 className="text-sm font-semibold text-white">Recent activity</h2>
          <p className="mb-4 mt-1 text-xs text-slate-400">Latest events across the platform.</p>
          <ul className="space-y-3 text-sm text-slate-200">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between rounded-xl border border-white/5 bg-black/40 px-3 py-2"
              >
                <div className="pr-3">
                  <p>{item.message}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.type}</p>
                </div>
                <span className="text-[11px] text-slate-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-black to-accent/10 p-5">
          <h2 className="text-sm font-semibold text-white">Admin quick notes</h2>
          <p className="mb-4 mt-1 text-xs text-slate-300">
            This panel is wired for a basic overview. Replace placeholder data by calling your admin analytics API.
          </p>
          <ul className="space-y-2 text-xs text-slate-200">
            <li>• TODO: hook into `/api/admin/stats` for real metrics.</li>
            <li>• TODO: show pending teacher approvals.</li>
            <li>• TODO: alert on failing background jobs or integrations.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;


