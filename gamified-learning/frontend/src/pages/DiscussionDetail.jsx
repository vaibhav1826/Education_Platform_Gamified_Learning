import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import useApi from '../hooks/useApi.js';
import { useAuthContext } from '../context/AuthContext.jsx';

const DiscussionDetail = () => {
    const { id } = useParams(); // discussionId
    const navigate = useNavigate();
    const api = useApi();
    const { user } = useAuthContext();
    const [thread, setThread] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchThread = async () => {
        try {
            const { data } = await api.get(`/discussions/${id}`);
            setThread(data.discussion);
            setComments(data.comments);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThread();
    }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/discussions/${id}/comments`, { body: newComment });
            setNewComment('');
            fetchThread(); // Refresh comments
        } catch (error) {
            console.error("Failed to post comment", error);
        }
    };

    const handleUpvote = async (itemId, type) => {
        try {
            await api.post(`/discussions/${type}/${itemId}/upvote`);
            fetchThread(); // Refresh to show new vote count (optimistic update would be better)
        } catch (error) {
            console.error("Failed to vote", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading discussion...</div>;
    if (!thread) return <div className="p-8 text-center text-rose-400">Thread not found.</div>;

    const hasUpvotedThread = thread.upvotes.includes(user?._id);

    return (
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 pb-32">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
                <ArrowLeft size={16} /> Back
            </button>

            {/* Thread Header */}
            <article className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
                <h1 className="text-3xl font-bold">{thread.title}</h1>
                <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-[10px] flex items-center justify-center text-indigo-300 font-bold">
                        {thread.author?.name?.[0]}
                    </div>
                    <span>{thread.author?.name}</span>
                    <span>•</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-6 whitespace-pre-wrap text-slate-200 leading-relaxed">
                    {thread.body}
                </div>
                <div className="mt-6 flex items-center gap-6 border-t border-white/5 pt-4">
                    <button
                        onClick={() => handleUpvote(thread._id, 'thread')}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${hasUpvotedThread ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        <ThumbsUp size={16} className={hasUpvotedThread ? 'fill-current' : ''} />
                        {thread.upvotes.length} Upvotes
                    </button>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MessageSquare size={16} /> {comments.length} Comments
                    </div>
                </div>
            </article>

            {/* Comments Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold px-2">Responses</h3>

                <form onSubmit={handleComment} className="relative">
                    <textarea
                        required
                        placeholder="Add to the discussion..."
                        className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 pr-14 focus:border-primary focus:outline-none min-h-[100px]"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-4 right-4 rounded-xl bg-primary p-2 text-white transition-opacity hover:bg-primary/90 disabled:opacity-0"
                    >
                        <Send size={18} />
                    </button>
                </form>

                <div className="space-y-3">
                    {comments.map(comment => {
                        const hasUpvotedComment = comment.upvotes.includes(user?._id);
                        return (
                            <div key={comment._id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 shrink-0 rounded-full bg-orange-500/20 text-[10px] flex items-center justify-center text-orange-300 font-bold">
                                            {comment.author?.name?.[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-semibold text-sm">{comment.author?.name}</span>
                                                <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="mt-1 text-slate-300 text-sm whitespace-pre-wrap">{comment.body}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUpvote(comment._id, 'comment')}
                                        className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-semibold transition-colors ${hasUpvotedComment ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:bg-white/5'
                                            }`}
                                    >
                                        <ThumbsUp size={14} className={hasUpvotedComment ? 'fill-current' : ''} />
                                        {comment.upvotes.length}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DiscussionDetail;
