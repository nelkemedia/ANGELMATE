import { Router } from 'express';
import { getOverviewStats } from '../controllers/stats.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/overview', getOverviewStats);

export default router;
