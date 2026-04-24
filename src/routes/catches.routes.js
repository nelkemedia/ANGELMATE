import { Router } from 'express';
import {
  createCatch,
  deleteCatch,
  getAllCatches,
  getCatchById,
  updateCatch
} from '../controllers/catches.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getAllCatches);
router.post('/', createCatch);
router.get('/:id', getCatchById);
router.put('/:id', updateCatch);
router.delete('/:id', deleteCatch);

export default router;
