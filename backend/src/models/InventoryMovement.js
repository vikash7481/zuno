import mongoose from 'mongoose';
import { MOVEMENT_TYPES } from '../config/constants.js';

const inventoryMovementSchema = new mongoose.Schema({
  inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  sku: { type: String, required: true, uppercase: true },
  movementType: {
    type: String,
    enum: Object.values(MOVEMENT_TYPES),
    required: true
  },
  quantityChange: { type: Number, required: true }, // positive or negative
  previousPhysicalStock: { type: Number, required: true },
  newPhysicalStock: { type: Number, required: true },
  previousReservedStock: { type: Number, default: 0 },
  newReservedStock: { type: Number, default: 0 },
  unit: { type: String, required: true, default: 'packet' },
  referenceType: {
    type: String,
    enum: ['order', 'purchase', 'production_batch', 'manual_adjustment', 'expiry', 'damage', 'return'],
    required: true
  },
  referenceId: { type: String, default: '' },
  reason: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedByName: { type: String, default: 'System' },
  batchNumber: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

inventoryMovementSchema.index({ sku: 1, timestamp: -1 });
inventoryMovementSchema.index({ movementType: 1 });
inventoryMovementSchema.index({ referenceType: 1, referenceId: 1 });

export default mongoose.model('InventoryMovement', inventoryMovementSchema);
