import React from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ArrowRight, Zap, ChevronRight } from 'lucide-react';

export default function FloatingCartBar() {
  const { cartItems, cartCount, cartSubtotal, setIsDrawerOpen } = useCart();

  if (cartCount === 0) return null;

  return (
    <aside
      aria-label="Active Cart Summary"
      className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-full bg-qcGreen-700 hover:bg-qcGreen-800 text-white rounded-2xl p-3.5 shadow-luxury flex items-center justify-between border-2 border-white/20 transition-all hover:scale-[1.01] active:scale-[0.99] group"
        >
          {/* Left: Cart Count & Delivery ETA */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <ShoppingBag className="w-5 h-5 text-qcYellow-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wide">
                  {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
                </span>
                <span className="text-white/60">•</span>
                <span className="font-extrabold text-sm sm:text-base text-qcYellow-300">
                  ₹{cartSubtotal}
                </span>
              </div>
              <p className="text-[11px] text-white/80 flex items-center gap-1 font-semibold">
                <Zap className="w-3 h-3 fill-qcYellow-400 text-qcYellow-400" />
                <span>Express Artisanal Delivery</span>
              </p>
            </div>
          </div>

          {/* Right: View Cart Button */}
          <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition">
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </aside>
  );
}
