import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  address: { type: String, required: true },
  gstin: { type: String, default: '', uppercase: true, trim: true },
  suppliedCategories: [{ type: String }], // e.g. "Raw Makhana", "Seasoning & Spices", "Packaging"
  outstandingBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

supplierSchema.index({ name: 1 });
supplierSchema.index({ companyName: 1 });

export default mongoose.model('Supplier', supplierSchema);
