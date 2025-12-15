import { useState, useMemo } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import useCourses from '../hooks/useCourses.js';
import CourseCard from '../components/CourseCard.jsx';

const CourseList = () => {
  const { courses, loading } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract unique categories from courses
  const categories = useMemo(() => {
    const cats = new Set();
    courses.forEach(c => {
      if (c.category) cats.add(c.category);
    });
    return ['all', ...Array.from(cats)];
  }, [courses]);

  // Filter courses based on search and category
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = searchQuery === '' ||
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' ||
        course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Explore</p>
          <h1 className="mt-2 text-3xl font-display">All Courses</h1>
        </div>
        <div className="text-sm text-slate-400">
          {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search courses by title, description, or instructor..."
            className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select
            className="appearance-none rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-8 text-sm focus:border-primary focus:outline-none cursor-pointer min-w-[160px]"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900">
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading courses...</div>
      ) : filteredCourses.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </section>
      ) : (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No courses found</p>
          {searchQuery && (
            <p className="text-sm text-slate-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          )}
        </div>
      )}
    </main>
  );
};

export default CourseList;
