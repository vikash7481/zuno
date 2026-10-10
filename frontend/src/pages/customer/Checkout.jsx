import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  MapPin,
  Lock,
  X
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error: notifyError } = useNotification();

  // Address form
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    landmark: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'razorpay'
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Authoritative server-calculated pricing summary
  const [pricing, setPricing] = useState(null);
  const [calculating, setCalculating] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Razorpay sandbox simulation modal state
  const [razorpayModalData, setRazorpayModalData] = useState(null);

  // Load saved address if user has default
  useEffect(() => {
    if (user?.addresses?.length) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setAddress({
        fullName: def.fullName || user.name,
        phone: def.phone || user.phone,
        addressLine1: def.addressLine1,
        addressLine2: def.addressLine2 || '',
        city: def.city,
        state: def.state,
        pincode: def.pincode,
        landmark: def.landmark || ''
      });
    }
  }, [user]);

  // Validate server-side pricing on mount or coupon change
  useEffect(() => {
    if (cartItems.length === 0) {
      setCalculating(false);
      return;
    }

    const fetchAuthoritativePricing = async () => {
      setCalculating(true);
      try {
        const payload = {
          items: cartItems.map((item) => ({
            productId: item.product._id,
            variantSku: item.variant.sku,
            quantity: item.quantity
          })),
          couponCode: appliedCoupon,
          shippingPincode: address.pincode
        };

        const res = await api.post('/orders/validate-checkout', payload);
        setPricing(res.data.summary);
      } catch (err) {
        console.error('Pricing validation error:', err);
        notifyError(err.message);
      } finally {
        setCalculating(false);
      }
    };

    fetchAuthoritativePricing();
  }, [cartItems, appliedCoupon, address.pincode]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-900">Your Bag is Empty</h2>
        <p className="text-xs text-gray-500">Please add snacks to your cart before proceeding to checkout.</p>
        <Link to="/catalogue" className="inline-block px-6 py-2.5 bg-brand-700 text-white rounded-full text-xs font-bold">
          Explore Products
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        cartTotal: pricing?.subtotal || 0
      });
      setAppliedCoupon(res.data.coupon.code);
      success(`Coupon ${res.data.coupon.code} applied successfully!`);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponCode('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address.fullName || !address.phone || !address.addressLine1 || !address.pincode) {
      notifyError('Please complete all required shipping address fields');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          variantSku: item.variant.sku,
          quantity: item.quantity
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: appliedCoupon
      };

      const res = await api.post('/orders', orderPayload);
      const { order, payment } = res.data;

      // If COD, order is immediately confirmed
      if (paymentMethod === 'cod') {
        clearCart();
        success(`Order #${order.orderNumber} successfully placed!`);
        navigate(`/order-success/${order._id}`);
        return;
      }

      // If Online Razorpay:
      if (paymentMethod === 'razorpay') {
        // Show interactive sandbox checkout modal
        setRazorpayModalData({
          order,
          payment
        });
      }
    } catch (err) {
      notifyError(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Complete simulated Razorpay transaction
  const handleSimulatePaymentSuccess = async () => {
    if (!razorpayModalData) return;
    try {
      const { order, payment } = razorpayModalData;
      const verifyRes = await api.post('/orders/verify-payment', {
        orderId: order._id,
        razorpayOrderId: payment.razorpayOrderId || 'rzp_sim_123',
        razorpayPaymentId: `pay_${Date.now()}_simulated`,
        razorpaySignature: 'mock_sandbox_sig_verified'
      });

      clearCart();
      setRazorpayModalData(null);
      success('Online Payment verified successfully!');
      navigate(`/order-success/${verifyRes.data.order._id}`);
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Secure Checkout</span>
        <h1 className="font-serif text-3xl font-bold text-brand-950">Complete Your Order</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Address & Payment Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <MapPin className="w-5 h-5 text-brand-700" />
              <h2 className="font-serif text-lg font-bold text-brand-900">1. Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-charcoal-800 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="e.g. Priya Iyer"
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-800 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-charcoal-800 block mb-1">Address Line 1 (House, Flat, Street) *</label>
                <input
                  type="text"
                  required
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  placeholder="Flat 402, Lotus Orchid Apartments, MG Road"
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-charcoal-800 block mb-1">Address Line 2 / Landmark (Optional)</label>
                <input
                  type="text"
                  value={address.addressLine2}
                  onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                  placeholder="Near Indiranagar Metro Station"
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-800 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-800 block mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method Selection */}
          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <CreditCard className="w-5 h-5 text-brand-700" />
              <h2 className="font-serif text-lg font-bold text-brand-900">2. Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* COD */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'cod'
                    ? 'border-brand-700 bg-brand-50/60 ring-1 ring-brand-700'
                    : 'border-cream-300 bg-cream-50 hover:border-brand-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-brand-700 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-brand-950">
                    <Banknote className="w-4 h-4 text-brand-700" />
                    <span>Cash on Delivery</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Pay with cash or UPI at the doorstep upon arrival</p>
                </div>
              </label>

              {/* Razorpay Online */}
              <label
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'razorpay'
                    ? 'border-brand-700 bg-brand-50/60 ring-1 ring-brand-700'
                    : 'border-cream-300 bg-cream-50 hover:border-brand-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-brand-700 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-brand-950">
                    <CreditCard className="w-4 h-4 text-gold-600" />
                    <span>Online (UPI / Cards)</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Fast & secure checkout via Razorpay Gateway (Sandbox)</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Authoritative Order Review */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-card space-y-4">
            <h2 className="font-serif text-lg font-bold text-brand-900 border-b border-cream-200 pb-3">
              Order Summary ({cartItems.length} items)
            </h2>

            {/* Items list */}
            <div className="divide-y divide-cream-200 max-h-60 overflow-y-auto pr-1 space-y-2">
              {cartItems.map((item) => (
                <div key={item.variant.sku} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.image || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=100&q=80'}
                      alt={item.product.name}
                      className="w-10 h-10 object-cover rounded-lg bg-cream-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-brand-950 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-gray-500">
                        Qty: {item.quantity} • {item.variant.packSize}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-brand-900 shrink-0">
                    ₹{item.variant.sellingPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-2 border-t border-cream-200">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-brand-800 font-bold">
                    <Tag className="w-4 h-4 text-brand-700" />
                    <span>Coupon '{appliedCoupon}' applied!</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-rose-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. FIRST50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs uppercase bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-charcoal-900 text-white rounded-xl text-xs font-bold hover:bg-black transition"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-cream-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{pricing?.subtotal || 0}</span>
              </div>

              {pricing?.discountAmount > 0 && (
                <div className="flex justify-between text-brand-700 font-semibold">
                  <span>Discount ({appliedCoupon})</span>
                  <span>-₹{pricing.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-brand-700">
                  {pricing?.deliveryFee === 0 ? 'FREE' : `₹${pricing?.deliveryFee || 49}`}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Taxes (GST 5% included)</span>
                <span>₹{pricing?.taxAmount || 0}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-brand-950 pt-2 border-t border-cream-200">
                <span>Payable Amount</span>
                <span className="font-serif text-xl">₹{pricing?.totalAmount || 0}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || calculating}
              className="w-full py-4 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-luxury transition"
            >
              <Lock className="w-4 h-4 text-gold-400" />
              <span>
                {placingOrder
                  ? 'Reserving Stock & Processing...'
                  : paymentMethod === 'cod'
                  ? 'Confirm Order (Cash on Delivery)'
                  : 'Pay Online via Razorpay'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Sandbox Simulator Modal */}
      {razorpayModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gold-300/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-900 to-brand-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gold-500 text-charcoal-900 flex items-center justify-center font-bold text-xs">
                  Z
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold">Zuno Artisanal Roasters</h3>
                  <p className="text-[10px] text-gold-300">Razorpay Payment Gateway (Test Sandbox)</p>
                </div>
              </div>
              <button
                onClick={() => setRazorpayModalData(null)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-center">
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Order Reference</span>
                <p className="font-mono text-sm font-bold text-brand-900">{razorpayModalData.order.orderNumber}</p>
                <div className="font-serif text-3xl font-bold text-brand-950 pt-2">
                  ₹{razorpayModalData.order.totalAmount}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1">
                <strong className="block font-bold">Interactive Sandbox Environment:</strong>
                <p>
                  No real credit card or bank debit will take place. This simulates the authorized Razorpay checkout callback and triggers server-side signature verification.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  <span>Simulate Successful Payment</span>
                </button>

                <button
                  onClick={() => setRazorpayModalData(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel / Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
