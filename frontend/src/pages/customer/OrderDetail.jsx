import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
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
  UserCheck,
  Navigation,
  Copy,
  Check,
  MessageSquare,
  Radio,
  Send,
  Sparkles
} from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [telemetry, setTelemetry] = useState({
    speed: 26,
    etaMinutes: 7,
    distanceKm: 2.1,
    lastUpdated: null,
    active: false
  });

  const { success, error: notifyError } = useNotification();

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
      // Fetch initial notifications
      fetchNotifications();
    } catch (err) {
      console.error(err);
      notifyError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/orders/${id}/notifications`);
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (e) {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Connect to Socket.IO for live driver location stream
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socket.emit('join_order_room', id);

    socket.on('driver_location_stream', (data) => {
      setTelemetry({
        speed: data.speed || 24,
        etaMinutes: data.etaMinutes || 6,
        distanceKm: Math.max(0.4, Number((data.etaMinutes * 0.35).toFixed(1))),
        lastUpdated: new Date().toLocaleTimeString(),
        active: true
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleCopyOtp = () => {
    if (order?.deliveryOtp) {
      navigator.clipboard.writeText(order.deliveryOtp);
      setCopiedOtp(true);
      success('Delivery OTP copied to clipboard!');
      setTimeout(() => setCopiedOtp(false), 2500);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      const res = await api.post(`/orders/${id}/resend-otp`);
      success(res.data.message || 'OTP resent via SMS & WhatsApp!');
      if (res.data.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      notifyError(err.message || 'Failed to resend OTP');
    } finally {
      setResendingOtp(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be safely released.')) {
      return;
    }
    setCancelling(true);
    try {
      await api.post(`/orders/${id}/cancel`, {
        reason: 'Customer cancelled from order detail timeline'
      });
      success('Order cancelled successfully. Stock reservation released.');
      fetchOrder();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setCancelling(false);
    }
  };

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
        <Link to="/orders" className="text-sm font-bold text-brand-700 underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
    { key: 'processing', label: 'Artisanal Roasting', icon: Package },
    { key: 'packed', label: 'Vacuum Sealed', icon: ShieldCheck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'confirmed': return 0;
      case 'processing': return 1;
      case 'packed': return 2;
      case 'ready_for_dispatch':
      case 'assigned':
      case 'picked_up':
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';
  const isDelivered = order.orderStatus === 'delivered';
  const isOutForDelivery = ['out_for_delivery', 'picked_up'].includes(order.orderStatus);
  const canCancel = ['confirmed', 'processing', 'packed', 'ready_for_dispatch', 'assigned'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Back breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/orders" className="hover:text-brand-900 font-medium">My Orders</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-brand-950 font-bold">#{order.orderNumber}</span>
      </div>

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
            <div className="flex items-center justify-between min-w-[500px] relative">
              {/* Progress Bar Line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-cream-200 -z-0">
                <div
                  className="h-full bg-brand-700 transition-all duration-500"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative z-10 space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-brand-700 text-white shadow-md'
                          : 'bg-cream-200 text-gray-400 border border-cream-300'
                      } ${isCurrent ? 'ring-4 ring-brand-200 scale-110' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold max-w-[90px] leading-tight ${
                        isPassed ? 'text-brand-950' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live GPS Radar Widget (Active when Out for Delivery) */}
        {(isOutForDelivery || telemetry.active) && !isDelivered && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-charcoal-900 to-brand-950 text-white border border-brand-700/50 shadow-luxury space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Live Dispatch GPS Radar
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                {telemetry.lastUpdated ? `Telemetry synced at ${telemetry.lastUpdated}` : 'Socket.IO Stream Active'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div>
                <span className="text-[10px] uppercase text-gray-400 block">Est. Arrival</span>
                <span className="font-serif text-lg font-bold text-amber-400">
                  {telemetry.etaMinutes} mins
                </span>
              </div>
              <div className="border-x border-white/10">
                <span className="text-[10px] uppercase text-gray-400 block">Rider Distance</span>
                <span className="font-serif text-lg font-bold text-emerald-400">
                  {telemetry.distanceKm} km
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 block">Transit Speed</span>
                <span className="font-serif text-lg font-bold text-white">
                  {telemetry.speed} km/h
                </span>
              </div>
            </div>

            {/* Radar Simulation Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-gray-300">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Dispatch Hub
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  Your Address: {order.shippingAddress?.city}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(90, Math.max(30, 100 - telemetry.etaMinutes * 8))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delivery OTP Notice & Assigned Driver Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-cream-200">
          {order.deliveryOtp && !isDelivered && !isCancelled && (
            <div className="p-4 rounded-2xl bg-gold-50 border border-gold-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500 text-charcoal-900 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-800">
                    Customer Delivery OTP
                  </span>
                  <p className="font-mono text-2xl font-black text-brand-950 tracking-widest">
                    {order.deliveryOtp}
                  </p>
                  <p className="text-[10px] text-gray-500">Share with driver upon package inspection</p>
                </div>
              </div>
              <button
                onClick={handleCopyOtp}
                className="px-3 py-1.5 rounded-xl bg-white border border-gold-300 hover:bg-gold-100 text-xs font-bold text-gold-900 flex items-center gap-1 transition shadow-sm"
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedOtp ? 'Copied' : 'Copy'}
              </button>
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

      {/* Simulated SMS & WhatsApp Live Dispatch History */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="font-serif text-lg font-bold text-brand-900">
              SMS & WhatsApp Notifications
            </h3>
          </div>
          <button
            onClick={handleResendOtp}
            disabled={resendingOtp || isCancelled || isDelivered}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {resendingOtp ? 'Resending...' : 'Resend OTP to Mobile'}
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-4 bg-cream-50 rounded-2xl border border-cream-200">
            Automated SMS & WhatsApp dispatch logs will appear here as your order progresses.
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  msg.channel === 'WHATSAPP'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-cream-100/60 border-cream-300 text-brand-950'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${msg.channel === 'WHATSAPP' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    {msg.channel === 'WHATSAPP' ? 'WhatsApp Template Dispatch' : 'Transactional SMS'}
                  </span>
                  <span className="text-gray-500">
                    {new Date(msg.sentAt).toLocaleTimeString()} • To: {msg.to}
                  </span>
                </div>
                <p className="whitespace-pre-line font-mono text-[11px] bg-white/70 p-2.5 rounded-xl border border-black/5">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )}
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
