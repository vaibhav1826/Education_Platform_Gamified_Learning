import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useLesson from '../hooks/useLesson.js';

const Lesson = () => {
  const { id } = useParams();
  const { lesson, completeLesson } = useLesson(id);
  const [status, setStatus] = useState(null);

  if (!lesson) return <p className="p-6">Loading lesson...</p>;

  const handleComplete = async () => {
    const result = await completeLesson();
    setStatus(`Nice! ${result.completedLessons}/${result.totalLessons} lessons done.`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Lesson</p>
        <h2 className="text-3xl font-bold">{lesson.title}</h2>
        {status && <p className="text-sm text-emerald-300">{status}</p>}
      </header>
      <article className="rounded-3xl border border-white/10 bg-white/5 p-6 leading-relaxed text-slate-200 whitespace-pre-wrap">
        {lesson.content}
      </article>
      {lesson.attachments?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Resources</p>
          <div className="grid gap-3 md:grid-cols-2">
            {lesson.attachments.map((attachment) => (
              <a
                key={attachment.url}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white hover:border-white/30"
              >
                <p className="font-semibold">{attachment.title}</p>
                <p className="text-xs text-slate-400">
                  {attachment.type} &middot; {attachment.duration || ''} min
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleComplete}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white"
        >
          Mark as complete
        </button>
        {lesson.quiz && (
          <Link
            to={`/quiz/${lesson.quiz?._id || lesson.quiz}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
          >
            Take Quiz &rarr;
          </Link>
        )}
      </div>
    </div>
  );
};

export default Lesson;
