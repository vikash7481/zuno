import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  KeyRound,
  Printer,
  XCircle,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { success, error: notifyError } = useNotification();

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
      notifyError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-900">Order Not Found</h2>
        <Link to="/orders" className="text-xs font-bold text-brand-700 underline">
          View All Orders
        </Link>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Any reserved stock will be automatically returned to our inventory.')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await api.post(`/orders/${order._id}/cancel`, {
        reason: 'Cancelled by customer from order details portal'
      });
      setOrder(res.data.order);
      success('Order cancelled and reserved units returned to stock.');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Status Progression Timeline Steps
  const steps = [
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'packed', label: 'Packed' },
    { key: 'ready_for_dispatch', label: 'Ready' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';
  const isDelivered = order.orderStatus === 'delivered';
  const canCancel = !['picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cream-300 pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Order Tracking & Receipt</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950 flex items-center gap-2">
            <span>Order #{order.orderNumber}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()} • Invoice: {order.invoiceNumber}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-cream-300 hover:bg-cream-100 text-xs font-bold text-brand-900 flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>

          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Live Status Tracker Card */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-700" />
            <h2 className="font-serif text-lg font-bold text-brand-900">Delivery Progression</h2>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              isCancelled
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : isDelivered
                ? 'bg-brand-100 text-brand-800 border border-brand-200'
                : 'bg-gold-100 text-gold-800 border border-gold-300'
            }`}
          >
            Status: {order.orderStatus.replace(/_/g, ' ')}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <strong className="block font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> This order has been cancelled
            </strong>
            <p>Reason: {order.cancellationReason || 'Requested by customer'}</p>
            <p className="text-[11px] text-gray-500">Reserved stock units have been released safely to warehouse inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center justify-between min-w-[500px]">
              {steps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative text-center">
                    {/* Connecting line */}
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-1 -z-0 ${
                          currentStepIndex > idx ? 'bg-brand-600' : 'bg-cream-300'
                        }`}
                      />
                    )}

                    {/* Step Icon Node */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition ${
                        isPassed
                          ? 'bg-brand-700 text-white shadow-sm'
                          : 'bg-cream-200 text-gray-400 border border-cream-300'
                      } ${isCurrent ? 'ring-4 ring-gold-400/50' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <span className="text-[11px] font-semibold text-charcoal-900 mt-2">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery OTP Notice & Assigned Driver Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-cream-200">
          {order.deliveryOtp && !isDelivered && !isCancelled && (
            <div className="p-4 rounded-2xl bg-gold-50 border border-gold-300 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500 text-charcoal-900 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-800">
                  Customer Delivery OTP
                </span>
                <p className="font-mono text-xl font-bold text-brand-950 tracking-wider">
                  {order.deliveryOtp}
                </p>
                <p className="text-[10px] text-gray-500">Share this code with your driver at delivery</p>
              </div>
            </div>
          )}

          {order.deliveryPartner && (
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800">
                  Assigned Delivery Partner
                </span>
                <p className="text-xs font-bold text-brand-950">
                  {order.deliveryPartner.name}
                </p>
                <p className="text-[11px] text-gray-600">
                  Contact: {order.deliveryPartner.phone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Table */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card space-y-4 print:shadow-none print:border-none">
        <h3 className="font-serif text-lg font-bold text-brand-900 border-b border-cream-200 pb-3">
          Itemized Invoice Breakdown
        </h3>

        <div className="divide-y divide-cream-200 text-xs">
          {order.items.map((item) => (
            <div key={item.variantSku} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=100&q=80'}
                  alt={item.productName}
                  className="w-12 h-12 object-cover rounded-xl bg-cream-200 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-brand-950 text-sm">{item.productName}</h4>
                  <p className="text-gray-500">
                    Flavor: {item.flavor} • Pack: {item.packSize} • SKU: {item.variantSku}
                  </p>
                  <p className="text-gray-500">
                    ₹{item.unitPrice} × {item.quantity} units
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-brand-950 text-sm">₹{item.subtotal}</span>
                <span className="block text-[10px] text-gray-400">GST 5% included</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="pt-4 border-t border-cream-200 space-y-2 text-xs max-w-sm ml-auto">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-brand-700 font-bold">
              <span>Discount ({order.couponCode})</span>
              <span>-₹{order.discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
          </div>

          <div className="flex justify-between text-gray-500 text-[11px]">
            <span>Tax (GST)</span>
            <span>₹{order.taxAmount}</span>
          </div>

          <div className="flex justify-between text-base font-bold text-brand-950 pt-2 border-t border-cream-200">
            <span>Total Payable</span>
            <span className="font-serif text-lg">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
