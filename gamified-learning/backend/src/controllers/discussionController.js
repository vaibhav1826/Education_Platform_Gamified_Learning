import Discussion from '../models/Discussion.js';
import Comment from '../models/Comment.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// Check if user is enrolled or is teacher/admin
const checkAccess = async (userId, courseId, role) => {
    if (role === 'teacher' || role === 'admin') return true;
    const enrollment = await Enrollment.findOne({ course: courseId, student: userId });
    return !!enrollment;
};

export const createThread = async (req, res) => {
    try {
        const { title, body, courseId, lessonId } = req.body;

        const hasAccess = await checkAccess(req.user._id, courseId, req.user.role);
        if (!hasAccess) return res.status(403).json({ message: 'Not enrolled in this course' });

        const discussion = await Discussion.create({
            title,
            body,
            course: courseId,
            lesson: lessonId || null,
            author: req.user._id
        });

        res.status(201).json(discussion);
    } catch (error) {
        res.status(500).json({ message: 'Error creating thread', error: error.message });
    }
};

export const getCourseThreads = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { search } = req.query;

        const hasAccess = await checkAccess(req.user._id, courseId, req.user.role);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        let query = { course: courseId };
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const threads = await Discussion.find(query)
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 });

        // Add comment counts
        const threadsWithCounts = await Promise.all(threads.map(async (thread) => {
            const commentCount = await Comment.countDocuments({ discussion: thread._id });
            return { ...thread.toObject(), commentCount };
        }));

        res.json(threadsWithCounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching threads', error: error.message });
    }
};

export const getThreadDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const discussion = await Discussion.findById(id).populate('author', 'name avatar');

        if (!discussion) return res.status(404).json({ message: 'Thread not found' });

        // Increment views
        discussion.views += 1;
        await discussion.save();

        const comments = await Comment.find({ discussion: id })
            .populate('author', 'name avatar')
            .sort({ createdAt: 1 });

        res.json({ discussion, comments });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching thread details', error: error.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params; // discussionId
        const { body } = req.body;

        const discussion = await Discussion.findById(id);
        if (!discussion) return res.status(404).json({ message: 'Thread not found' });

        const comment = await Comment.create({
            discussion: id,
            body,
            author: req.user._id
        });

        const populatedComment = await Comment.findById(comment._id).populate('author', 'name avatar');

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

export const toggleUpvote = async (req, res) => {
    try {
        const { id, type } = req.params; // type: 'thread' or 'comment'
        const userId = req.user._id;

        let Model = type === 'thread' ? Discussion : Comment;
        const item = await Model.findById(id);

        if (!item) return res.status(404).json({ message: 'Item not found' });

        const index = item.upvotes.indexOf(userId);
        if (index === -1) {
            item.upvotes.push(userId);
        } else {
            item.upvotes.splice(index, 1);
        }

        await item.save();
        res.json({ upvotes: item.upvotes });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling vote', error: error.message });
    }
};
