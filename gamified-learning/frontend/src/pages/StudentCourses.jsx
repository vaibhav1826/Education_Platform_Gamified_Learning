import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';

const StudentCourses = () => {
  const api = useApi();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/student/courses');
        setCourses(data || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    };
    load();
  }, [api]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Courses</p>
          <h1 className="mt-2 text-3xl font-display">Your Courses</h1>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {courses.map((enrollment) => (
          <div key={enrollment._id} className="glass-panel rounded-2xl border border-white/10 p-5 shadow-glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Course</p>
                <h3 className="text-xl font-semibold">{enrollment.course?.title}</h3>
                <p className="text-xs text-slate-500">Teacher: {enrollment.course?.teacher?.name || 'Unknown'}</p>
              </div>
              <Link
                to={`/courses/${enrollment.course?._id}`}
                className="rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold shadow-neon"
              >
                Open
              </Link>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span>{Math.round(enrollment.progressPct || 0)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/5">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${Math.min(100, Math.round(enrollment.progressPct || 0))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="text-sm text-slate-500">No courses yet.</p>}
      </div>
    </main>
  );
};

export default StudentCourses;


