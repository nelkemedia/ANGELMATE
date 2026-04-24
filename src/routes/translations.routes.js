import { Router } from 'express';
import { getTranslations } from '../controllers/translations.controller.js';

const router = Router();
router.get('/', getTranslations);

export default router;
