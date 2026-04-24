import { Router } from 'express';
import { login, me, register, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;
