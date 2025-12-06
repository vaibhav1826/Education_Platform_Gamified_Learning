// import axios from 'axios'; // TODO: connect to backend API
import AdminStatCard from '../../components/admin/AdminStatCard.jsx';

const AdminReports = () => {
  const metrics = {
    newUsersThisWeek: 42,
    quizAttemptsThisWeek: 320,
    enrollmentsThisWeek: 87
  };

  const topCourses = [
    { id: 1, title: 'Intro to React', enrollments: 230 },
    { id: 2, title: 'Data Structures', enrollments: 190 },
    { id: 3, title: 'Gamification 101', enrollments: 150 }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="New users this week"
          value={metrics.newUsersThisWeek}
          subtitle="Across students & teachers"
        />
        <AdminStatCard label="Quiz attempts" value={metrics.quizAttemptsThisWeek} subtitle="This week" />
        <AdminStatCard label="Course enrollments" value={metrics.enrollmentsThisWeek} subtitle="This week" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1.4fr]">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h2 className="text-sm font-semibold text-white">Top courses</h2>
          <p className="mb-3 text-xs text-slate-400">Based on enrollment count. Data is currently mocked.</p>
          <div className="space-y-2 text-sm text-slate-200">
            {topCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <span>{course.title}</span>
                <span className="text-xs text-slate-300">{course.enrollments} enrollments</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 p-5 text-xs text-slate-400">
          Placeholder analytics area – mount a chart (e.g. Recharts) here to visualize engagement over time. Connect to
          an admin analytics endpoint when ready.
        </div>
      </section>
    </div>
  );
};

export default AdminReports;


