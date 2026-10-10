import mongoose from 'mongoose';

const inventoryReservationSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNumber: { type: String, required: true },
  sku: { type: String, required: true, uppercase: true },
  quantity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'released', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes default expiration for unpaid reservations
  }
}, {
  timestamps: true
});

inventoryReservationSchema.index({ orderId: 1, sku: 1 });
inventoryReservationSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.model('InventoryReservation', inventoryReservationSchema);
