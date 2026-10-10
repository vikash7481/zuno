import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Zap, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function CartDrawer() {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal, isDrawerOpen, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();

  const [deliveryTip, setDeliveryTip] = useState(0);

  if (!isDrawerOpen) return null;

  const freeDeliveryThreshold = 499;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));
  const amountNeeded = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const deliveryFee = cartSubtotal >= freeDeliveryThreshold ? 0 : 49;

  // Calculate total savings compared to MRP
  const totalMrp = cartItems.reduce((sum, item) => sum + (item.variant.mrp || item.variant.sellingPrice) * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - cartSubtotal);

  const grandTotal = cartSubtotal + deliveryFee + deliveryTip;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col border-l border-cream-300">
          {/* Zepto-Style Header */}
          <div className="p-4 sm:p-5 border-b border-cream-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-qcYellow-400 flex items-center justify-center text-charcoal-950 font-black shadow-2xs">
                <Zap className="w-5 h-5 fill-charcoal-950" />
              </div>
              <div>
                <h2 className="font-sans font-black text-base text-charcoal-950 leading-tight">
                  Delivery in 10-15 Mins
                </h2>
                <p className="text-[11px] font-bold text-gray-500">
                  Shipment of {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-gray-400 hover:text-charcoal-900 rounded-full hover:bg-cream-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Zepto-Style Free Delivery Progress Indicator */}
          <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-200 text-xs">
            {amountNeeded > 0 ? (
              <div className="space-y-1.5">
                <p className="text-emerald-950 font-bold flex items-center justify-between">
                  <span>Add <strong className="text-emerald-700">₹{amountNeeded}</strong> more for <strong>FREE Delivery</strong></span>
                  <span className="font-extrabold text-[11px] text-emerald-700">{progressPercent}%</span>
                </p>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-emerald-900 font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You’ve unlocked <strong>FREE Delivery</strong> on this order!</span>
              </p>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-cream-50/50">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-cream-200 flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-sans font-black text-lg text-charcoal-950">Your bag is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Craving roasted Himalayan pink salt or fiery peri peri makhana? Add items in seconds!
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/catalogue');
                  }}
                  className="px-6 py-3 rounded-xl bg-qcGreen-700 hover:bg-qcGreen-800 text-white text-xs font-black transition shadow-sm uppercase tracking-wider"
                >
                  Explore 10-Min Snacks
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-cream-200 divide-y divide-cream-100 overflow-hidden shadow-xs">
                  {cartItems.map((item) => (
                    <div
                      key={item.variant.sku}
                      className="p-3.5 flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.product.image || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=200&q=80'}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-xl bg-cream-100 shrink-0 border border-cream-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-charcoal-950 truncate leading-snug">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {item.variant.packSize}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-xs font-black text-charcoal-950">
                            ₹{item.variant.sellingPrice * item.quantity}
                          </span>
                          {item.variant.mrp > item.variant.sellingPrice && (
                            <span className="text-[10px] text-gray-400 line-through">
                              ₹{item.variant.mrp * item.quantity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Zepto-Style Stepper */}
                      <div className="flex items-center rounded-lg bg-qcGreen-700 text-white shadow-xs overflow-hidden h-7 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.variant.sku, item.quantity - 1)}
                          className="w-6 h-full hover:bg-qcGreen-800 active:bg-qcGreen-900 transition flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 font-black text-xs text-white min-w-[18px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant.sku, item.quantity + 1)}
                          className="w-6 h-full hover:bg-qcGreen-800 active:bg-qcGreen-900 transition flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tip Your Delivery Partner (Zepto Style) */}
                <div className="bg-white rounded-2xl border border-cream-200 p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-qcPurple-700" />
                    <span className="text-xs font-black text-charcoal-950">Tip your delivery partner</span>
                  </div>
                  <p className="text-[11px] text-gray-500">100% of the tip goes directly to your rider.</p>
                  <div className="flex items-center gap-2">
                    {[
                      { label: '₹10', val: 10 },
                      { label: '₹20', val: 20 },
                      { label: '₹30', val: 30 },
                      { label: '₹50', val: 50 }
                    ].map((tip) => (
                      <button
                        key={tip.val}
                        onClick={() => setDeliveryTip(deliveryTip === tip.val ? 0 : tip.val)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                          deliveryTip === tip.val
                            ? 'bg-qcPurple-700 text-white border-qcPurple-700 shadow-xs'
                            : 'bg-cream-100 hover:bg-cream-200 text-charcoal-900 border-cream-300'
                        }`}
                      >
                        {tip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Details Breakdown */}
                <div className="bg-white rounded-2xl border border-cream-200 p-4 space-y-2.5 shadow-xs text-xs">
                  <h3 className="font-black text-charcoal-950 uppercase tracking-wider text-[11px]">
                    Bill Summary
                  </h3>
                  <div className="space-y-1.5 text-gray-600 font-medium">
                    <div className="flex justify-between">
                      <span>Item Total</span>
                      <span className="font-bold text-charcoal-950">₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Delivery Fee</span>
                      <span className={deliveryFee === 0 ? 'text-qcGreen-700 font-black' : 'font-bold text-charcoal-950'}>
                        {deliveryFee === 0 ? 'FREE' : '₹49'}
                      </span>
                    </div>
                    {deliveryTip > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Partner Tip</span>
                        <span className="font-bold text-qcPurple-700">₹{deliveryTip}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-charcoal-950 pt-2 border-t border-cream-200">
                      <span>Grand Total</span>
                      <span className="text-base font-black">₹{grandTotal}</span>
                    </div>
                  </div>

                  {totalSavings > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-black text-xs text-emerald-800">
                      🎉 You saved ₹{totalSavings} on this order!
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sticky Checkout Bar */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-cream-200 bg-white shadow-xl">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-qcGreen-700 hover:bg-qcGreen-800 active:scale-[0.99] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between shadow-luxury transition"
              >
                <div className="text-left leading-tight">
                  <span className="text-[10px] text-qcGreen-100 font-bold block">Grand Total</span>
                  <span className="text-sm sm:text-base font-black">₹{grandTotal}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Proceed to Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
