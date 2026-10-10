import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { BarChart3, Download, TrendingUp, RefreshCw, Calendar, FileText } from 'lucide-react';

export default function AdminReports() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  const { success, error: notifyError } = useNotification();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) {
        const now = new Date();
        if (dateFilter === 'today') {
          params.set('startDate', new Date(now.setHours(0, 0, 0, 0)).toISOString());
        } else if (dateFilter === '7days') {
          params.set('startDate', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        } else if (dateFilter === '30days') {
          params.set('startDate', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        }
      }

      const res = await api.get(`/reports/overview?${params.toString()}`);
      setOverview(res.data.overview);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateFilter]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/reports/export/orders', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `zuno_orders_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('CSV report generated and downloaded!');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fin = overview?.financials || {};
  const expCat = overview?.expensesByCategory || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Executive Financials</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Financial Statements & Reports</h1>
          <p className="text-xs text-gray-500 mt-0.5">Authoritative revenue, tax collections, expense allocations, and net profits</p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs bg-white border border-cream-300 rounded-xl font-medium shadow-sm focus:outline-none"
          >
            <option value="">All Time Records</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-gold-300" />
            <span>{exporting ? 'Generating...' : 'Export Orders CSV'}</span>
          </button>
        </div>
      </div>

      {/* Financial Statement Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-cream-200 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-brand-950">Income & Profitability Summary</h2>
            <p className="text-xs text-gray-500">Calculated in Indian Rupees (INR)</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-cream-100 text-charcoal-800 rounded-full border border-cream-300">
            Real DB Aggregation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* Revenue Stream */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold text-brand-900 border-b pb-2 border-cream-200">
              Revenue Stream
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-cream-100 text-gray-600">
                <span>Gross Merchandise Value (GMV)</span>
                <span className="font-bold text-charcoal-900">₹{(fin.grossSales || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100 text-gray-600">
                <span>Promotional Discounts Applied</span>
                <span className="font-bold text-amber-700">-₹{(fin.discounts || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100 text-gray-600">
                <span>Customer Refunds Issued</span>
                <span className="font-bold text-rose-600">-₹{(fin.refunds || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100 text-gray-600">
                <span>Delivery Fees Collected</span>
                <span className="font-bold text-charcoal-900">₹{(fin.deliveryFeeCollected || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-brand-950 text-sm bg-brand-50/60 p-2 rounded-xl">
                <span>Realized Net Sales (Paid)</span>
                <span className="font-serif text-base text-brand-800">₹{(fin.netSales || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Expenses & Realized Profit */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold text-brand-900 border-b pb-2 border-cream-200">
              Operating Outflow & Profit
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-cream-100 text-gray-600">
                <span>Total Operating Expenses</span>
                <span className="font-bold text-rose-700">₹{(fin.totalExpenses || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100 text-gray-600">
                <span>GST Tax Collected</span>
                <span className="font-bold text-gray-700">₹{(fin.taxCollected || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100 text-gray-600">
                <span>Warehouse Inventory Valuation</span>
                <span className="font-bold text-purple-700">₹{(overview?.inventory?.totalValuation || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sm bg-gold-50 p-2 rounded-xl border border-gold-300">
                <span>Estimated Net Profit</span>
                <span className={`font-serif text-lg ${fin.estimatedProfit >= 0 ? 'text-brand-800' : 'text-rose-600'}`}>
                  ₹{(fin.estimatedProfit || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 border-t border-cream-200 pt-3">
          Note: Net profit is calculated as realized online & COD sales minus recorded procurement, facility, and operational expenditures.
        </p>
      </div>

      {/* Expense Allocation by Category */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card space-y-4">
        <h2 className="font-serif text-lg font-bold text-brand-950">Expense Categorization Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {Object.entries(expCat).map(([category, amount]) => (
            <div key={category} className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-1">
              <span className="capitalize text-gray-500 font-bold text-[10px] uppercase">{category.replace('_', ' ')}</span>
              <div className="font-serif text-base font-bold text-brand-950">
                ₹{Number(amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
