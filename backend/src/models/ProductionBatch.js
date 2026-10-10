import mongoose from 'mongoose';
import { PRODUCTION_STATUS } from '../config/constants.js';

const issuedMaterialSchema = new mongoose.Schema({
  sku: { type: String, required: true, uppercase: true },
  name: { type: String, required: true },
  unit: { type: String, required: true },
  issuedQty: { type: Number, required: true, min: 0 },
  actualUsedQty: { type: Number, default: 0, min: 0 },
  unitCost: { type: Number, default: 0 }
}, { _id: false });

const productionBatchSchema = new mongoose.Schema({
  batchCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku: { type: String, required: true, uppercase: true },
  plannedOutputUnits: { type: Number, required: true, min: 1 },
  actualOutputUnits: { type: Number, default: 0, min: 0 },
  expectedYieldPercent: { type: Number, default: 95.5 },
  actualYieldPercent: { type: Number, default: 0 },
  processingLossQty: { type: Number, default: 0 },
  processingLossUnit: { type: String, default: 'kg' },
  materialsIssued: [issuedMaterialSchema],
  packagingIssued: [issuedMaterialSchema],
  status: {
    type: String,
    enum: Object.values(PRODUCTION_STATUS),
    default: PRODUCTION_STATUS.PLANNED
  },
  qualityInspection: {
    status: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
    inspectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    inspectionDate: { type: Date }
  },
  finishedBatchNumber: { type: String, default: '' },
  totalCost: { type: Number, default: 0 },
  costPerUnit: { type: Number, default: 0 },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' },
  startDate: { type: Date },
  completedDate: { type: Date }
}, {
  timestamps: true
});

productionBatchSchema.index({ status: 1 });

export default mongoose.model('ProductionBatch', productionBatchSchema);
