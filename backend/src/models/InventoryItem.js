import mongoose from 'mongoose';
import { INVENTORY_TYPES } from '../config/constants.js';

const inventoryItemSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: Object.values(INVENTORY_TYPES),
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'packet', 'box', 'piece', 'litre'],
    default: 'packet'
  },
  // Physical sellable stock sitting in warehouse
  physicalStock: { type: Number, required: true, default: 0, min: 0 },
  // Stock temporarily reserved for orders awaiting dispatch
  reservedStock: { type: Number, required: true, default: 0, min: 0 },
  // Damaged or quarantine stock (not sellable)
  damagedStock: { type: Number, default: 0, min: 0 },
  // Expired stock (not sellable)
  expiredStock: { type: Number, default: 0, min: 0 },
  reorderThreshold: { type: Number, default: 10, min: 0 },
  costPerUnit: { type: Number, default: 0, min: 0 },
  warehouseLocation: { type: String, default: 'Main Warehouse - Bay A' },
  linkedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  linkedVariantSku: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Available Stock = Physical Sellable Stock - Reserved Stock
inventoryItemSchema.virtual('availableStock').get(function () {
  return Math.max(0, (this.physicalStock || 0) - (this.reservedStock || 0));
});

inventoryItemSchema.index({ type: 1 });

export default mongoose.model('InventoryItem', inventoryItemSchema);
