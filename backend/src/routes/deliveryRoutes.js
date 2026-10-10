import express from 'express';
import {
  getPartnerAssignments,
  updateAssignmentStatus,
  getAvailablePartners,
  togglePartnerAvailability
} from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

// Delivery partner actions
router.get(
  '/assignments',
  authorize(ROLES.DELIVERY_PARTNER),
  getPartnerAssignments
);

router.post(
  '/assignments/:id/status',
  authorize(ROLES.DELIVERY_PARTNER),
  updateAssignmentStatus
);

router.post(
  '/availability',
  authorize(ROLES.DELIVERY_PARTNER),
  togglePartnerAvailability
);

// Admin & Delivery Manager actions
router.get(
  '/partners',
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DELIVERY_MANAGER),
  getAvailablePartners
);

export default router;
