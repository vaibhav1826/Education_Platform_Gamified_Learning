import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Notification from '../models/Notification.js';
import { emitToUser } from '../utils/socket.js';

// Assignment Controller
// Here's where we handle everything related to assignments.
// Teachers create them, students submit them, and then teachers grade them.
// It's the full circle of academic life!

export const createAssignment = async (req, res) => {
    // We grab the basics from the request.
    const { title, instructions, totalPoints, dueDate, courseId } = req.body;

    // Time to save it to the database.
    // Note: We cast totalPoints to a Number just to be safe, because sometimes
    // forms send numbers as strings.
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
    // First, let's see if this student already submitted something.
    const existing = await Submission.findOne({
        student: req.user._id,
        assignment: assignment._id
    });

    // If they did, we'll let them update it. 
    // Maybe they realized they made a mistake and want to upload a fixed version.
    if (existing) {
        existing.fileUrl = fileUrl;
        existing.status = 'submitted'; // Reset status if it was 'graded' or 'returned' (if we had those)
        existing.submittedAt = new Date(); // Update the timestamp
        await existing.save();
        return res.json(existing);
    }

    // We need to link this submission to a specific "Batch".
    // A Batch is like a class group. Since our model demands a batch ID,
    // we have to find which batch this student belongs to.

    // We'll lazily grab the first batch the student is enrolled in.
    // In a more complex app, we might ask the frontend to send the batchId if a student is in multiple batches.
    const Batch = (await import('../models/Batch.js')).default;
    const batch = await Batch.findOne({ students: req.user._id });

    if (!batch) {
        // Uh oh, this student isn't in any class! They can't submit homework.
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
    // Notify the student that their work has been graded!
    // We create a persistent notification in the DB first...
    await Notification.create({
        user: submission.student,
        type: 'system',
        title: 'Assignment Graded',
        message: `Your assignment "${submission.assignment.title}" has been graded.`,
        meta: { submissionId: submission._id }
    });
    // ...and then shoot off a socket event for that real-time "ding" effect! (if they're online)
    emitToUser(submission.student.toString(), 'notification:new', { type: 'assignment_graded' });

    res.json(submission);
};
