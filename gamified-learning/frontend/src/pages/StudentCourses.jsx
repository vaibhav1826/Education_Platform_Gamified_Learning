import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import useApi from '../hooks/useApi.js';

const StudentCourses = () => {
  const api = useApi();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/student/courses');
        setCourses(data || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    return courses.filter(enrollment =>
      enrollment.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.course?.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Courses</p>
          <h1 className="mt-2 text-3xl font-display">Your Courses</h1>
        </div>
        <div className="text-sm text-slate-400">
          {filteredCourses.length} enrolled {filteredCourses.length === 1 ? 'course' : 'courses'}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Search your courses..."
          className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading courses...</div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredCourses.map((enrollment) => (
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
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">{searchQuery ? 'No courses match your search' : 'No courses yet'}</p>
          {!searchQuery && (
            <Link to="/courses" className="text-sm text-primary hover:underline mt-2 inline-block">
              Browse available courses →
            </Link>
          )}
        </div>
      )}
    </main>
  );
};

export default StudentCourses;
