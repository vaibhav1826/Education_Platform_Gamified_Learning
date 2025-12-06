// import axios from 'axios'; // TODO: connect to backend API

const mockCourses = [
  { id: 1, title: 'Intro to React', teacher: 'Priya Sharma', category: 'Web', status: 'Published' },
  { id: 2, title: 'Data Structures', teacher: 'Alex Carter', category: 'CS Fundamentals', status: 'Draft' },
  { id: 3, title: 'Gamification 101', teacher: 'Admin User', category: 'Product', status: 'Published' }
];

const AdminCourses = () => {
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
            {mockCourses.map((course) => (
              <tr key={course.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-slate-100">{course.title}</td>
                <td className="px-4 py-3 text-slate-300">{course.teacher}</td>
                <td className="px-4 py-3 text-slate-300">{course.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      course.status === 'Published'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-500/15 text-amber-200'
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-200">
                  <button
                    type="button"
                    className="mr-2 rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    // TODO: open course details drawer / modal
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    // TODO: approve / unpublish via admin API
                  >
                    {course.status === 'Published' ? 'Unpublish' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
            {mockCourses.length === 0 && (
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


