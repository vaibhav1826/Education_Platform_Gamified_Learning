import Batch from '../models/Batch.js';
import Quiz from '../models/Quiz.js';
import Submission from '../models/Submission.js';
import Announcement from '../models/Announcement.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import { emitToUser, emitToBatch, emitToRole } from '../utils/socket.js';

// Student Controller
// Handles specific logic for the Student learning experience.
// From viewing batches to taking quizzes and tracking progress. 

// Helper: Formats quiz data based on its schedule and student's attempt status.
// Uses "active", "upcoming", or "completed" states.

const buildQuizStatus = (quiz, submission) => {
  const now = new Date();
  const start = quiz.scheduledAt ? new Date(quiz.scheduledAt) : null;
  const end = start && quiz.timeLimit ? new Date(start.getTime() + quiz.timeLimit * 60000) : null;

  let status = 'active';
  if (start && now < start) status = 'upcoming';
  if (end && now > end) status = 'completed';
  if (submission) status = 'completed';

  return {
    ...quiz.toObject(),
    status,
    submissionId: submission?._id,
    score: submission?.score,
    correctAnswers: submission?.correctAnswers,
    totalQuestions: submission?.totalQuestions
  };
};

// Helper: Security check to ensure a student only accesses Batches they belong to.
const ensureBatchAccess = async (batchId, userId) => {
  const batch = await Batch.findById(batchId).populate('teacher', 'name email profileImage').populate('students', 'name profileImage');
  if (!batch) return null;
  const isMember = batch.students.some((s) => s._id.toString() === userId.toString());
  return isMember ? batch : null;
};

export const getStudentBatches = async (req, res) => {
  const batches = await Batch.find({ students: req.user._id, disabled: { $ne: true } })
    .populate('teacher', 'name profileImage email')
    .populate('students', 'name profileImage');
  res.json(batches);
};

