import Order from '../models/Order.js';
import { orderService } from '../services/orderService.js';
import { paymentService } from '../services/paymentService.js';
import { deliveryService } from '../services/deliveryService.js';
import { logAudit } from '../utils/auditLogger.js';
import { ORDER_STATUS, PAYMENT_STATUS, VALID_ORDER_TRANSITIONS, ROLES } from '../config/constants.js';

export const validateCheckout = async (req, res, next) => {
  try {
    const { items, couponCode, shippingPincode } = req.body;
    const summary = await orderService.calculateOrderPricing({
      items,
      couponCode,
      shippingPincode
    });
    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    const order = await orderService.createOrder({
      customer: req.user,
      items,
      shippingAddress,
      paymentMethod,
      couponCode
    });

    // Initialize payment provider response
    const paymentData = await paymentService.createPaymentOrder({
      order,
      paymentMethod
    });

    if (paymentData.razorpayOrderId) {
      order.paymentDetails.razorpayOrderId = paymentData.razorpayOrderId;
      await order.save();
    }

    await logAudit({
      action: 'ORDER_CREATED',
      user: req.user,
      entityType: 'Order',
      entityId: order._id,
      details: { orderNumber: order.orderNumber, totalAmount: order.totalAmount, paymentMethod },
      req
    });

    res.status(201).json({
      success: true,
      order,
      payment: paymentData
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const verificationResult = await paymentService.verifyPayment({
      order,
      paymentData: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    });

    if (verificationResult.verified) {
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.orderStatus = ORDER_STATUS.CONFIRMED;
      order.paymentDetails = {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: razorpaySignature || 'sandbox_sig',
        paidAt: verificationResult.paidAt
      };
      order.statusHistory.push({
        status: ORDER_STATUS.CONFIRMED,
        updatedBy: 'Payment Gateway',
        notes: `Payment verified (${verificationResult.mode} mode). Transaction ID: ${razorpayPaymentId}`
      });
      await order.save();

      await logAudit({
        action: 'PAYMENT_VERIFIED',
        user: req.user,
        entityType: 'Order',
        entityId: order._id,
        details: { transactionId: razorpayPaymentId, amount: order.totalAmount },
        req
      });

      return res.json({ success: true, order, message: 'Payment successfully verified' });
    }

    res.status(400).json({ success: false, message: 'Payment verification failed' });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('deliveryPartner', 'name phone'),
      Order.countDocuments({ customer: req.user._id })
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('deliveryPartner', 'name phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Ensure customer can only view their own order
    const isOwner = String(order.customer) === String(req.user._id);
    const isStaff = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORDER_MANAGER, ROLES.DELIVERY_MANAGER, ROLES.SUPPORT_STAFF].includes(req.user.role);
    const isAssignedPartner = req.user.role === ROLES.DELIVERY_PARTNER && String(order.deliveryPartner?._id) === String(req.user._id);

    if (!isOwner && !isStaff && !isAssignedPartner) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const cancelledOrder = await orderService.cancelOrder({
      orderId: id,
      reason: reason || 'Customer requested cancellation',
      user: req.user
    });

    await logAudit({
      action: 'ORDER_CANCELLED',
      user: req.user,
      entityType: 'Order',
      entityId: cancelledOrder._id,
      details: { reason, orderNumber: cancelledOrder.orderNumber },
      req
    });

    res.json({ success: true, order: cancelledOrder, message: 'Order has been successfully cancelled and stock released' });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } },
        { 'customerDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('deliveryPartner', 'name phone'),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Validate state transitions
    const validNextStates = VALID_ORDER_TRANSITIONS[order.orderStatus] || [];
    if (!validNextStates.includes(status) && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(400).json({
        success: false,
        message: `Invalid state transition from '${order.orderStatus}' to '${status}'. Allowed: ${validNextStates.join(', ')}`
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      updatedBy: req.user.name,
      notes: notes || `Order marked as ${status}`
    });

    if (status === ORDER_STATUS.DELIVERED) {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = PAYMENT_STATUS.PAID;
      }
    }

    await order.save();

    await logAudit({
      action: 'ORDER_STATUS_UPDATED',
      user: req.user,
      entityType: 'Order',
      entityId: order._id,
      details: { previousStatus: order.orderStatus, newStatus: status, notes },
      req
    });

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const assignDeliveryPartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { partnerId } = req.body;

    const result = await deliveryService.assignPartner({
      orderId: id,
      partnerId,
      assignedBy: req.user
    });

    res.json({ success: true, order: result.order, assignment: result.assignment });
  } catch (error) {
    next(error);
  }
};

export const autoAssignDeliveryPartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deliveryService.autoAssign(id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
