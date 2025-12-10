import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useLesson from '../hooks/useLesson.js';
import { useAuthContext } from '../context/AuthContext.jsx';
import useApi from '../hooks/useApi.js';

const Lesson = () => {
  const { id } = useParams();
  const { lesson, completeLesson } = useLesson(id);
  const { user } = useAuthContext();
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

      {lesson.assignment && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h3 className="text-xl font-bold">Assignment: {lesson.assignment.title}</h3>
          <p className="text-slate-300">{lesson.assignment.instructions}</p>
          <div className="flex gap-4 text-sm text-slate-400">
            <span>Points: {lesson.assignment.totalPoints}</span>
            {lesson.assignment.dueDate && <span>Due: {new Date(lesson.assignment.dueDate).toLocaleDateString()}</span>}
          </div>

          {user?.role === 'student' && (
            <AssignmentUploader assignmentId={lesson.assignment._id} />
          )}

          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <Link
              to={`/teacher/assignments/${lesson.assignment._id}/grading`}
              className="inline-block rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              View Submissions & Grade
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

const AssignmentUploader = ({ assignmentId }) => {
  const api = useApi();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append('file', file);
      const { data: { url } } = await api.post('/uploads/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. Submit assignment
      await api.post(`/assignments/${assignmentId}/submit`, { fileUrl: url });
      setMessage('Assignment submitted successfully!');
      setFile(null);
    } catch (error) {
      setMessage('Upload failed. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-semibold">Submit Your Work</h4>
      <input
        type="file"
        onChange={e => setFile(e.target.files[0])}
        className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/80"
      />
      {message && <p className="text-sm text-emerald-400">{message}</p>}
      <button
        type="submit"
        disabled={!file || uploading}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Submit Assignment'}
      </button>
    </form>
  );
};

export default Lesson;
