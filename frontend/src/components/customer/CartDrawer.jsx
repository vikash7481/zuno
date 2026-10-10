import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export default function CartDrawer() {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal, isDrawerOpen, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const freeDeliveryThreshold = 499;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));
  const amountNeeded = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-cream-100 shadow-2xl flex flex-col border-l border-cream-300">
          {/* Header */}
          <div className="p-5 border-b border-cream-300 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-700">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-lg font-bold text-brand-900">Your Snacking Bag</h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-cream-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-brand-50 px-5 py-3 border-b border-brand-200 text-xs">
            {amountNeeded > 0 ? (
              <div className="space-y-1.5">
                <p className="text-brand-900 font-medium flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-700 shrink-0" />
                  Add <strong className="text-brand-700">₹{amountNeeded}</strong> more for <strong>FREE Delivery</strong>!
                </p>
                <div className="w-full bg-brand-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-brand-800 font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-700 shrink-0" />
                Congratulations! You’ve unlocked <strong>FREE Delivery</strong> on this order.
              </p>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal-900">Your bag is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Slow-roasted Himalayan pink salt, peri peri, and dark chocolate snacks await you.
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/catalogue');
                  }}
                  className="px-5 py-2.5 rounded-full bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition shadow-sm"
                >
                  Explore Flavours
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.variant.sku}
                  className="flex gap-3.5 bg-white p-3.5 rounded-2xl border border-cream-300 shadow-sm items-center"
                >
                  <img
                    src={item.product.image || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=200&q=80'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-xl bg-cream-200 shrink-0 border border-cream-300"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-brand-900 truncate">{item.product.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {item.variant.flavor} • {item.variant.packSize}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold text-brand-800">
                        ₹{item.variant.sellingPrice * item.quantity}
                      </span>
                      {item.variant.mrp > item.variant.sellingPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{item.variant.mrp * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.variant.sku)}
                      className="text-gray-400 hover:text-rose-600 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center border border-cream-400 rounded-lg bg-cream-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.variant.sku, item.quantity - 1)}
                        className="p-1 hover:bg-cream-200 text-gray-600 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-brand-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant.sku, item.quantity + 1)}
                        className="p-1 hover:bg-cream-200 text-gray-600 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-cream-300 bg-white space-y-3.5 shadow-lg">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal-900">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-brand-700">
                    {cartSubtotal >= freeDeliveryThreshold ? 'FREE' : '₹49'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-brand-900 pt-2 border-t border-cream-200">
                  <span>Estimated Total</span>
                  <span className="text-base font-serif">
                    ₹{cartSubtotal + (cartSubtotal >= freeDeliveryThreshold ? 0 : 49)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
