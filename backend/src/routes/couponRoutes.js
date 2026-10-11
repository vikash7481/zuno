import express from 'express';
import {
  getCoupons,
  getActiveCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public: Used by customer promotional coupon strip & cart
router.get('/active', getActiveCoupons);
router.post('/validate', validateCoupon);

// Admin management
router.get('/', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getCoupons);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), createCoupon);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), updateCoupon);
router.delete('/:id', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteCoupon);
router.patch('/:id/toggle', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), toggleCouponStatus);

export default router;

