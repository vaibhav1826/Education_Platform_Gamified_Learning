import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Notification from '../models/Notification.js';
import { emitToUser } from '../utils/socket.js';

export const createAssignment = async (req, res) => {
    const { title, instructions, totalPoints, dueDate, courseId } = req.body;

    const assignment = await Assignment.create({
        title,
        instructions,
        totalPoints: Number(totalPoints),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        course: courseId
    });

    res.status(201).json(assignment);
};

export const getAssignment = async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
};

export const submitAssignment = async (req, res) => {
    const { fileUrl } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // Check if already submitted
    const existing = await Submission.findOne({
        student: req.user._id,
        assignment: assignment._id
    });

    if (existing) {
        // Optional: Allow re-submission? For now, update existing.
        existing.fileUrl = fileUrl;
        existing.status = 'submitted';
        existing.submittedAt = new Date();
        await existing.save();
        return res.json(existing);
    }

    // Need batch ID. Usually found via Enrollment or User. 
    // For simplicity, we might iterate user's batches or pass it.
    // Submission model REQUIRES batch. 
    // Let's find the student's batch for this course? 
    // Or just pick the first batch the student is in?
    // Ideally, find Enrollment -> Batch. 
    // Let's assume req.user.batch is populated or use a query.
    // Actually, User model doesn't strictly hold batch (Batch model holds students).
    // Assuming a Helper or just findOne Batch where students contains user.
    // This is a bit expensive.
    // Workaround: Make batch optional in Submission schema? 
    // The schema said `required: true`.
    // Let's fetch one.
    const Batch = (await import('../models/Batch.js')).default;
    const batch = await Batch.findOne({ students: req.user._id });

    if (!batch) {
        return res.status(400).json({ message: 'Student is not in any batch.' });
    }

    const submission = await Submission.create({
        student: req.user._id,
        assignment: assignment._id,
        type: 'assignment',
        batch: batch._id,
        fileUrl,
        totalQuestions: 0 // Not applicable
    });

    res.status(201).json(submission);
};

export const getAssignmentSubmissions = async (req, res) => {
    const submissions = await Submission.find({ assignment: req.params.id })
        .populate('student', 'name email avatar')
        .sort({ submittedAt: -1 });
    res.json(submissions);
};

export const gradeAssignment = async (req, res) => {
    const { score, feedback } = req.body;
    const submission = await Submission.findById(req.params.submissionId).populate('assignment');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.score = Number(score);
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.teacher = req.user._id;
    await submission.save();

    // Notify Student
    await Notification.create({
        user: submission.student,
        type: 'system',
        title: 'Assignment Graded',
        message: `Your assignment "${submission.assignment.title}" has been graded.`,
        meta: { submissionId: submission._id }
    });
    emitToUser(submission.student.toString(), 'notification:new', { type: 'assignment_graded' });

    res.json(submission);
};
