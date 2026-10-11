import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Sparkles, Truck } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal, cartCount } = useCart();
  const navigate = useNavigate();

  const freeDeliveryThreshold = 499;
  const deliveryFee = cartSubtotal >= freeDeliveryThreshold ? 0 : 49;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto text-charcoal-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">Your Snack Bag is Empty</h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Discover slow-roasted jumbo fox nuts tossed in cold-pressed virgin olive oil and gourmet spices.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <span>Explore Roasted Makhana</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cream-300">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-gray-500">
            Review your artisanal fox nuts selection before proceeding to checkout
          </p>
        </div>

        <Link
          to="/products"
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free shipping progress */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-charcoal-800">
                <Truck className="w-4 h-4 text-brand-700" />
                {cartSubtotal >= freeDeliveryThreshold ? (
                  <span className="text-emerald-700">You unlocked Free Delivery!</span>
                ) : (
                  <span>Add ₹{freeDeliveryThreshold - cartSubtotal} more for Free Delivery</span>
                )}
              </span>
              <span className="text-gray-500 font-mono text-[11px]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-cream-300 shadow-sm divide-y divide-cream-200 overflow-hidden">
            {cartItems.map((item) => {
              const sku = item.variant?.sku || item.variantSku;
              const name = item.product?.name || item.name;
              const image = item.product?.image || item.image;
              const packSize = item.variant?.packSize || item.packSize;
              const flavor = item.variant?.flavor || item.flavor;
              const price = item.variant?.sellingPrice || item.price;
              const mrp = item.variant?.mrp || item.mrp;

              return (
                <div key={sku} className="p-4 sm:p-5 flex items-center gap-4">
                  <img
                    src={image || 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80'}
                    alt={name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-cream-100 border border-cream-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-xs sm:text-sm text-charcoal-900 truncate">
                      {name}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Pack: {packSize} {flavor ? `• ${flavor}` : ''}
                    </p>
                    <div className="flex items-baseline gap-1.5 sm:hidden">
                      <span className="font-mono font-bold text-xs text-charcoal-900">
                        ₹{price}
                      </span>
                      {mrp > price && (
                        <span className="font-mono text-[10px] text-gray-400 line-through">
                          ₹{mrp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border border-cream-300 rounded-xl bg-cream-50 p-1">
                    <button
                      onClick={() => updateQuantity(sku, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white hover:bg-cream-200 flex items-center justify-center text-charcoal-800 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(sku, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-white hover:bg-cream-200 flex items-center justify-center text-charcoal-800 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right hidden sm:block min-w-[70px]">
                    <p className="font-mono font-black text-sm text-charcoal-900">
                      ₹{price * item.quantity}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      ₹{price} each
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(sku)}
                    className="p-2 text-gray-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-cream-300 shadow-sm p-6 space-y-5">
            <h2 className="font-serif font-bold text-lg text-charcoal-900 pb-3 border-b border-cream-200">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-charcoal-900">₹{cartSubtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="font-mono font-bold text-charcoal-900">
                  {deliveryFee === 0 ? <span className="text-emerald-700">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Taxes (GST 5%)</span>
                <span className="font-mono font-bold text-charcoal-900">
                  ₹{Math.round(cartSubtotal * 0.05)}
                </span>
              </div>

              <div className="pt-3 border-t border-cream-200 flex justify-between text-sm font-bold text-charcoal-900">
                <span>Estimated Total</span>
                <span className="font-mono text-base font-black text-charcoal-950">
                  ₹{cartSubtotal + deliveryFee}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-2 pt-2 border-t border-cream-200 text-[11px] text-gray-500">
              <div className="flex items-center gap-2 text-charcoal-800">
                <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
                <span>100% Secure Checkout with Razorpay & COD</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-800">
                <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Artisanal slow-roasted, vacuum-sealed freshness</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
