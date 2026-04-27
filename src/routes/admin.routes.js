import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import {
  getReports, resolveReport, deleteReport,
  getUsers, setUserStatus, updateUserRole, deleteUser, sendUserPasswordReset,
  getSmtp, saveSmtp, testSmtp
} from '../controllers/admin.controller.js';
import { getAllTranslations, upsertTranslation, deleteTranslation } from '../controllers/translations.controller.js';
import { getEmailTemplates, upsertEmailTemplate, deleteEmailTemplate } from '../controllers/emailTemplates.controller.js';

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

router.get('/smtp',       getSmtp);
router.put('/smtp',       saveSmtp);
router.post('/smtp/test', testSmtp);

router.get('/translations',        getAllTranslations);
router.put('/translations',        upsertTranslation);
router.delete('/translations/:key', deleteTranslation);

router.get('/email-templates',          getEmailTemplates);
router.put('/email-templates',          upsertEmailTemplate);
router.delete('/email-templates/:name', deleteEmailTemplate);

export default router;
