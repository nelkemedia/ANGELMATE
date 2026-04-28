import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import {
  getCurrentAd, getAdsForPosition, trackClick, trackImpression,
  getAdvertisers, createAdvertiser, updateAdvertiser, deleteAdvertiser,
  getAds, createAd, updateAd, deleteAd
} from '../controllers/ads.controller.js';

const router = Router();

// Public
router.get('/current',              getCurrentAd);
router.get('/all',                  getAdsForPosition);
router.post('/:id/click',           trackClick);
router.post('/:id/impression',      trackImpression);

// Admin
router.get('/admin/advertisers',         protect, requireAdmin, getAdvertisers);
router.post('/admin/advertisers',        protect, requireAdmin, createAdvertiser);
router.put('/admin/advertisers/:id',     protect, requireAdmin, updateAdvertiser);
router.delete('/admin/advertisers/:id',  protect, requireAdmin, deleteAdvertiser);

router.get('/admin',         protect, requireAdmin, getAds);
router.post('/admin',        protect, requireAdmin, createAd);
router.put('/admin/:id',     protect, requireAdmin, updateAd);
router.delete('/admin/:id',  protect, requireAdmin, deleteAd);

export default router;
