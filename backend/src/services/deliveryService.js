import DeliveryAssignment from '../models/DeliveryAssignment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { inventoryService } from './inventoryService.js';
import { ORDER_STATUS, ROLES } from '../config/constants.js';

export const deliveryService = {
  /**
   * Manually assign an order to a delivery partner
   */
  async assignPartner({ orderId, partnerId, assignedBy }) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== ROLES.DELIVERY_PARTNER || !partner.isActive) {
      throw new Error('Designated user is not an active delivery partner');
    }

    // Create or update assignment
    let assignment = await DeliveryAssignment.findOne({ order: order._id });
    if (assignment) {
      assignment.partner = partner._id;
      assignment.partnerName = partner.name;
      assignment.partnerPhone = partner.phone;
      assignment.status = 'assigned';
      assignment.assignedAt = new Date();
      await assignment.save();
    } else {
      assignment = await DeliveryAssignment.create({
        order: order._id,
        orderNumber: order.orderNumber,
        partner: partner._id,
        partnerName: partner.name,
        partnerPhone: partner.phone,
        pickupAddress: {
          hubName: 'Zuno Central Hub - Warehouse A',
          address: 'Plot 42, Food Park, Industrial Area',
          phone: '+919876543210'
        },
        deliveryAddress: {
          fullName: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          addressLine1: order.shippingAddress.addressLine1,
          city: order.shippingAddress.city,
          pincode: order.shippingAddress.pincode
        },
        customerVerificationCode: order.deliveryOtp
      });
    }

    // Update partner workload count
    await User.findByIdAndUpdate(partner._id, {
      $inc: { 'deliveryPartnerProfile.activeDeliveriesCount': 1 }
    });

    // Update order status
    order.orderStatus = ORDER_STATUS.ASSIGNED;
    order.deliveryPartner = partner._id;
    order.statusHistory.push({
      status: ORDER_STATUS.ASSIGNED,
      updatedBy: assignedBy?.name || 'Delivery Manager',
      notes: `Assigned to delivery partner ${partner.name} (${partner.phone})`
    });
    await order.save();

    return { order, assignment };
  },

  /**
   * Smart auto-assignment engine based on availability, pincode, and workload
   */
  async autoAssign(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const customerPincode = order.shippingAddress.pincode;

    // Find available delivery partners
    const eligiblePartners = await User.find({
      role: ROLES.DELIVERY_PARTNER,
      isActive: true,
      'deliveryPartnerProfile.isAvailable': true
    });

    if (!eligiblePartners.length) {
      return { success: false, message: 'No available delivery partners currently online' };
    }

    // Score partners: prioritize matching pincode and lower workload
    let bestPartner = null;
    let lowestWorkload = Infinity;

    for (const partner of eligiblePartners) {
      const profile = partner.deliveryPartnerProfile || {};
      const workload = profile.activeDeliveriesCount || 0;
      const coversPincode = (profile.servicePincodes || []).includes(customerPincode);

      // Score formula
      const score = workload - (coversPincode ? 2 : 0);

      if (score < lowestWorkload) {
        lowestWorkload = score;
        bestPartner = partner;
      }
    }

    if (!bestPartner) {
      bestPartner = eligiblePartners[0];
    }

    return await this.assignPartner({
      orderId: order._id,
      partnerId: bestPartner._id,
      assignedBy: { name: 'Zuno Auto-Dispatch Engine' }
    });
  },

  /**
   * Driver updates status: accept, reject, pick up, out for delivery, deliver (with OTP), fail
   */
  async updatePartnerStatus({ assignmentId, newStatus, partnerId, otpCode = '', failReason = '', notes = '' }) {
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    if (String(assignment.partner) !== String(partnerId)) {
      throw new Error('Unauthorized: You are not assigned to this delivery');
    }

    const order = await Order.findById(assignment.order);
    if (!order) throw new Error('Associated order not found');

    const partner = await User.findById(partnerId);

    if (newStatus === 'accepted') {
      assignment.status = 'accepted';
      assignment.acceptedAt = new Date();
    } else if (newStatus === 'rejected') {
      assignment.status = 'rejected';
      assignment.rejectedAt = new Date();
      assignment.rejectionReason = notes || 'Rejected by partner';
      order.orderStatus = ORDER_STATUS.READY_FOR_DISPATCH;
      order.deliveryPartner = null;

      if (partner) {
        await User.findByIdAndUpdate(partnerId, {
          $inc: { 'deliveryPartnerProfile.activeDeliveriesCount': -1 }
        });
      }
    } else if (newStatus === 'picked_up') {
      assignment.status = 'picked_up';
      assignment.pickedUpAt = new Date();
      order.orderStatus = ORDER_STATUS.PICKED_UP;
    } else if (newStatus === 'out_for_delivery') {
      assignment.status = 'out_for_delivery';
      order.orderStatus = ORDER_STATUS.OUT_FOR_DELIVERY;
    } else if (newStatus === 'delivered') {
      // Validate customer OTP verification code if provided or enforce it
      if (otpCode && otpCode.trim() !== order.deliveryOtp) {
        throw new Error('Invalid delivery OTP verification code. Please confirm with the customer.');
      }

      assignment.status = 'delivered';
      assignment.deliveredAt = new Date();
      assignment.proofNotes = notes || 'Delivered directly to recipient';

      order.orderStatus = ORDER_STATUS.DELIVERED;
      order.deliveredAt = new Date();

      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
        order.paymentDetails.paidAt = new Date();
      }

      // Finalize inventory deduction on delivery
      await inventoryService.fulfillOrderStock(order._id, order.orderNumber, partner);

      // Decrement partner workload and increment delivered count
      if (partner) {
        await User.findByIdAndUpdate(partnerId, {
          $inc: {
            'deliveryPartnerProfile.activeDeliveriesCount': -1,
            'deliveryPartnerProfile.totalDeliveredCount': 1
          }
        });
      }
    } else if (newStatus === 'failed') {
      assignment.status = 'failed';
      assignment.failedAt = new Date();
      assignment.failedReason = failReason || 'Customer unreachable / wrong address';

      order.orderStatus = ORDER_STATUS.FAILED;

      if (partner) {
        await User.findByIdAndUpdate(partnerId, {
          $inc: { 'deliveryPartnerProfile.activeDeliveriesCount': -1 }
        });
      }
    }

    assignment.notes = notes;
    await assignment.save();

    order.statusHistory.push({
      status: order.orderStatus,
      updatedBy: partner?.name || 'Delivery Partner',
      notes: notes || `Status changed to ${order.orderStatus}`
    });
    await order.save();

    return { order, assignment };
  }
};
