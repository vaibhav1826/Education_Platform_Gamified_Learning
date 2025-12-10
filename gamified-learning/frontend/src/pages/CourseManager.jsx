import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { ArrowLeft, Plus, Trash2, Video, FileText, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CourseManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = useApi();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);

    const [expandedModules, setExpandedModules] = useState({});
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

    const [activeModuleId, setActiveModuleId] = useState(null);

    // Forms
    const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
    const [lessonForm, setLessonForm] = useState({ title: '', type: 'article', content: '', videoUrl: '', duration: 5 });

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/courses/${id}`);
            setCourse(data);
        } catch (error) {
            console.error('Failed to load course', error);
            setStatus('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        setStatus('Creating module...');
        try {
            await api.post(`/courses/${id}/modules`, moduleForm);
            setModuleForm({ title: '', description: '' });
            setIsModuleModalOpen(false);
            setStatus('Module created!');
            fetchCourse();
        } catch (error) {
            setStatus('Error creating module');
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        setStatus('Creating lesson...');
        try {
            const payload = {
                title: lessonForm.title,
                contentType: lessonForm.type,
                content: lessonForm.content,
                durationMinutes: Number(lessonForm.duration)
            };

            // If video, we might treat it as an attachment or content depending on backend.
            // Based on Lesson model, we have 'attachments' or 'content'.
            // For simplicity/perfection, if video, we'll append the URL to content for now 
            // OR better, assuming backend supports a specific way. 
            // Checking architecture, Lesson has `attachments` schema. 
            // But let's stick to simple content string for article due to time or structure.
            // Re-reading Lesson.js model: contentType enum ['video', 'article', 'interactive'].
            // If video, we probably want to store the URL. 
            if (lessonForm.type === 'video') {
                payload.content = lessonForm.videoUrl;
            } else if (lessonForm.type === 'assignment') {
                const { data: assignment } = await api.post('/assignments', {
                    title: lessonForm.title,
                    instructions: lessonForm.content,
                    totalPoints: lessonForm.points,
                    dueDate: lessonForm.dueDate,
                    courseId: id
                });
                payload.assignment = assignment._id;
                payload.content = "Assignment: " + lessonForm.title;
            }

            await api.post(`/courses/modules/${activeModuleId}/lessons`, payload);
            setLessonForm({ title: '', type: 'article', content: '', videoUrl: '', duration: 5, points: 100, dueDate: '' });
            setIsLessonModalOpen(false);
            setStatus('Lesson added!');
            fetchCourse();
        } catch (error) {
            console.error(error);
            setStatus('Error creating lesson');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading course data...</div>;
    if (!course) return <div className="p-8 text-center text-rose-400">Course not found.</div>;

    return (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 pb-32">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/teacher/dashboard')}
                        className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white mb-2"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wider text-slate-300">
                            {course.category}
                        </span>
                    </div>
                    <p className="text-slate-400 max-w-2xl">{course.description}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400">{course.enrollmentCount}</div>
                    <div className="text-xs uppercase tracking-wider text-slate-500">Students Enrolled</div>
                </div>
            </header>

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-300 flex items-center gap-2"
                >
                    <Check size={16} /> {status}
                </motion.div>
            )}

            {/* Main Content Area */}
            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

                {/* Modules List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Course Modules</h2>
                        <button
                            onClick={() => setIsModuleModalOpen(true)}
                            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                        >
                            <Plus size={16} /> New Module
                        </button>
                    </div>

                    <div className="space-y-4">
                        {course.modules && course.modules.length > 0 ? (
                            course.modules.map((module, index) => (
                                <div key={module._id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all">
                                    <div
                                        onClick={() => toggleModule(module._id)}
                                        className="flex cursor-pointer items-center justify-between p-4 hover:bg-white/5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-400">
                                                {index + 1}
                                            </span>
                                            <h3 className="font-semibold">{module.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-slate-500">{module.lessons?.length || 0} lessons</span>
                                            {expandedModules[module._id] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedModules[module._id] && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="border-t border-white/5 bg-black/20"
                                            >
                                                <div className="p-2 space-y-1">
                                                    {module.lessons?.map((lesson, lIndex) => (
                                                        <div key={lesson._id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5">
                                                            <div className="text-slate-500">
                                                                {lesson.contentType === 'video' ? <Video size={16} /> : <FileText size={16} />}
                                                            </div>
                                                            <span className="flex-1 text-sm text-slate-300">{lesson.title}</span>
                                                            <span className="text-xs text-slate-600">{lesson.durationMinutes} min</span>
                                                        </div>
                                                    ))}

                                                    <button
                                                        onClick={() => {
                                                            setActiveModuleId(module._id);
                                                            setIsLessonModalOpen(true);
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 p-3 text-sm text-slate-500 transition-colors hover:border-white/20 hover:text-slate-300 hover:bg-white/5 mt-2"
                                                    >
                                                        <Plus size={14} /> Add Lesson
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500">
                                <p>No modules yet. Start by creating one!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Quick Stats or Preview */}
                <div className="space-y-6">
                    <div className="sticky top-8 rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
                        <h3 className="font-bold text-lg">Course Settings</h3>
                        <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex justify-between">
                                <span>Difficulty</span>
                                <span className="text-white capitalize">{course.difficulty}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Level Req</span>
                                <span className="text-white">Lvl {course.levelRequirement}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Modules</span>
                                <span className="text-white">{course.modules?.length || 0}</span>
                            </div>
                        </div>
                        <button className="w-full rounded-xl bg-white/10 py-3 text-sm font-semibold transition-colors hover:bg-white/20">
                            Edit Details
                        </button>
                    </div>
                </div>

            </div>

            {/* Modals */}

            {/* Module Modal */}
            {isModuleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1014] p-6 shadow-2xl"
                    >
                        <h3 className="mb-4 text-xl font-bold">New Module</h3>
                        <form onSubmit={handleCreateModule} className="space-y-4">
                            <input
                                required
                                placeholder="Module Title (e.g., 'Intro to Physics')"
                                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm transition-colors focus:border-primary focus:outline-none"
                                value={moduleForm.title}
                                onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                            />
                            <textarea
                                placeholder="What will students learn in this module?"
                                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm transition-colors focus:border-primary focus:outline-none"
                                rows={3}
                                value={moduleForm.description}
                                onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModuleModalOpen(false)}
                                    className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90"
                                >
                                    Create Module
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Lesson Modal */}
            {isLessonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f1014] p-6 shadow-2xl"
                    >
                        <h3 className="mb-4 text-xl font-bold">Add Lesson</h3>
                        <form onSubmit={handleCreateLesson} className="space-y-4">
                            <input
                                required
                                placeholder="Lesson Title"
                                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm transition-colors focus:border-primary focus:outline-none"
                                value={lessonForm.title}
                                onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                            />

                            <select
                                className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm focus:border-primary focus:outline-none"
                                value={lessonForm.type}
                                onChange={e => setLessonForm({ ...lessonForm, type: e.target.value })}
                            >
                                <option value="article">Article / Text</option>
                                <option value="video">Video</option>
                                <option value="assignment">Assignment</option>
                            </select>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm focus:border-primary focus:outline-none"
                                    value={lessonForm.duration}
                                    onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                />
                                <span className="absolute right-3 top-3 text-xs text-slate-500">mins</span>
                            </div>
                        </div>

                        {lessonForm.type === 'video' && (
                            <input
                                required
                                placeholder="Video URL (YouTube, Vimeo, etc.)"
                                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm transition-colors focus:border-primary focus:outline-none"
                                value={lessonForm.videoUrl}
                                onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                            />
                        )}

                        {lessonForm.type === 'article' && (
                            <textarea
                                required
                                placeholder="Lesson content goes here..."
                                className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm transition-colors focus:border-primary focus:outline-none"
                                rows={6}
                                value={lessonForm.content}
                                onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                            />
                        )}

                        {lessonForm.type === 'assignment' && (
                            <div className="space-y-3">
                                <textarea
                                    required
                                    placeholder="Assignment Instructions..."
                                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm transition-colors focus:border-primary focus:outline-none"
                                    rows={4}
                                    value={lessonForm.content}
                                    onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="Points (e.g. 100)"
                                        className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm focus:border-primary focus:outline-none"
                                        value={lessonForm.points || ''}
                                        onChange={e => setLessonForm({ ...lessonForm, points: e.target.value })}
                                    />
                                    <input
                                        type="date"
                                        className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-slate-400 focus:border-primary focus:outline-none"
                                        value={lessonForm.dueDate || ''}
                                        onChange={e => setLessonForm({ ...lessonForm, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsLessonModalOpen(false)}
                                className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90"
                            >
                                Save Lesson
                            </button>
                        </div>
                    </form>
                </motion.div>
                </div>
    )
}
        </div >
    );
};

export default CourseManager;
