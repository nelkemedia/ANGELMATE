import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import {
  getReports, resolveReport, deleteReport,
  getUsers, setUserStatus, updateUserRole, deleteUser, sendUserPasswordReset,
  getSmtp, saveSmtp
} from '../controllers/admin.controller.js';

const router = Router();

router.use(protect, requireAdmin);

router.get('/reports',          getReports);
router.patch('/reports/:id/resolve', resolveReport);
router.delete('/reports/:id',   deleteReport);

router.get('/users',                      getUsers);
router.patch('/users/:id/status',         setUserStatus);
router.patch('/users/:id/role',           updateUserRole);
router.post('/users/:id/reset-password',  sendUserPasswordReset);
router.delete('/users/:id',               deleteUser);

router.get('/smtp',  getSmtp);
router.put('/smtp',  saveSmtp);

export default router;
