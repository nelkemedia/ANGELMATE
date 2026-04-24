import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { getLeaderboard, getCurrentCotw, castVote, getCotwHistory } from '../controllers/leaderboard.controller.js';

const router = Router();

router.get('/leaderboard',   optionalAuth, getLeaderboard);
router.get('/cotw/current',  optionalAuth, getCurrentCotw);
router.get('/cotw/history',  getCotwHistory);
router.post('/cotw/vote/:catchId', protect, castVote);

export default router;
