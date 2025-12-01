import { useState } from 'react';
import useDebounce from '../hooks/useDebounce.js';
import useCourses from '../hooks/useCourses.js';

const AdminDashboard = () => {
  const { courses } = useCourses();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 400);

  const filtered = courses.filter((course) => course.title.toLowerCase().includes(debounced.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Admin Panel</h2>
          <p className="text-slate-400">Manage courses and monitor platform health.</p>
        </div>
        <input
          className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg"
          placeholder="Search courses"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((course) => (
          <div key={course._id} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <h3 className="text-xl font-semibold">{course.title}</h3>
            <p className="text-sm text-slate-400">{course.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;