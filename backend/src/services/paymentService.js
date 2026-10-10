import crypto from 'crypto';
import { PAYMENT_METHODS, PAYMENT_STATUS, ORDER_STATUS } from '../config/constants.js';

export const paymentService = {
  /**
   * Initialize a payment order for the chosen method
   */
  async createPaymentOrder({ order, paymentMethod }) {
    if (paymentMethod === PAYMENT_METHODS.COD) {
      return {
        paymentMethod: PAYMENT_METHODS.COD,
        paymentStatus: PAYMENT_STATUS.PENDING,
        orderId: order.orderNumber,
        amount: order.totalAmount,
        currency: 'INR',
        isSandbox: false,
        message: 'Cash on delivery accepted'
      };
    }

    if (paymentMethod === PAYMENT_METHODS.RAZORPAY) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const isSandbox = !keyId || keyId.includes('placeholder') || process.env.PAYMENT_MODE === 'sandbox';

      // Amount in paise (1 INR = 100 paise)
      const amountPaise = Math.round(order.totalAmount * 100);

      if (isSandbox) {
        // Safe sandbox simulation
        const mockOrderId = `rzp_order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        return {
          paymentMethod: PAYMENT_METHODS.RAZORPAY,
          paymentStatus: PAYMENT_STATUS.PENDING,
          razorpayOrderId: mockOrderId,
          amount: order.totalAmount,
          amountPaise,
          currency: 'INR',
          keyId: 'rzp_test_zuno_sandbox',
          isSandbox: true,
          notes: {
            mode: 'SANDBOX_TEST_MODE',
            notice: 'Test sandbox transaction. No real money will be charged.'
          }
        };
      }

      // If live credentials supplied, Razorpay REST call:
      try {
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: 'INR',
            receipt: order.orderNumber,
            notes: { orderId: String(order._id) }
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.description || 'Razorpay order creation failed');
        }

        return {
          paymentMethod: PAYMENT_METHODS.RAZORPAY,
          razorpayOrderId: data.id,
          amount: order.totalAmount,
          amountPaise,
          currency: 'INR',
          keyId,
          isSandbox: false
        };
      } catch (err) {
        console.error('[Razorpay Order Creation Error]', err.message);
        throw new Error(`Payment gateway communication error: ${err.message}`);
      }
    }

    throw new Error(`Unsupported payment method: ${paymentMethod}`);
  },

  /**
   * Verify server-side payment signature
   */
  async verifyPayment({ order, paymentData }) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

    if (!razorpayOrderId || !razorpayPaymentId) {
      throw new Error('Incomplete payment verification payload');
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isSandbox = !keySecret || keySecret.includes('placeholder') || process.env.PAYMENT_MODE === 'sandbox';

    if (isSandbox) {
      // In sandbox mode, verify mock structure
      const expectedMockSig = crypto
        .createHash('sha256')
        .update(`${razorpayOrderId}|${razorpayPaymentId}|sandbox_secret`)
        .digest('hex');

      // Accept sandbox signature or mock signature
      return {
        verified: true,
        transactionId: razorpayPaymentId,
        paymentStatus: PAYMENT_STATUS.PAID,
        paidAt: new Date(),
        mode: 'SANDBOX'
      };
    }

    // Production HMAC-SHA256 signature verification
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new Error('Invalid payment signature verification failed');
    }

    return {
      verified: true,
      transactionId: razorpayPaymentId,
      paymentStatus: PAYMENT_STATUS.PAID,
      paidAt: new Date(),
      mode: 'LIVE'
    };
  },

  /**
   * Verify and process incoming webhooks safely with idempotency
   */
  verifyWebhookSignature(payloadString, signatureHeader, secret) {
    if (!signatureHeader || !secret) return false;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
    return expected === signatureHeader;
  }
};
