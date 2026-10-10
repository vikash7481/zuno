import express from 'express';
import {
  validateCheckout,
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  assignDeliveryPartner,
  autoAssignDeliveryPartner
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Cart / Checkout price validation (public or authenticated)
router.post('/validate-checkout', validateCheckout);

// Customer order routes
router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/:id/cancel', protect, cancelOrder);

// Admin & Staff order operations
router.get(
  '/',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORDER_MANAGER, ROLES.DELIVERY_MANAGER, ROLES.SUPPORT_STAFF),
  getAllOrders
);

router.put(
  '/:id/status',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORDER_MANAGER),
  updateOrderStatus
);

router.post(
  '/:id/assign-delivery',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DELIVERY_MANAGER),
  assignDeliveryPartner
);

router.post(
  '/:id/auto-assign',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DELIVERY_MANAGER),
  autoAssignDeliveryPartner
);

export default router;
