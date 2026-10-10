import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
import { inventoryService } from './inventoryService.js';
import { withOptionalTransaction } from '../utils/transactionHelper.js';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, ROLES } from '../config/constants.js';

export const orderService = {
  /**
   * Recalculate order totals authoritative from database models
   */
  async calculateOrderPricing({ items, couponCode = '', shippingPincode = '' }) {
    if (!items || !items.length) {
      throw new Error('Order must contain at least one item');
    }

    // Default business rules
    let freeDeliveryThreshold = 499;
    let standardDeliveryFee = 49;
    let standardTaxPercent = 5;

    // Load settings from DB if available
    try {
      const freeDelSetting = await Setting.findOne({ key: 'free_delivery_threshold' });
      if (freeDelSetting) freeDeliveryThreshold = Number(freeDelSetting.value);
      const delFeeSetting = await Setting.findOne({ key: 'standard_delivery_fee' });
      if (delFeeSetting) standardDeliveryFee = Number(delFeeSetting.value);
    } catch (e) {
      // fallback to defaults
    }

    let subtotal = 0;
    let calculatedTax = 0;
    const validatedItems = [];

    for (const item of items) {
      const { productId, variantSku, quantity } = item;
      const qty = parseInt(quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        throw new Error('Invalid item quantity');
      }

      const product = await Product.findById(productId);
      if (!product || !product.isPublished) {
        throw new Error(`Product '${productId}' is inactive or not found`);
      }

      const variant = product.variants.find(v => v.sku === variantSku && v.isActive);
      if (!variant) {
        throw new Error(`Variant SKU '${variantSku}' is inactive or not found`);
      }

      const unitPrice = variant.sellingPrice;
      const lineSubtotal = unitPrice * qty;
      const taxRate = variant.taxPercent || standardTaxPercent;
      const lineTax = Math.round((lineSubtotal * taxRate / 100) * 100) / 100;

      subtotal += lineSubtotal;
      calculatedTax += lineTax;

      validatedItems.push({
        product: product._id,
        variantSku: variant.sku,
        productName: product.name,
        flavor: variant.flavor,
        packSize: variant.packSize,
        weightGrams: variant.weightGrams,
        image: product.images?.[0] || '',
        quantity: qty,
        unitPrice,
        mrp: variant.mrp,
        subtotal: lineSubtotal,
        taxPercent: taxRate,
        taxAmount: lineTax
      });
    }

    // Coupon discount calculation
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      if (coupon) {
        if (subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'percentage') {
            const rawDiscount = (subtotal * coupon.discountValue) / 100;
            discountAmount = Math.min(rawDiscount, coupon.maxDiscountAmount || rawDiscount);
          } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
          }
          appliedCoupon = coupon.code;
        }
      }
    }

    // Delivery fee calculation
    const eligibleForFreeDelivery = (subtotal - discountAmount) >= freeDeliveryThreshold;
    const deliveryFee = eligibleForFreeDelivery ? 0 : standardDeliveryFee;

    const totalAmount = Math.max(0, Math.round((subtotal - discountAmount + deliveryFee) * 100) / 100);

    return {
      items: validatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      couponCode: appliedCoupon || '',
      taxAmount: Math.round(calculatedTax * 100) / 100,
      deliveryFee,
      totalAmount,
      isFreeDelivery: deliveryFee === 0,
      freeDeliveryThreshold
    };
  },

  /**
   * Create an authoritative Order and reserve stock atomically.
   * Leverages MongoDB multi-document ACID transactions when replica sets are configured,
   * and falls back to atomic conditional query operations in standalone mode.
   */
  async createOrder({ customer, items, shippingAddress, paymentMethod = PAYMENT_METHODS.COD, couponCode = '' }) {
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.pincode) {
      throw new Error('Complete shipping address is required');
    }

    // Server-side recalculation
    const pricing = await this.calculateOrderPricing({
      items,
      couponCode,
      shippingPincode: shippingAddress.pincode
    });

    const orderNumber = `ZUNO-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit customer OTP

    // Determine initial status based on payment method
    const initialStatus = paymentMethod === PAYMENT_METHODS.COD ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING_PAYMENT;
    const initialPaymentStatus = PAYMENT_STATUS.PENDING;

    return withOptionalTransaction(async (session) => {
      let createdOrder = null;
      try {
        const orderDocs = await Order.create([{
          orderNumber,
          invoiceNumber,
          customer: customer._id,
          customerDetails: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || shippingAddress.phone
          },
          items: pricing.items,
          shippingAddress,
          subtotal: pricing.subtotal,
          discountAmount: pricing.discountAmount,
          couponCode: pricing.couponCode,
          taxAmount: pricing.taxAmount,
          deliveryFee: pricing.deliveryFee,
          totalAmount: pricing.totalAmount,
          paymentMethod,
          paymentStatus: initialPaymentStatus,
          orderStatus: initialStatus,
          deliveryOtp,
          statusHistory: [{
            status: initialStatus,
            updatedBy: 'Customer',
            notes: `Order created via ${paymentMethod.toUpperCase()}`
          }],
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 business days
        }], session ? { session } : {});

        createdOrder = orderDocs[0];

        // Atomically reserve inventory
        await inventoryService.reserveStock(pricing.items, createdOrder._id, createdOrder.orderNumber, customer, session);

        // Increment coupon usage count if used
        if (pricing.couponCode) {
          await Coupon.updateOne(
            { code: pricing.couponCode },
            {
              $inc: { usedCount: 1 },
              $push: { usedByUsers: { user: customer._id, usedAt: new Date() } }
            },
            session ? { session } : {}
          );
        }

        return createdOrder;
      } catch (stockError) {
        // If not running inside an active replica set session, roll back created order manually
        if (!session && createdOrder?._id) {
          await Order.findByIdAndDelete(createdOrder._id);
        }
        throw stockError;
      }
    });
  },

  /**
   * Safe cancellation workflow: releases stock exactly once
   * Supports multi-document MongoDB transactions
   */
  async cancelOrder({ orderId, reason = 'Customer requested cancellation', user }) {
    return withOptionalTransaction(async (session) => {
      const orderQuery = Order.findById(orderId);
      if (session) orderQuery.session(session);
      const order = await orderQuery;

      if (!order) {
        throw new Error('Order not found');
      }

      // Authorization check: Customer can only cancel their own orders; Staff can cancel if permitted
      const isCustomerOwner = user && String(order.customer) === String(user._id);
      const isStaff = user && [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORDER_MANAGER].includes(user.role);

      if (!isCustomerOwner && !isStaff) {
        throw new Error('You are not authorized to cancel this order');
      }

      // Eligibility check
      const unCancellableStatuses = [
        ORDER_STATUS.PICKED_UP,
        ORDER_STATUS.OUT_FOR_DELIVERY,
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.CANCELLED,
        ORDER_STATUS.RETURNED
      ];

      if (unCancellableStatuses.includes(order.orderStatus)) {
        throw new Error(`Order cannot be cancelled in '${order.orderStatus}' status`);
      }

      // Check safeguard: prevent duplicate stock release
      if (!order.stockReleased) {
        await inventoryService.releaseReservation(order._id, order.orderNumber, reason, user, session);
        order.stockReleased = true;
      }

      order.orderStatus = ORDER_STATUS.CANCELLED;
      order.cancellationReason = reason;
      order.cancelledAt = new Date();

      if (order.paymentStatus === PAYMENT_STATUS.PAID) {
        order.paymentStatus = PAYMENT_STATUS.REFUNDED;
      }

      order.statusHistory.push({
        status: ORDER_STATUS.CANCELLED,
        updatedBy: user?.name || 'Customer',
        notes: `Order cancelled: ${reason}`
      });

      await order.save(session ? { session } : {});
      return order;
    });
  }
};
