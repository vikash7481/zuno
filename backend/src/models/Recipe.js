import mongoose from 'mongoose';

const recipeItemSchema = new mongoose.Schema({
  itemSku: { type: String, required: true, uppercase: true },
  itemName: { type: String, required: true },
  requiredQty: { type: Number, required: true, min: 0.001 },
  unit: { type: String, required: true, default: 'kg' }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku: { type: String, required: true, uppercase: true },
  targetPackSize: { type: String, required: true }, // e.g. "100g", "250g"
  batchSizeYieldUnits: { type: Number, required: true, min: 1 }, // Standard batch size, e.g. 500 packets
  rawMaterials: [recipeItemSchema], // e.g. Raw Makhana Grade A
  ingredients: [recipeItemSchema],  // e.g. Cold-pressed Olive Oil, Salt
  flavours: [recipeItemSchema],     // e.g. Peri Peri seasoning powder
  packagingMaterials: [recipeItemSchema], // e.g. Printed Nitrogen Pouches, Corrugated boxes
  expectedProcessingLossPercent: { type: Number, default: 4.5, min: 0, max: 50 },
  roastingTemperatureC: { type: Number, default: 165 },
  roastingTimeMinutes: { type: Number, default: 12 },
  instructions: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

export default mongoose.model('Recipe', recipeSchema);
