import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi.js';
import { ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react';

const AssignmentGrading = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const api = useApi();
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gradingStatus, setGradingStatus] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assRes, subRes] = await Promise.all([
                    api.get(`/assignments/${assignmentId}`),
                    api.get(`/assignments/${assignmentId}/submissions`)
                ]);
                setAssignment(assRes.data);
                setSubmissions(subRes.data);
            } catch (error) {
                console.error("Failed to fetch grading data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [assignmentId]);

    const handleGrade = async (submissionId, score, feedback) => {
        try {
            setGradingStatus('Saving...');
            await api.patch(`/assignments/submissions/${submissionId}/grade`, { score, feedback });
            setSubmissions(prev => prev.map(sub =>
                sub._id === submissionId ? { ...sub, score, feedback, status: 'graded' } : sub
            ));
            setGradingStatus('Saved!');
            setTimeout(() => setGradingStatus(null), 2000);
        } catch (error) {
            console.error("Grading failed", error);
            setGradingStatus('Error saving grade');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading submissions...</div>;
    if (!assignment) return <div className="p-8 text-center text-rose-400">Assignment not found.</div>;

    return (
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 pb-32">
            <header className="space-y-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                >
                    <ArrowLeft size={16} /> Back to Lesson
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{assignment.title}</h1>
                        <p className="text-slate-400">{assignment.instructions}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-400">{submissions.length}</div>
                        <div className="text-xs uppercase tracking-wider text-slate-500">Submissions</div>
                    </div>
                </div>
                {gradingStatus && <p className="text-emerald-400 text-sm">{gradingStatus}</p>}
            </header>

            <div className="grid gap-6">
                {submissions.length === 0 ? (
                    <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center text-slate-500">
                        No submissions yet.
                    </div>
                ) : (
                    submissions.map(submission => (
                        <SubmissionCard key={submission._id} submission={submission}
                            maxPoints={assignment.totalPoints} onGrade={handleGrade} />
                    ))
                )}
            </div>
        </div>
    );
};

const SubmissionCard = ({ submission, maxPoints, onGrade }) => {
    const [score, setScore] = useState(submission.score || 0);
    const [feedback, setFeedback] = useState(submission.feedback || '');
    const [isDirty, setIsDirty] = useState(false);

    const handleSave = () => {
        onGrade(submission._id, score, feedback);
        setIsDirty(false);
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 grid md:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                        {submission.student?.name?.[0] || 'S'}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{submission.student?.name || 'Unknown Student'}</h3>
                        <p className="text-xs text-slate-400">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>
                    {submission.status === 'graded' && <CheckCircle size={16} className="text-emerald-400 ml-2" />}
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Attachment</p>
                    <a href={submission.fileUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-indigo-400 hover:underline break-all">
                        <ExternalLink size={14} /> {submission.fileUrl}
                    </a>
                </div>
            </div>

            <div className="space-y-3 bg-black/20 p-4 rounded-xl">
                <h4 className="font-semibold text-sm text-slate-300">Grading</h4>
                <div>
                    <label className="text-xs text-slate-500">Score (out of {maxPoints})</label>
                    <input
                        type="number"
                        max={maxPoints}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm mt-1"
                        value={score}
                        onChange={e => { setScore(Number(e.target.value)); setIsDirty(true); }}
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500">Feedback</label>
                    <textarea
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm mt-1"
                        value={feedback}
                        onChange={e => { setFeedback(e.target.value); setIsDirty(true); }}
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="w-full bg-emerald-600 rounded-lg py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                >
                    Save Grade
                </button>
            </div>
        </div>
    );
}

export default AssignmentGrading;
