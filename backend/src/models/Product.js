import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true, trim: true },
  barcode: { type: String, default: '', trim: true },
  packSize: { type: String, required: true, trim: true }, // e.g. "100g", "250g", "500g", "1kg", "Pack of 3 (300g)"
  weightGrams: { type: Number, required: true, min: 1 },
  flavor: { type: String, required: true, trim: true },
  mrp: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, default: 0, min: 0 },
  taxPercent: { type: Number, default: 5 }, // GST rate for food products (typically 5% or 12%)
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { _id: true });

const nutritionalInfoSchema = new mongoose.Schema({
  servingSize: { type: String, default: '100g' },
  energyKcal: { type: Number, default: 350 },
  proteinG: { type: Number, default: 9.7 },
  carbohydratesG: { type: Number, default: 76.9 },
  dietaryFiberG: { type: Number, default: 7.6 },
  totalFatG: { type: Number, default: 0.5 },
  calciumMg: { type: Number, default: 60 },
  ironMg: { type: Number, default: 1.4 },
  sodiumMg: { type: Number, default: 15 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, default: 'Zuno', trim: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, required: true },
  images: [{ type: String }],
  variants: [variantSchema],
  ingredients: [{ type: String }],
  nutritionalInfo: { type: nutritionalInfoSchema, default: () => ({}) },
  allergens: { type: String, default: 'Processed in a facility that may handle tree nuts.' },
  storageInstructions: { type: String, default: 'Store in a cool, dry place. Keep airtight once opened.' },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  averageRating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

productSchema.index({ 'variants.sku': 1 });

export default mongoose.model('Product', productSchema);
