import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES } from '../config/constants.js';

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: EXPENSE_CATEGORIES,
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: 'Bank Transfer' },
  paidTo: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  receiptRef: { type: String, default: '' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

expenseSchema.index({ category: 1, date: -1 });

export default mongoose.model('Expense', expenseSchema);
