import { Router } from 'express';
import {
  createSpot,
  deleteSpot,
  getAllSpots,
  getSpotById,
  updateSpot
} from '../controllers/spots.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getAllSpots);
router.post('/', createSpot);
router.get('/:id', getSpotById);
router.put('/:id', updateSpot);
router.delete('/:id', deleteSpot);

export default router;
