import express from 'express';
import { getCoupons, validateCoupon, createCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public validation of coupon
router.post('/validate', validateCoupon);

// Admin management
router.get('/', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getCoupons);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), createCoupon);

export default router;