// -------- Batch Dashboard ----------
// Gets the main dashboard for a specific batch.
// Aggregates Quizzes, Assignments, Announcements, and Leaderboards in one go.
export const getStudentBatch = async (req, res) => {
  const batch = await ensureBatchAccess(req.params.id, req.user._id);
  if (!batch || batch.disabled) return res.status(404).json({ message: 'Batch not found' });

  const [quizzes, submissions, announcements, leaderboard] = await Promise.all([
    Quiz.find({ assignedBatches: batch._id, isActive: true }).sort({ createdAt: -1 }),
    Submission.find({ batch: batch._id, student: req.user._id }),
    Announcement.find({
      $or: [
        { audience: 'all' },
        { audience: 'batch', batch: batch._id }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('author', 'name profileImage'),
    Submission.aggregate([
      { $match: { batch: batch._id } },
      {
        $group: {
          _id: '$student',
          totalScore: { $sum: '$score' },
          totalQuestions: { $sum: '$totalQuestions' }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 20 }
    ])
  ]);

  const submissionMap = new Map(submissions.map((s) => [s.quiz.toString(), s]));
  const quizPayload = quizzes.map((quiz) => buildQuizStatus(quiz, submissionMap.get(quiz._id.toString())));

  const leaderboardUsers = await User.find({ _id: { $in: leaderboard.map((l) => l._id) } }).select('name profileImage xp');
  const leaderboardData = leaderboard.map((entry, idx) => ({
    rank: idx + 1,
    student: leaderboardUsers.find((u) => u._id.toString() === entry._id.toString()),
    totalScore: entry.totalScore,
    totalQuestions: entry.totalQuestions
  }));

  res.json({ batch, quizzes: quizPayload, announcements, leaderboard: leaderboardData });
};

export const getBatchLeaderboardForStudent = async (req, res) => {
  const batch = await ensureBatchAccess(req.params.id, req.user._id);
  if (!batch) return res.status(404).json({ message: 'Batch not found' });

  const leaderboard = await Submission.aggregate([
    { $match: { batch: batch._id } },
    {
      $group: {
        _id: '$student',
        totalScore: { $sum: '$score' },
        totalQuestions: { $sum: '$totalQuestions' }
      }
    },
    { $sort: { totalScore: -1 } }
  ]);

  const users = await User.find({ _id: { $in: leaderboard.map((l) => l._id) }, role: 'student' }).select('name profileImage xp level');
  const studentIds = new Set(users.map(u => u._id.toString()));

  res.json(
    leaderboard
      .filter(l => studentIds.has(l._id.toString()))
      .map((entry, idx) => ({
        rank: idx + 1,
        student: users.find((u) => u._id.toString() === entry._id.toString()),
        totalScore: entry.totalScore,
        totalQuestions: entry.totalQuestions
      }))
  );
};

// -------- Quiz Handling ----------
// Fetches all quizzes assigned to the student's batches.
export const getAssignedQuizzes = async (req, res) => {
  const batchIds = await Batch.find({ students: req.user._id }).distinct('_id');
  if (!batchIds.length) return res.json([]);

  const [quizzes, submissions] = await Promise.all([
    Quiz.find({ assignedBatches: { $in: batchIds }, isActive: true }).populate('assignedBatches', 'name').sort({ scheduledAt: 1 }),
    Submission.find({ student: req.user._id })
  ]);
  const submissionMap = new Map(submissions.map((s) => [s.quiz.toString(), s]));
  const payload = quizzes.map((quiz) => buildQuizStatus(quiz, submissionMap.get(quiz._id.toString())));
  res.json(payload);
};

export const getStudentQuiz = async (req, res) => {
  const batchIds = await Batch.find({ students: req.user._id }).distinct('_id');
  const quiz = await Quiz.findOne({ _id: req.params.quizId, assignedBatches: { $in: batchIds } });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const submission = await Submission.findOne({ quiz: quiz._id, student: req.user._id });
  res.json(buildQuizStatus(quiz, submission));
};

// Submit a Quiz Attempt
// Calculates score immediately, updates XP, and notifies the teacher.
export const submitQuiz = async (req, res) => {
  const { answers, batchId } = req.body;
  if (!batchId) return res.status(400).json({ message: 'batchId is required' });

  const batch = await ensureBatchAccess(batchId, req.user._id);
  if (!batch) return res.status(403).json({ message: 'You are not in this batch' });

  const quiz = await Quiz.findOne({ _id: req.params.quizId, assignedBatches: batch._id });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const existing = await Submission.findOne({ quiz: quiz._id, student: req.user._id, batch: batch._id });
  if (existing) return res.status(400).json({ message: 'Quiz already submitted' });

  let score = 0;
  let correctAnswers = 0;
  const processedAnswers = (answers || []).map((answer) => {
    const question = quiz.questions[answer.questionIndex];
    const isCorrect = question?.correctIndex === answer.selectedIndex;
    if (isCorrect) {
      score += question?.points || 1;
      correctAnswers += 1;
    }
    return { ...answer, isCorrect: Boolean(isCorrect) };
  });

  const submission = await Submission.create({
    student: req.user._id,
    quiz: quiz._id,
    batch: batch._id,
    teacher: quiz.createdBy,
    score,
    totalQuestions: quiz.questions.length,
    correctAnswers,
    answers: processedAnswers
  });

  const settings = await Settings.getSingleton();
  const xpSubmit = settings?.xpRules?.find((r) => r.action === 'quiz.submit')?.xp || 0;
  const xpCorrectRule = settings?.xpRules?.find((r) => r.action === 'quiz.correct')?.xp || 0;
  const xpGain = xpSubmit + xpCorrectRule * correctAnswers;
  if (xpGain > 0) {
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpGain } });
  }

  await Notification.create({
    user: req.user._id,
    type: 'quiz_result',
    title: `Quiz submitted: ${quiz.title}`,
    message: `You scored ${score}/${quiz.questions.length}`
  });

  const populatedSubmission = await Submission.findById(submission._id)
    .populate('student', 'name email profileImage')
    .populate('quiz', 'title')
    .populate('batch', 'name');

  emitToUser(req.user._id.toString(), 'submission:created', populatedSubmission);
  emitToUser(quiz.createdBy.toString(), 'submission:new', populatedSubmission);
  emitToBatch(batch._id.toString(), 'submission:new', populatedSubmission);
  emitToUser(req.user._id.toString(), 'notification:new', { type: 'quiz_result' });

  res.status(201).json(submission);
};

export const getQuizResult = async (req, res) => {
  const submission = await Submission.findOne({ quiz: req.params.quizId, student: req.user._id }).populate('quiz', 'title questions timeLimit');
  if (!submission) return res.status(404).json({ message: 'Result not found' });

  const leaderboard = await Submission.find({ quiz: req.params.quizId }).sort({ score: -1, submittedAt: 1 });
  const rank = leaderboard.findIndex((entry) => entry._id.toString() === submission._id.toString()) + 1;

  res.json({ submission, rank, totalParticipants: leaderboard.length });
};

export const getGlobalLeaderboardForStudent = async (req, res) => {
  const batches = await Batch.find({ students: req.user._id });
  const batchIds = batches.map((b) => b._id);
  if (!batchIds.length) return res.json([]);

  const teacherIds = [...new Set(batches.map((b) => b.teacher.toString()))];
  const quizIds = await Quiz.find({ createdBy: { $in: teacherIds } }).distinct('_id');

  const submissions = await Submission.aggregate([
    { $match: { batch: { $in: batchIds }, quiz: { $in: quizIds } } },
    {
      $group: {
        _id: '$student',
        totalScore: { $sum: '$score' },
        quizCount: { $sum: 1 }
      }
    },
    { $sort: { totalScore: -1 } }
  ]);

  const users = await User.find({ _id: { $in: submissions.map((s) => s._id) }, role: 'student' }).select('name profileImage xp level');
  const userIds = new Set(users.map(u => u._id.toString()));

  res.json(
    submissions
      .filter(entry => userIds.has(entry._id.toString()))
      .map((entry, idx) => ({
        rank: idx + 1,
        student: users.find((u) => u._id.toString() === entry._id.toString()),
        totalScore: entry.totalScore,
        quizAttempts: entry.quizCount
      }))
  );
};

export const getStudentAnnouncements = async (req, res) => {
  const [batchIds, courseIds] = await Promise.all([
    Batch.find({ students: req.user._id }).distinct('_id'),
    Enrollment.find({ student: req.user._id }).distinct('course')
  ]);

  const announcements = await Announcement.find({
    $or: [
      { audience: 'all' },
      { audience: 'course', course: { $in: courseIds } },
      { audience: 'batch', batch: { $in: batchIds } },
      { target: 'all' },
      { target: 'students' }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit || '30', 10))
    .populate('author', 'name profileImage');

  res.json(announcements);
};

// -------- Course Progress ----------
// Fetches self-paced courses the student is enrolled in.
// Merges strictly "enrollment" data with "progress" tracking.
export const getStudentCourses = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      select: 'title thumbnail category teacher modules',
      populate: { path: 'teacher', select: 'name profileImage' }
    })
    .sort({ createdAt: -1 });
  const progress = await Progress.find({ user: req.user._id }).select('course completionPct lessons');
  const progressMap = new Map(progress.map((p) => [p.course.toString(), p]));

  const payload = enrollments.map((enrollment) => ({
    ...enrollment.toObject(),
    progressPct: progressMap.get(enrollment.course?._id?.toString())?.completionPct ?? enrollment.progressPct ?? 0
  }));

  res.json(payload);
};

