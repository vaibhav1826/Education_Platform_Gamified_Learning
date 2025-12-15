import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createThread,
    getCourseThreads,
    getThreadDetails,
    addComment,
    toggleUpvote
} from '../controllers/discussionController.js';

const router = express.Router();

router.use(protect);

router.post('/', createThread);
router.get('/course/:courseId', getCourseThreads);
router.get('/:id', getThreadDetails);
router.post('/:id/comments', addComment);
router.post('/:type/:id/upvote', toggleUpvote); // type: 'thread' | 'comment'

export default router;
