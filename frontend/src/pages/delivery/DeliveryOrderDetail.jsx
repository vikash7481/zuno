import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Truck,
  ArrowLeft,
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Navigation
} from 'lucide-react';

export default function DeliveryOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Delivery OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [proofNotes, setProofNotes] = useState('');

  // Fail Modal
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReason, setFailReason] = useState('Customer unreachable / premises locked');

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      notifyError(err.message || 'Failed to load delivery order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (status, extraData = {}) => {
    setUpdating(true);
    try {
      await api.post(`/delivery/assignments/${order.deliveryAssignment || order._id}/status`, {
        status,
        ...extraData
      });
      success(`Delivery status updated to ${status.replace(/_/g, ' ')}`);
      await fetchOrder();
    } catch (err) {
      notifyError(err.message || 'Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteWithOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      notifyError('Please enter the customer 4-digit verification OTP');
      return;
    }

    setUpdating(true);
    try {
      await api.post(`/delivery/assignments/${order.deliveryAssignment || order._id}/status`, {
        status: 'delivered',
        otpCode: otpInput.trim(),
        notes: proofNotes || 'Delivered to recipient with verified OTP'
      });
      success('Delivery completed and confirmed with customer OTP!');
      setShowOtpModal(false);
      setOtpInput('');
      await fetchOrder();
    } catch (err) {
      notifyError(err.message || 'OTP verification failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleFailDelivery = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.post(`/delivery/assignments/${order.deliveryAssignment || order._id}/status`, {
        status: 'failed',
        failReason
      });
      success('Delivery marked as failed. Inventory return initiated.');
      setShowFailModal(false);
      await fetchOrder();
    } catch (err) {
      notifyError(err.message || 'Failed to report failed delivery');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <h2 className="text-xl font-bold">Delivery Not Found or Unauthorized</h2>
        <p className="text-xs text-slate-400 text-center max-w-sm">
          You are either not assigned to this delivery or the order does not exist.
        </p>
        <Link
          to="/delivery/dashboard"
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
        >
          Back to Fleet Dashboard
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress || {};
  const fullAddressStr = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressStr)}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Mobile Bar */}
      <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700/60 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/delivery/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-400">Order #{order.orderNumber}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Status Hero Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Order State</span>
              <h1 className="text-xl font-bold capitalize text-white flex items-center gap-2 mt-0.5">
                <Truck className="w-5 h-5 text-amber-400" />
                <span>{order.orderStatus.replace(/_/g, ' ')}</span>
              </h1>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Online'}
            </span>
          </div>

          {order.paymentMethod === 'cod' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-300">Collect Cash from Recipient</p>
                <p className="text-[11px] text-slate-400">Exact amount to be received upon handover</p>
              </div>
              <span className="text-base font-bold font-mono text-amber-400">₹{order.grandTotal}</span>
            </div>
          )}
        </div>

        {/* Customer & Address Details */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-400" /> Destination & Recipient
          </h2>

          <div className="space-y-1">
            <p className="text-sm font-bold text-white">{addr.fullName || 'Customer'}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{fullAddressStr}</p>
            {addr.landmark && (
              <p className="text-xs text-amber-400/90 font-medium">Landmark: {addr.landmark}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={`tel:${addr.phone}`}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white flex items-center justify-center gap-2 border border-slate-600 transition"
            >
              <Phone className="w-4 h-4 text-emerald-400" /> Call Customer
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 flex items-center justify-center gap-2 border border-amber-500/40 transition"
            >
              <Navigation className="w-4 h-4 text-amber-400" /> Open Maps
            </a>
          </div>
        </div>

        {/* Items Summary */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-sky-400" /> Package Contents ({order.items?.length || 0} items)
          </h2>

          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-2 border-b border-slate-700/60 last:border-none"
              >
                <div>
                  <span className="font-semibold text-white">{item.productName}</span>
                  <span className="text-slate-400 ml-2">({item.packSize})</span>
                </div>
                <span className="font-mono text-slate-300">Qty: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Action Controls */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">Fulfillment Actions</h2>

          {order.orderStatus === 'assigned' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleUpdateStatus('accepted')}
                disabled={updating}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept Delivery
              </button>
              <button
                onClick={() => handleUpdateStatus('rejected')}
                disabled={updating}
                className="py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                Reject Task
              </button>
            </div>
          )}

          {['accepted', 'packed', 'ready_for_dispatch'].includes(order.orderStatus) && (
            <button
              onClick={() => handleUpdateStatus('picked_up')}
              disabled={updating}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Package className="w-4 h-4" /> Confirm Hub Pickup
            </button>
          )}

          {order.orderStatus === 'picked_up' && (
            <button
              onClick={() => handleUpdateStatus('out_for_delivery')}
              disabled={updating}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Truck className="w-4 h-4" /> Start Out For Delivery
            </button>
          )}

          {order.orderStatus === 'out_for_delivery' && (
            <div className="space-y-2.5">
              <button
                onClick={() => setShowOtpModal(true)}
                disabled={updating}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                <KeyRound className="w-4 h-4" /> Verify Customer OTP & Hand Over
              </button>

              <button
                onClick={() => setShowFailModal(true)}
                disabled={updating}
                className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                Report Delivery Failure
              </button>
            </div>
          )}

          {order.orderStatus === 'delivered' && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Successfully Delivered</p>
                <p className="text-[11px] text-slate-400">Customer OTP verified and proof recorded.</p>
              </div>
            </div>
          )}

          {order.orderStatus === 'failed' && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Delivery Failed</p>
                <p className="text-[11px] text-slate-400">Order returned to fulfillment centre.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Enter Customer OTP</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask the recipient for the 4-digit verification code shown on their order tracking screen.
            </p>
            <form onSubmit={handleCompleteWithOtp} className="space-y-3">
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="4-digit OTP"
                className="w-full text-center tracking-widest text-2xl font-mono py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <input
                type="text"
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                placeholder="Proof notes (e.g., Handed to security / customer)"
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fail Modal */}
      {showFailModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">Report Delivery Failure</h3>
            </div>
            <form onSubmit={handleFailDelivery} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Reason for Failure</label>
                <select
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Customer unreachable / phone switched off">Customer unreachable / phone switched off</option>
                  <option value="Premises locked / no one to accept">Premises locked / no one to accept</option>
                  <option value="Customer refused order handover">Customer refused order handover</option>
                  <option value="Incorrect or untraceable address">Incorrect or untraceable address</option>
                  <option value="Severe weather / impassable road">Severe weather / impassable road</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFailModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Submit Failure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
