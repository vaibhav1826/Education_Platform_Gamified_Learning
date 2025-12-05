import { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, TrendingUp, Clock, Activity } from 'lucide-react';
import AdminStatCard from '../../components/admin/AdminStatCard.jsx';
import api from '../../api/index.js';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/teacher/dashboard');
        setData(data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  const recentActivity = (data?.recentActivities || []).map((activity, idx) => ({
    id: idx,
    type: 'quiz',
    message: `${activity.student} submitted "${activity.quiz}"`,
    time: new Date(activity.createdAt).toLocaleTimeString(),
    batch: activity.batch,
    score: activity.score
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Total Batches"
          value={data?.stats?.totalBatches || 0}
          subtitle="Created batches"
        />
        <AdminStatCard
          label="Total Students"
          value={data?.stats?.totalStudents || 0}
          subtitle="Across all batches"
        />
        <AdminStatCard
          label="Total Quizzes"
          value={data?.stats?.totalQuizzes || 0}
          subtitle="Created quizzes"
        />
        <AdminStatCard
          label="Avg Performance"
          value={`${data?.stats?.averagePerformance || 0}%`}
          subtitle="Student average"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1.3fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card">
          <h2 className="text-sm font-semibold text-white">Recent activity</h2>
          <p className="mb-4 mt-1 text-xs text-slate-400">Latest submissions and events.</p>
          <ul className="space-y-3 text-sm text-slate-200">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between rounded-xl border border-white/5 bg-black/40 px-3 py-2"
                >
                  <div className="pr-3">
                    <p>{item.message}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      {item.type} • {item.batch} • Score: {item.score}%
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">{item.time}</span>
                </li>
              ))
            ) : (
              <li className="text-center py-4 text-slate-400 text-sm">No recent activities</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-black to-accent/10 p-5">
          <h2 className="text-sm font-semibold text-white">Upcoming tests</h2>
          <p className="mb-4 mt-1 text-xs text-slate-300">
            Scheduled quizzes and assessments for your batches.
          </p>
          <ul className="space-y-2 text-xs text-slate-200">
            {data?.upcomingTests?.length > 0 ? (
              data.upcomingTests.map((test, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">{test.title}</p>
                    <p className="text-slate-400">
                      {new Date(test.scheduledAt).toLocaleDateString()} • {test.batches} batch(es)
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-slate-400">No upcoming tests scheduled</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;

