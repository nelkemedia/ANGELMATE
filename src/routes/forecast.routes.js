import { Router } from 'express';
import { getTodayForecast } from '../controllers/forecast.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/today', getTodayForecast);

export default router;
