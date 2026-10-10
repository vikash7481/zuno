import mongoose from 'mongoose';

const deliveryAssignmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNumber: { type: String, required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerName: { type: String, required: true },
  partnerPhone: { type: String, required: true },
  status: {
    type: String,
    enum: ['assigned', 'accepted', 'rejected', 'picked_up', 'out_for_delivery', 'delivered', 'failed'],
    default: 'assigned'
  },
  pickupAddress: {
    hubName: { type: String, default: 'Zuno Central Hub - Warehouse A' },
    address: { type: String, default: 'Plot 42, Food Park, Industrial Area' },
    phone: { type: String, default: '+919876543210' }
  },
  deliveryAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  assignedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String, default: '' },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
  failedAt: { type: Date },
  failedReason: { type: String, default: '' },
  notes: { type: String, default: '' },
  customerVerificationCode: { type: String, default: '' }, // OTP code verified by driver
  proofNotes: { type: String, default: '' }
}, {
  timestamps: true
});

deliveryAssignmentSchema.index({ partner: 1, status: 1 });
deliveryAssignmentSchema.index({ order: 1 });

export default mongoose.model('DeliveryAssignment', deliveryAssignmentSchema);
