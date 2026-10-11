import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Truck, Users, PackageCheck, AlertCircle, Phone, MapPin, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';

export default function BusinessDelivery() {
  const [partners, setPartners] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const { success, error: notifyError } = useNotification();

  const fetchDeliveryData = async () => {
    setLoading(true);
    try {
      const [partnerRes, orderRes] = await Promise.all([
        api.get('/delivery/partners'),
        api.get('/orders?status=ready_for_dispatch')
      ]);
      setPartners(partnerRes.data.partners || []);
      setPendingOrders(orderRes.data.orders || []);
      if (partnerRes.data.partners?.length) {
        setSelectedPartnerId(partnerRes.data.partners[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assigningOrder || !selectedPartnerId) return;

    try {
      await api.post(`/orders/${assigningOrder._id}/assign-delivery`, { partnerId: selectedPartnerId });
      success(`Order #${assigningOrder.orderNumber} successfully assigned!`);
      setAssigningOrder(null);
      fetchDeliveryData();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleAutoAssign = async (orderId) => {
    try {
      const res = await api.post(`/orders/${orderId}/auto-assign`);
      success(`Auto-assigned to ${res.data.partner?.name || 'available partner'}`);
      fetchDeliveryData();
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Delivery Fleet Operations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Dispatch logistics, driver partner workloads, and delivery zones
          </p>
        </div>

        <button
          onClick={fetchDeliveryData}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-cream-300 text-xs font-bold text-charcoal-800 hover:bg-cream-100 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Drivers */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-cream-300 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3">
            <h2 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              <span>Fleet Partners ({partners.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {partners.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No delivery partners registered.</p>
            ) : (
              partners.map((partner) => {
                const profile = partner.deliveryPartnerProfile || {};
                const isOnline = profile.isAvailable;

                return (
                  <div
                    key={partner._id}
                    className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 space-y-2 hover:border-cream-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xs">
                          {partner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-charcoal-900">{partner.name}</p>
                          <p className="text-[10px] text-gray-500">{partner.phone || 'No phone'}</p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 pt-1 border-t border-cream-200/80">
                      <div>
                        Active Load: <strong className="text-charcoal-900">{profile.activeDeliveriesCount || 0} orders</strong>
                      </div>
                      <div>
                        Completed: <strong className="text-charcoal-900">{profile.totalDeliveredCount || 0} drops</strong>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Orders Awaiting Dispatch Assignment */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-cream-300 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3">
            <h2 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <span>Orders Ready For Dispatch ({pendingOrders.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-xs text-charcoal-900">All orders are dispatched</p>
                <p className="text-[11px] text-gray-400">No packages currently pending delivery partner assignment.</p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cream-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-charcoal-900">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                        {order.orderStatus}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-charcoal-800">
                      {order.shippingAddress?.fullName} • {order.shippingAddress?.phone}
                    </p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{order.shippingAddress?.addressLine1}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Amount: ₹{order.totalAmount} ({order.paymentMethod.toUpperCase()}) • {order.items?.length || 0} items
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAutoAssign(order._id)}
                      className="px-3 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-charcoal-900 font-bold text-xs transition"
                    >
                      Auto Assign
                    </button>
                    <button
                      onClick={() => setAssigningOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition shadow-xs"
                    >
                      Manual Assign
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Manual Assign Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-cream-300 shadow-2xl">
            <h3 className="font-serif font-bold text-xl text-charcoal-900">
              Assign Order #{assigningOrder.orderNumber}
            </h3>

            <form onSubmit={handleAssign} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Select Delivery Partner *</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-cream-100 border border-cream-300 rounded-xl font-bold"
                >
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.phone}) — {p.deliveryPartnerProfile?.isAvailable ? 'Online' : 'Offline'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAssigningOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-cream-300 font-bold hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold"
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
