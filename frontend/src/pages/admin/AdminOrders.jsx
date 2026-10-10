import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Search, Filter, Truck, CheckCircle2, ChevronRight, UserPlus, Sparkles } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { success, error: notifyError } = useNotification();

  const [availablePartners, setAvailablePartners] = useState([]);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const [ordRes, partRes] = await Promise.all([
        api.get(`/orders?${params.toString()}`),
        api.get('/delivery/partners')
      ]);

      setOrders(ordRes.data.orders || []);
      setAvailablePartners(partRes.data.partners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleAssignPartner = async (e) => {
    e.preventDefault();
    if (!assigningOrder || !selectedPartnerId) return;

    try {
      await api.post(`/orders/${assigningOrder._id}/assign-delivery`, {
        partnerId: selectedPartnerId
      });
      success('Delivery partner successfully assigned!');
      setAssigningOrder(null);
      setSelectedPartnerId('');
      fetchOrders();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleAutoDispatch = async (orderId) => {
    try {
      const res = await api.post(`/orders/${orderId}/auto-assign`);
      if (res.data.success) {
        success('Order automatically assigned to optimal available partner!');
        fetchOrders();
      } else {
        notifyError(res.data.message || 'Auto-dispatch could not find available partner');
      }
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Fulfillment Operations</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Orders Management</h1>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search order ID, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl font-medium text-charcoal-900 focus:outline-none focus:border-brand-600 w-full md:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="ready_for_dispatch">Ready for Dispatch</option>
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-cream-300">
            <tr>
              <th className="py-3 px-4">Order ID & Date</th>
              <th className="py-3 px-4">Customer & City</th>
              <th className="py-3 px-4">Amount & Payment</th>
              <th className="py-3 px-4">Order Status</th>
              <th className="py-3 px-4">Assigned Partner</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {orders.map((ord) => (
              <tr key={ord._id} className="hover:bg-cream-50 transition">
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-brand-900 block text-sm">{ord.orderNumber}</span>
                  <span className="text-[11px] text-gray-500">{new Date(ord.createdAt).toLocaleDateString()}</span>
                </td>

                <td className="py-3 px-4">
                  <p className="font-bold text-charcoal-900">{ord.customerDetails?.name}</p>
                  <p className="text-[11px] text-gray-500">{ord.shippingAddress?.city} ({ord.shippingAddress?.pincode})</p>
                </td>

                <td className="py-3 px-4">
                  <span className="font-bold text-brand-950 block">₹{ord.totalAmount}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500">{ord.paymentMethod} • {ord.paymentStatus}</span>
                </td>

                <td className="py-3 px-4">
                  <select
                    value={ord.orderStatus}
                    onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                    className="p-1 rounded-lg text-xs font-bold border border-cream-300 bg-cream-50 focus:outline-none"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="ready_for_dispatch">Ready for Dispatch</option>
                    <option value="assigned">Assigned</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                <td className="py-3 px-4">
                  {ord.deliveryPartner ? (
                    <span className="font-semibold text-brand-800 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-brand-600" />
                      {ord.deliveryPartner.name}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setAssigningOrder(ord)}
                        className="px-2 py-1 rounded bg-cream-200 hover:bg-cream-300 text-charcoal-800 text-[10px] font-bold"
                      >
                        Manual Assign
                      </button>
                      <button
                        onClick={() => handleAutoDispatch(ord._id)}
                        className="px-2 py-1 rounded bg-gold-500 hover:bg-gold-600 text-charcoal-900 text-[10px] font-bold flex items-center gap-1"
                        title="Auto Assign by Workload & Zone"
                      >
                        <Sparkles className="w-3 h-3" /> Auto
                      </button>
                    </div>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <Link
                    to={`/orders/${ord._id}`}
                    className="text-xs font-bold text-brand-700 hover:text-brand-900 underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Delivery Assignment Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <h3 className="font-serif text-lg font-bold text-brand-950">
              Assign Delivery Partner for #{assigningOrder.orderNumber}
            </h3>

            <p className="text-xs text-gray-500">
              Customer City: {assigningOrder.shippingAddress?.city} • PIN: {assigningOrder.shippingAddress?.pincode}
            </p>

            <form onSubmit={handleAssignPartner} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Select Available Fleet Partner</label>
                <select
                  required
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                >
                  <option value="">-- Choose Partner --</option>
                  {availablePartners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.phone}) — {p.deliveryPartnerProfile?.isAvailable ? '🟢 Online' : '🔴 Offline'} (Active deliveries: {p.deliveryPartnerProfile?.activeDeliveriesCount || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningOrder(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
