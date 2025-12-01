import { useParams, Link } from 'react-router-dom';
import useCourse from '../hooks/useCourse.js';

const CoursePage = () => {
  const { id } = useParams();
  const { course } = useCourse(id);

  if (!course) return <p className="p-6">Loading course...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h2 className="text-3xl font-bold">{course.title}</h2>
      <p className="text-slate-400">{course.description}</p>
      {course.modules?.map((module) => (
        <div key={module._id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
          <h3 className="text-xl font-semibold">{module.title}</h3>
          <ul className="space-y-2 text-sm">
            {module.lessons?.map((lesson) => (
              <li key={lesson._id} className="flex justify-between">
                <span>{lesson.title}</span>
                <Link to={`/lessons/${lesson._id}`} className="text-accent">Start &rarr;</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CoursePage;