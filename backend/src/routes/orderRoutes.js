import express from 'express';
import {
  validateCheckout,
  createOrder,
  verifyPayment,
  handlePaymentWebhook,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  assignDeliveryPartner,
  autoAssignDeliveryPartner,
  getOrderNotifications,
  resendOrderOtp,
  processRefund
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Cart / Checkout price validation (public or authenticated)
router.post('/validate-checkout', validateCheckout);

// Public webhook endpoint for payment provider notifications
router.post('/webhook', handlePaymentWebhook);

// Customer order routes
router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/:id/cancel', protect, cancelOrder);
router.get('/:id/notifications', protect, getOrderNotifications);
router.post('/:id/resend-otp', protect, resendOrderOtp);

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

router.post(
  '/:id/refund',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  processRefund
);

export default router;
