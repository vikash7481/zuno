import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../config/constants.js';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku: { type: String, required: true, uppercase: true },
  productName: { type: String, required: true },
  flavor: { type: String, required: true },
  packSize: { type: String, required: true },
  weightGrams: { type: Number, required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  taxPercent: { type: Number, default: 5 },
  taxAmount: { type: Number, default: 0 }
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System' },
  notes: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String, default: '' }
  },
  subtotal: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  couponCode: { type: String, default: '' },
  taxAmount: { type: Number, default: 0, min: 0 },
  deliveryFee: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentMethod: {
    type: String,
    enum: Object.values(PAYMENT_METHODS),
    default: PAYMENT_METHODS.COD
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  paymentDetails: {
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    paidAt: { type: Date },
    failureReason: { type: String, default: '' }
  },
  orderStatus: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING_PAYMENT
  },
  statusHistory: [statusHistorySchema],
  cancellationReason: { type: String, default: '' },
  cancelledAt: { type: Date },
  stockReleased: { type: Boolean, default: false }, // Safeguard against duplicate stock release
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryOtp: { type: String, default: '' },
  invoiceNumber: { type: String, default: '' },
  estimatedDeliveryDate: { type: Date },
  deliveredAt: { type: Date }
}, {
  timestamps: true
});

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ deliveryPartner: 1, orderStatus: 1 });

export default mongoose.model('Order', orderSchema);
