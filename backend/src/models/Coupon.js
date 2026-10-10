import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage'
  },
  discountValue: { type: Number, required: true, min: 1 },
  minOrderValue: { type: Number, default: 0, min: 0 },
  maxDiscountAmount: { type: Number, default: 1000, min: 0 }, // Capped discount for percentage
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 1000 },
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  usedByUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

couponSchema.index({ code: 1, isActive: 1 });

export default mongoose.model('Coupon', couponSchema);
