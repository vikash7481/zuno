import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
  itemSku: { type: String, required: true, uppercase: true },
  itemName: { type: String, required: true },
  itemType: {
    type: String,
    enum: ['raw_material', 'ingredient', 'flavour', 'packaging', 'finished_goods'],
    required: true
  },
  quantity: { type: Number, required: true, min: 0.01 },
  unit: { type: String, required: true, default: 'kg' },
  unitCost: { type: Number, required: true, min: 0 },
  taxPercent: { type: Number, default: 5 },
  totalCost: { type: Number, required: true, min: 0 },
  batchNumber: { type: String, default: '' },
  mfgDate: { type: Date },
  expiryDate: { type: Date }
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  purchaseCode: { type: String, required: true, unique: true, uppercase: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  items: [purchaseItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  paidAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['ordered', 'received', 'cancelled'],
    default: 'ordered'
  },
  stockReceived: { type: Boolean, default: false }, // Guard against double stock receipt
  receivedAt: { type: Date },
  invoiceRef: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

purchaseOrderSchema.index({ supplier: 1 });

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
