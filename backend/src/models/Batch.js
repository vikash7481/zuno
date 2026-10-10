import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  sku: { type: String, required: true, uppercase: true, trim: true },
  itemName: { type: String, required: true },
  type: {
    type: String,
    enum: ['raw_material', 'ingredient', 'flavour', 'packaging', 'finished_goods'],
    required: true
  },
  quantityReceived: { type: Number, required: true, min: 0 },
  quantityRemaining: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, default: 'packet' },
  mfgDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  productionBatchId: { type: String, default: '' },
  qualityStatus: {
    type: String,
    enum: ['quarantine', 'passed', 'rejected'],
    default: 'passed'
  },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

batchSchema.index({ sku: 1, expiryDate: 1 }); // Index for First-Expiry, First-Out (FEFO)

export default mongoose.model('Batch', batchSchema);
