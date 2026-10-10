import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  IndianRupee,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  Receipt,
  Boxes,
  ArrowUpRight,
  Plus,
  Truck,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  const fetchDashboardData = async () => {
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

      const [repRes, ordRes] = await Promise.all([
        api.get(`/reports/overview?${params.toString()}`),
        api.get('/orders?limit=6')
      ]);

      setOverview(repRes.data.overview);
      setRecentOrders(ordRes.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  if (loading && !overview) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const financials = overview?.financials || {};
  const ordersSummary = overview?.orders || {};
  const inventorySummary = overview?.inventory || {};

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Executive Overview</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Zuno Business Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Authoritative real-time data calculated directly from MongoDB records</p>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-white border border-cream-300 rounded-xl font-medium text-charcoal-900 shadow-sm focus:outline-none focus:border-brand-600"
          >
            <option value="">All Time Records</option>
            <option value="today">Today Only</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl bg-white border border-cream-300 hover:bg-cream-100 text-gray-600 shadow-sm transition"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Sales */}
        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Realized Net Sales</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-brand-950">
              ₹{(financials.netSales || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Gross: ₹{(financials.grossSales || 0).toLocaleString()} • Tax: ₹{(financials.taxCollected || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Estimated Profit */}
        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Profit</span>
            <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`font-serif text-2xl font-bold ${financials.estimatedProfit >= 0 ? 'text-brand-700' : 'text-rose-600'}`}>
              ₹{(financials.estimatedProfit || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Net Sales minus operating expenses
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-brand-950">
              {ordersSummary.totalOrdersCount || 0}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {ordersSummary.paidOrdersCount || 0} Paid • {(ordersSummary.byStatus?.delivered || 0)} Delivered
            </p>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory Valuation</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-brand-950">
              ₹{(inventorySummary.totalValuation || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {inventorySummary.lowStockCount > 0 ? (
                <span className="text-amber-600 font-bold">{inventorySummary.lowStockCount} SKUs Low Stock</span>
              ) : (
                <span className="text-brand-700 font-bold">All Stock Levels Healthy</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">Quick Actions:</span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/products"
            className="px-3.5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </Link>

          <Link
            to="/admin/inventory"
            className="px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-brand-900 border border-cream-300 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Boxes className="w-3.5 h-3.5 text-brand-700" /> Stock Adjustment
          </Link>

          <Link
            to="/admin/production"
            className="px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-brand-900 border border-cream-300 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-brand-700" /> Plan Production Batch
          </Link>

          <Link
            to="/admin/expenses"
            className="px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-brand-900 border border-cream-300 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Receipt className="w-3.5 h-3.5 text-brand-700" /> Record Expense
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-brand-950">Recent Customer Orders</h2>
          <Link to="/admin/orders" className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1">
            <span>View All Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-gray-500 uppercase tracking-wider font-semibold border-y border-cream-300">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {recentOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-cream-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-brand-900">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-charcoal-900">{ord.customerDetails?.name}</p>
                    <p className="text-[11px] text-gray-500">{ord.shippingAddress?.city}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {ord.items?.length} items
                  </td>
                  <td className="py-3 px-4 font-bold text-brand-950">
                    ₹{ord.totalAmount}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.paymentStatus === 'paid'
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.orderStatus === 'delivered'
                          ? 'bg-brand-100 text-brand-800'
                          : ord.orderStatus === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-gold-100 text-gold-800'
                      }`}
                    >
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/admin/orders/${ord._id}`}
                      className="text-xs font-bold text-brand-700 hover:text-brand-900 underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
