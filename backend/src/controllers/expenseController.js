import Expense from '../models/Expense.js';
import { logAudit } from '../utils/auditLogger.js';

export const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;
    const query = {};

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      success: true,
      expenses,
      totalAmount: Math.round(totalAmount * 100) / 100
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const { title, category, amount, date, paymentMethod, paidTo, description, receiptRef } = req.body;

    const expense = await Expense.create({
      title,
      category,
      amount: Number(amount),
      date: date || new Date(),
      paymentMethod: paymentMethod || 'Bank Transfer',
      paidTo,
      description: description || '',
      receiptRef: receiptRef || '',
      recordedBy: req.user._id
    });

    await logAudit({
      action: 'EXPENSE_RECORDED',
      user: req.user,
      entityType: 'Expense',
      entityId: expense._id,
      details: { title, category, amount },
      req
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};