export const getStudentCourse = async (req, res) => {
  const enrollment = await Enrollment.findOne({ course: req.params.id, student: req.user._id });
  if (!enrollment) return res.status(404).json({ message: 'Not enrolled in this course' });

  const [course, progress] = await Promise.all([
    Course.findById(req.params.id)
      .populate({
        path: 'modules',
        options: { sort: { order: 1 } },
        populate: { path: 'lessons', options: { sort: { order: 1 } }, populate: { path: 'quiz' } }
      })
      .populate('teacher', 'name profileImage'),
    Progress.findOne({ user: req.user._id, course: req.params.id })
  ]);

  res.json({
    course,
    enrollment,
    progress
  });
};

// -------- Profile & Stats ----------
// Aggregates user profile data with gamification stats (Badges, XP).
export const getStudentProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('badges');
  const batches = await Batch.find({ students: req.user._id }).select('name teacher').populate('teacher', 'name profileImage');
  res.json({
    user: user.safeObject(),
    batches,
    badges: user.badges,
    certificates: [],
    xpTimeline: [] // placeholder timeline; could be extended with analytics data
  });
};

export const updateStudentProfile = async (req, res) => {
  const allowed = ['name', 'city', 'phone', 'specialization'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json(user.safeObject());
};

export const updateStudentProfileImage = async (req, res) => {
  const { profileImage, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...(profileImage && { profileImage }), ...(avatar && { avatar }) },
    { new: true }
  );
  res.json(user.safeObject());
};

export const getStudentNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
};

export const joinBatchByCode = async (req, res) => {
  const { inviteCode } = req.body;

  if (!inviteCode || inviteCode.trim().length < 4) {
    return res.status(400).json({ message: 'Invalid invite code' });
  }

  const batch = await Batch.findOne({
    inviteCode: inviteCode.trim().toUpperCase(),
    disabled: { $ne: true }
  }).populate('teacher', 'name profileImage email');

  if (!batch) {
    return res.status(404).json({ message: 'Batch not found. Please check the invite code.' });
  }

  if (!batch.allowSelfEnroll) {
    return res.status(403).json({ message: 'This batch does not allow self-enrollment. Contact the teacher.' });
  }

  // Check if student is already in the batch
  if (batch.students.some(s => s.toString() === req.user._id.toString())) {
    return res.status(400).json({ message: 'You are already a member of this batch.' });
  }

  // Add student to batch
  batch.students.push(req.user._id);
  await batch.save();

  const updated = await Batch.findById(batch._id)
    .populate('teacher', 'name profileImage email')
    .populate('students', 'name profileImage');

  // Emit real-time events
  emitToUser(req.user._id.toString(), 'batch:joined', updated);
  emitToBatch(batch._id.toString(), 'batch:updated', updated);
  emitToUser(batch.teacher._id.toString(), 'batch:studentJoined', { batch: updated, student: req.user });

  // Create notification for teacher
  await Notification.create({
    user: batch.teacher._id,
    type: 'system',
    title: 'New Student Joined',
    message: `${req.user.name} has joined batch "${batch.name}"`,
    meta: { batchId: batch._id, studentId: req.user._id }
  });
  emitToUser(batch.teacher._id.toString(), 'notification:new', { type: 'student_joined' });

  res.json(updated);
};
