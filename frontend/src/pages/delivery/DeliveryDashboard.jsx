import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  KeyRound,
  ExternalLink,
  Power,
  Package,
  Navigation,
  X
} from 'lucide-react';

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  const [isOnline, setIsOnline] = useState(user?.deliveryPartnerProfile?.isAvailable ?? true);
  const { success, error: notifyError } = useNotification();

  // Delivery OTP verification modal
  const [completingAssignment, setCompletingAssignment] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Failure modal
  const [failingAssignment, setFailingAssignment] = useState(null);
  const [failReason, setFailReason] = useState('Customer unreachable / premises locked');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/delivery/assignments?status=${activeTab}`);
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [activeTab]);

  const handleToggleAvailability = async () => {
    try {
      const res = await api.post('/delivery/availability');
      setIsOnline(res.data.isAvailable);
      success(res.data.message);
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleStatusUpdate = async (assignmentId, status) => {
    try {
      await api.post(`/delivery/assignments/${assignmentId}/status`, { status });
      success(`Delivery status updated to ${status}`);
      fetchAssignments();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleCompleteDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      notifyError('Please enter the customer 4-digit verification OTP');
      return;
    }

    setVerifying(true);
    try {
      await api.post(`/delivery/assignments/${completingAssignment._id}/status`, {
        status: 'delivered',
        otpCode: otpInput.trim(),
        notes: proofNotes || 'Delivered to recipient'
      });
      success('Delivery completed and confirmed with customer OTP!');
      setCompletingAssignment(null);
      setOtpInput('');
      fetchAssignments();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleFailDeliverySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/delivery/assignments/${failingAssignment._id}/status`, {
        status: 'failed',
        failReason
      });
      success('Delivery marked as failed. Hub operations notified.');
      setFailingAssignment(null);
      fetchAssignments();
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Mobile-First Header */}
      <div className="bg-charcoal-900 text-white p-5 rounded-3xl shadow-luxury space-y-4 border border-gold-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-charcoal-900 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold">Zuno Delivery</h1>
              <p className="text-[11px] text-gray-400">Partner: {user?.name}</p>
            </div>
          </div>

          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              isOnline
                ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                : 'bg-rose-900/60 text-rose-300 border border-rose-500/30'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs">
          <div className="bg-white/5 p-2 rounded-xl">
            <span className="text-[10px] text-gray-400 block">Deliveries</span>
            <span className="font-serif text-base font-bold text-cream-100">
              {user?.deliveryPartnerProfile?.totalDeliveredCount || 84}
            </span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <span className="text-[10px] text-gray-400 block">Driver Rating</span>
            <span className="font-serif text-base font-bold text-gold-400">
              ★ {user?.deliveryPartnerProfile?.rating || '4.9'}
            </span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <span className="text-[10px] text-gray-400 block">Active Jobs</span>
            <span className="font-serif text-base font-bold text-amber-400">
              {assignments.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-300 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'active' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-400'
          }`}
        >
          <Clock className="w-4 h-4" /> Active Jobs ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'completed' ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Completed History
        </button>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-cream-300 text-center space-y-2">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-serif text-base font-bold text-brand-900">No {activeTab} deliveries</h3>
            <p className="text-xs text-gray-500">
              {isOnline
                ? 'Keep your app online to receive automated local orders.'
                : 'You are currently offline. Turn status Online to accept orders.'}
            </p>
          </div>
        ) : (
          assignments.map((asg) => (
            <div
              key={asg._id}
              className="bg-white rounded-3xl border border-cream-300 p-5 shadow-card space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                <div>
                  <span className="font-mono text-sm font-bold text-brand-950">#{asg.orderNumber}</span>
                  <span className="text-[10px] text-gray-400 block">{new Date(asg.createdAt).toLocaleTimeString()}</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-gold-100 text-gold-900 border border-gold-300">
                  {asg.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Hub Pickup Info */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pickup From:</span>
                <div className="p-3 rounded-xl bg-cream-100 border border-cream-300">
                  <p className="font-bold text-brand-950">{asg.pickupAddress?.hubName}</p>
                  <p className="text-gray-600 text-[11px]">{asg.pickupAddress?.address}</p>
                </div>
              </div>

              {/* Customer Delivery Info */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Deliver To:</span>
                <div className="p-3 rounded-xl bg-cream-100 border border-cream-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-brand-950">{asg.deliveryAddress?.fullName}</p>
                    <a
                      href={`tel:${asg.deliveryAddress?.phone}`}
                      className="text-xs font-bold text-brand-700 flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    {asg.deliveryAddress?.addressLine1}, {asg.deliveryAddress?.city} - {asg.deliveryAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Google Maps External Navigation */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${asg.deliveryAddress?.addressLine1}, ${asg.deliveryAddress?.city} ${asg.deliveryAddress?.pincode}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-charcoal-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Navigation className="w-3.5 h-3.5 text-brand-700" />
                <span>Navigate in Google Maps</span>
              </a>

              {/* Workflow Actions */}
              {activeTab === 'active' && (
                <div className="pt-2 border-t border-cream-200 space-y-2">
                  {asg.status === 'assigned' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(asg._id, 'accepted')}
                        className="flex-1 py-2.5 bg-brand-700 text-white rounded-xl text-xs font-bold"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(asg._id, 'rejected')}
                        className="py-2.5 px-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {asg.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusUpdate(asg._id, 'picked_up')}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-charcoal-900 rounded-xl text-xs font-bold"
                    >
                      Confirm Hub Pick Up
                    </button>
                  )}

                  {asg.status === 'picked_up' && (
                    <button
                      onClick={() => handleStatusUpdate(asg._id, 'out_for_delivery')}
                      className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold"
                    >
                      Start Navigation (Out for Delivery)
                    </button>
                  )}

                  {asg.status === 'out_for_delivery' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCompletingAssignment(asg)}
                        className="flex-1 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <KeyRound className="w-4 h-4 text-gold-300" />
                        <span>Deliver (Verify OTP)</span>
                      </button>

                      <button
                        onClick={() => setFailingAssignment(asg)}
                        className="py-3 px-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100"
                      >
                        Fail
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Customer Delivery OTP Verification Modal */}
      {completingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-950">Verify Customer OTP</h3>
              <p className="text-xs text-gray-500">Ask the recipient for their 4-digit verification code</p>
            </div>

            <form onSubmit={handleCompleteDeliverySubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1 text-center">4-Digit Delivery OTP *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 4821"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full p-3 bg-cream-100 border border-cream-300 rounded-xl font-mono text-center text-xl font-bold tracking-widest focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Handover Notes</label>
                <input
                  type="text"
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="e.g. Handed to customer at door"
                  className="w-full p-2 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingAssignment(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold shadow-sm"
                >
                  {verifying ? 'Verifying...' : 'Confirm Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Failure Report Modal */}
      {failingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <h3 className="font-serif text-lg font-bold text-rose-900">Report Delivery Failure</h3>
            <form onSubmit={handleFailDeliverySubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Failure Reason *</label>
                <select
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
                >
                  <option value="Customer unreachable / phone switched off">Customer unreachable / phone switched off</option>
                  <option value="Premises locked / no one to receive">Premises locked / no one to receive</option>
                  <option value="Wrong delivery address / out of zone">Wrong delivery address / out of zone</option>
                  <option value="Customer refused delivery">Customer refused delivery</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFailingAssignment(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
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
