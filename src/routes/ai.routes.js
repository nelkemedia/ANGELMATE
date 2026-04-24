import { Router } from 'express';
import { identifyFish, analyzeForecast } from '../controllers/ai.controller.js';
import { protect as authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/identify-fish', authenticate, identifyFish);
router.post('/analyze-forecast', authenticate, analyzeForecast);

export default router;
