import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye, PenSquare, Search } from 'lucide-react';
import useApi from '../../hooks/useApi.js';
import { AnimatePresence, motion } from 'framer-motion';

const DiscussionList = () => {
    const { id } = useParams(); // courseId
    const api = useApi();
    const [threads, setThreads] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newThread, setNewThread] = useState({ title: '', body: '' });

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const { data } = await api.get(`/discussions/course/${id}?search=${search}`);
                setThreads(data);
            } catch (error) {
                console.error("Failed to fetch threads", error);
            }
        };
        const timer = setTimeout(fetchThreads, 300);
        return () => clearTimeout(timer);
    }, [id, search]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/discussions', { ...newThread, courseId: id });
            setIsModalOpen(false);
            setNewThread({ title: '', body: '' });
            // Refresh list
            const { data } = await api.get(`/discussions/course/${id}`);
            setThreads(data);
        } catch (error) {
            console.error("Failed to create thread", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90"
                >
                    <PenSquare size={18} /> Ask Question
                </button>
            </div>

            <div className="grid gap-4">
                {threads.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                        No discussions yet. Be the first to ask!
                    </div>
                ) : (
                    threads.map(thread => (
                        <Link
                            key={thread._id}
                            to={`/discussions/${thread._id}`}
                            className="group block rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-primary/50 hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{thread.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">{thread.body}</p>
                                </div>
                                <div className="hidden shrink-0 items-center justify-center rounded-full bg-white/10 p-3 sm:flex">
                                    <MessageSquare size={20} className="text-slate-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 hover:text-emerald-400">
                                        <ThumbsUp size={14} /> {thread.upvotes?.length || 0}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MessageSquare size={14} /> {thread.commentCount || 0}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Eye size={14} /> {thread.views || 0}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-[10px] flex items-center justify-center text-indigo-300">
                                        {thread.author?.name?.[0] || '?'}
                                    </div>
                                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-lg rounded-2xl border border-white/10 bg-midnight p-6 shadow-2xl"
                        >
                            <h2 className="mb-4 text-xl font-bold">Ask a Question</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <input
                                    required
                                    placeholder="Title (e.g., How do I use useEffect?)"
                                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3 focus:border-primary focus:outline-none"
                                    value={newThread.title}
                                    onChange={e => setNewThread({ ...newThread, title: e.target.value })}
                                />
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Describe your question in detail..."
                                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3 focus:border-primary focus:outline-none"
                                    value={newThread.body}
                                    onChange={e => setNewThread({ ...newThread, body: e.target.value })}
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 rounded-xl bg-white/5 py-3 font-semibold hover:bg-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary/90"
                                    >
                                        Post Question
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DiscussionList;
