import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Receipt, Plus, Trash2, X, IndianRupee } from 'lucide-react';

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { success, error: notifyError } = useNotification();

  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'packaging',
    amount: '',
    paidTo: '',
    paymentMethod: 'Bank Transfer',
    description: ''
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.expenses || []);
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', newExpense);
      success('Operating expense recorded successfully!');
      setShowModal(false);
      setNewExpense({
        title: '',
        category: 'packaging',
        amount: '',
        paidTo: '',
        paymentMethod: 'Bank Transfer',
        description: ''
      });
      fetchExpenses();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      success('Expense record removed.');
      fetchExpenses();
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Financial Ledger</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Operating Expenses</h1>
          <p className="text-xs text-gray-500 mt-0.5">Rent, utility power, packaging, wages, and logistics spending</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl border border-cream-300 shadow-sm text-xs">
            <span className="text-gray-500 block">Total Recorded:</span>
            <span className="font-serif text-lg font-bold text-brand-900">₹{totalAmount.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Record New Expense
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-cream-300">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Expense Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Paid To</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {expenses.map((exp) => (
              <tr key={exp._id} className="hover:bg-cream-50 transition">
                <td className="py-3 px-4 text-gray-500">
                  {new Date(exp.date).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 font-bold text-charcoal-900">
                  {exp.title}
                </td>
                <td className="py-3 px-4">
                  <span className="capitalize px-2 py-0.5 rounded-full bg-cream-200 text-charcoal-800 text-[10px] font-bold">
                    {exp.category?.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {exp.paidTo}
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {exp.paymentMethod}
                </td>
                <td className="py-3 px-4 font-serif text-sm font-bold text-brand-950">
                  ₹{exp.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDeleteExpense(exp._id)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-cream-200">
              <h3 className="font-serif text-lg font-bold text-brand-950">Record Operating Expense</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Warehouse Facility Rent"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  >
                    <option value="raw_material">Raw Material</option>
                    <option value="packaging">Packaging & Pouches</option>
                    <option value="rent">Warehouse Rent</option>
                    <option value="electricity">Electricity / Power</option>
                    <option value="delivery">Delivery Fleet</option>
                    <option value="salaries">Wages & Salaries</option>
                    <option value="marketing">Marketing</option>
                    <option value="equipment">Roaster Equipment</option>
                    <option value="other">Other Operations</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Recipient / Paid To *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Industrial Park Ltd"
                  value={newExpense.paidTo}
                  onChange={(e) => setNewExpense({ ...newExpense, paidTo: e.target.value })}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
