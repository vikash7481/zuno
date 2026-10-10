import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  KeyRound,
  FileText
} from 'lucide-react';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-900">Order Placed</h2>
        <Link to="/orders" className="text-xs font-bold text-brand-700 underline">
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Success Card */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-luxury p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto text-brand-700">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Order Confirmed</span>
          <h1 className="font-serif text-3xl font-bold text-brand-950">Thank You For Your Order!</h1>
          <p className="text-xs text-gray-500">
            Order Reference: <strong className="font-mono text-brand-900">{order.orderNumber}</strong>
          </p>
        </div>

        {/* Delivery OTP Notice */}
        {order.deliveryOtp && (
          <div className="p-4 rounded-2xl bg-gold-50 border border-gold-300/80 max-w-sm mx-auto space-y-1">
            <span className="text-[11px] font-bold text-gold-800 uppercase tracking-wider flex items-center justify-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Delivery Verification OTP
            </span>
            <div className="font-mono text-2xl font-bold text-charcoal-900 tracking-widest">
              {order.deliveryOtp}
            </div>
            <p className="text-[10px] text-gray-500">Share this code with your delivery partner upon arrival</p>
          </div>
        )}

        {/* Order Details Mini Card */}
        <div className="p-4 rounded-xl bg-cream-100 border border-cream-300 text-left text-xs space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Payment Method:</span>
            <span className="font-bold text-brand-900 uppercase">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Payment Status:</span>
            <span className="font-bold text-brand-700 capitalize">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Total Amount Paid:</span>
            <span className="font-bold text-brand-900">₹{order.totalAmount}</span>
          </div>
          <div className="flex justify-between text-gray-600 pt-1 border-t border-cream-200">
            <span>Delivering To:</span>
            <span className="font-semibold text-charcoal-900 truncate max-w-[200px]">
              {order.shippingAddress.addressLine1}, {order.shippingAddress.city}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            to={`/orders/${order._id}`}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4 text-gold-400" />
            <span>Track Order Status</span>
          </Link>

          <Link
            to="/catalogue"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-cream-200 hover:bg-cream-300 text-brand-900 border border-cream-400 text-xs font-bold transition text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
