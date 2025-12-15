import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useCourse from '../hooks/useCourse.js';
import DiscussionList from '../components/discussion/DiscussionList.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';

const CoursePage = () => {
  const { id } = useParams();
  const { course, announcements, enroll } = useCourse(id);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum');

  if (!course) return <p className="p-6">Loading course...</p>;

  const handleEnroll = async () => {
    setEnrolling(true);
    await enroll();
    setEnrolling(false);
  };

  // Breadcrumb items for this course
  const breadcrumbItems = [
    { label: 'Courses', path: '/courses' },
    { label: course.title, path: `/courses/${id}`, isCurrent: true }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{course.category || 'Signature Track'}</p>
            <h2 className="text-3xl font-bold">{course.title}</h2>
            <p className="mt-2 text-slate-300">{course.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Instructor</p>
              <p className="text-lg font-semibold text-white">{course.teacher?.name || 'Lead Instructor'}</p>
            </div>
            {!course.isEnrolled && (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll now'}
              </button>
            )}
            {course.isEnrolled && (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-200">
                {Math.round(course.progressPct)}% complete
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex space-x-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'curriculum' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-white'}`}
        >
          Curriculum
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'announcements' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-white'}`}
        >
          Announcements
        </button>
        <button
          onClick={() => setActiveTab('discussions')}
          className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'discussions' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-white'}`}
        >
          Discussions (Q&A)
        </button>
      </div>

      {activeTab === 'curriculum' && (
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Curriculum</h3>
          {course.modules?.map((module) => (
            <div key={module._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold">{module.title}</h4>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {module.lessons?.length || 0} lessons
                </span>
              </div>
              <ul className="space-y-2 text-sm">
                {module.lessons?.map((lesson) => (
                  <li key={lesson._id} className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-2">
                    <div>
                      <p className="font-semibold text-white">{lesson.title}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{lesson.durationMinutes} min • {lesson.contentType}</p>
                    </div>
                    <Link to={`/lessons/${lesson._id}`} className="text-accent text-sm font-semibold">
                      Start &rarr;
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'announcements' && (
        <section className="space-y-3">
          <h3 className="text-2xl font-semibold">Announcements</h3>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{announcement.author?.name}</span>
                  <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                </div>
                <h4 className="mt-2 text-lg font-semibold">{announcement.title}</h4>
                <p className="text-sm text-slate-300">{announcement.body}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-slate-400">No announcements yet.</p>}
          </div>
        </section>
      )}

      {activeTab === 'discussions' && (
        <section className="space-y-3">
          <DiscussionList />
        </section>
      )}

    </div>
  );
};

export default CoursePage;

