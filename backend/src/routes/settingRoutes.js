import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public settings (pincodes, free delivery threshold, branding)
router.get('/', getSettings);

// Admin update settings
router.put('/', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), updateSettings);

export default router;
