import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { getFeed, getComments, addComment, deleteComment, toggleLike } from '../controllers/community.controller.js';

const router = Router();

router.get('/feed',                       optionalAuth, getFeed);
router.get('/:catchId/comments',          optionalAuth, getComments);
router.post('/:catchId/comments',         protect, addComment);
router.delete('/comments/:commentId',     protect, deleteComment);
router.post('/:catchId/like',             protect, toggleLike);

export default router;
