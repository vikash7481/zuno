import Order from '../models/Order.js';

// In-memory fallback and event bus for dispatched notifications
const notificationsStore = new Map();

export const notificationService = {
  /**
   * Dispatches a simulated SMS
   */
  async sendSMS({ to, message, orderId, orderNumber, type = 'ORDER_ALERT' }) {
    const timestamp = new Date();
    const entry = {
      id: `SMS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      channel: 'SMS',
      to,
      message,
      type,
      orderId: String(orderId),
      orderNumber,
      status: 'DELIVERED',
      sentAt: timestamp
    };

    console.log(`\n[SMS GATEWAY] >>> Sent to ${to}: "${message}"`);

    // Store under order ID
    if (orderId) {
      const existing = notificationsStore.get(String(orderId)) || [];
      existing.push(entry);
      notificationsStore.set(String(orderId), existing);

      // Append to order's status history or notes
      try {
        await Order.findByIdAndUpdate(orderId, {
          $push: {
            statusHistory: {
              status: 'NOTIFICATION_SENT',
              updatedBy: 'System Notification Gateway',
              notes: `[SMS Dispatched to ${to}] ${message.slice(0, 80)}...`
            }
          }
        });
      } catch (err) {
        // Silently continue if order model doesn't allow custom status
      }
    }

    return entry;
  },

  /**
   * Dispatches a simulated WhatsApp template message
   */
  async sendWhatsApp({ to, templateName, parameters, orderId, orderNumber }) {
    const timestamp = new Date();
    const formattedParams = Object.entries(parameters || {})
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    const message = `🌿 *Zuno Artisanal Makhana*\nTemplate: ${templateName}\n${formattedParams}\n\n_Thank you for choosing artisanal quality._`;

    const entry = {
      id: `WA-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      channel: 'WHATSAPP',
      to,
      message,
      type: templateName,
      orderId: String(orderId),
      orderNumber,
      status: 'DELIVERED',
      sentAt: timestamp
    };

    console.log(`\n[WHATSAPP GATEWAY] >>> Sent to ${to}:\n${message}\n`);

    if (orderId) {
      const existing = notificationsStore.get(String(orderId)) || [];
      existing.push(entry);
      notificationsStore.set(String(orderId), existing);
    }

    return entry;
  },

  /**
   * Notify Customer of Order Confirmation
   */
  async notifyOrderPlaced(order) {
    const phone = order.customerDetails?.phone || order.shippingAddress?.phone;
    if (!phone) return null;

    const smsText = `ZUNO: Your order #${order.orderNumber} for Rs.${order.totalAmount} has been confirmed. Fresh batches are being slow-roasted. Track: http://localhost:5173/orders/${order._id}`;
    await this.sendSMS({
      to: phone,
      message: smsText,
      orderId: order._id,
      orderNumber: order.orderNumber,
      type: 'ORDER_CONFIRMED'
    });

    await this.sendWhatsApp({
      to: phone,
      templateName: 'order_confirmed_v1',
      parameters: {
        'Order ID': order.orderNumber,
        'Amount': `₹${order.totalAmount}`,
        'Items': order.items?.length || 1,
        'Status': 'Confirmed & Slow Roasting'
      },
      orderId: order._id,
      orderNumber: order.orderNumber
    });
  },

  /**
   * Notify Customer when Order is Out for Delivery with 4-Digit OTP
   */
  async notifyOutForDelivery(order, partner) {
    const phone = order.customerDetails?.phone || order.shippingAddress?.phone;
    if (!phone) return null;

    const driverName = partner?.name || 'Assigned Driver';
    const otp = order.deliveryOtp || '----';

    const smsText = `ZUNO ALERT: Your order #${order.orderNumber} is OUT FOR DELIVERY with ${driverName}. Share 4-digit Delivery OTP: [ ${otp} ] ONLY upon parcel handover.`;
    await this.sendSMS({
      to: phone,
      message: smsText,
      orderId: order._id,
      orderNumber: order.orderNumber,
      type: 'DELIVERY_OTP'
    });

    await this.sendWhatsApp({
      to: phone,
      templateName: 'out_for_delivery_otp',
      parameters: {
        'Order ID': order.orderNumber,
        'Rider': driverName,
        'Delivery OTP': `🔑 *${otp}*`,
        'Safety Note': 'Share this 4-digit OTP ONLY with the rider when inspecting your package.'
      },
      orderId: order._id,
      orderNumber: order.orderNumber
    });
  },

  /**
   * Retrieve notification history for an order
   */
  getHistory(orderId) {
    return notificationsStore.get(String(orderId)) || [];
  }
};
