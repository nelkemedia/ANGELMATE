import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { createReport } from '../controllers/report.controller.js';

const router = Router();

router.post('/', optionalAuth, createReport);

export default router;
