import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi.js';

const AdminCourses = () => {
  const api = useApi();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/courses');
        setCourses(data || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const setStatus = async (course, status) => {
    try {
      const { data } = await api.patch(`/admin/courses/${course._id}/status`, { status });
      setCourses((prev) => prev.map((c) => (c._id === course._id ? data : c)));
    } catch (err) {
      console.error('Failed to update course', err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Courses</h2>
          <p className="text-xs text-slate-400">
            Review and moderate all courses submitted by teachers across the platform.
          </p>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading courses...</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.15em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-slate-100">{course.title}</td>
                <td className="px-4 py-3 text-slate-300">{course.teacher?.name}</td>
                <td className="px-4 py-3 text-slate-300">{course.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${course.approvalStatus === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : course.approvalStatus === 'pending'
                        ? 'bg-amber-500/15 text-amber-200'
                        : 'bg-rose-500/15 text-rose-200'
                      }`}
                  >
                    {course.approvalStatus || 'approved'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-200">
                  <Link
                    to={`/courses/${course._id}`}
                    className="mr-2 rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10 inline-block"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    onClick={() => setStatus(course, course.approvalStatus === 'approved' ? 'rejected' : 'approved')}
                  >
                    {course.approvalStatus === 'approved' ? 'Reject' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-400">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourses;


