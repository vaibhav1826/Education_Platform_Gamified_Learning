import { useParams, Link } from 'react-router-dom';
import useLesson from '../hooks/useLesson.js';

const Lesson = () => {
  const { id } = useParams();
  const { lesson } = useLesson(id);

  if (!lesson) return <p className="p-6">Loading lesson...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold">{lesson.title}</h2>
        <p className="text-slate-400">Lesson overview</p>
      </header>
      <article className="bg-slate-900 rounded-xl p-6 border border-slate-800 whitespace-pre-wrap leading-relaxed text-slate-200">
        {lesson.content}
      </article>
      {lesson.quiz && (
        <Link to={`/quiz/${lesson.quiz?._id || lesson.quiz}`} className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-lg text-slate-900 font-semibold">
          Take Quiz &rarr;
        </Link>
      )}
    </div>
  );
};

export default Lesson;