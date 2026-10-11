import React from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ChevronRight } from 'lucide-react';

export default function FloatingCartBar() {
  const { cartItems, cartCount, cartSubtotal, setIsDrawerOpen } = useCart();

  if (cartCount === 0) return null;

  return (
    <aside
      aria-label="Active Cart Summary"
      className="fixed bottom-20 md:bottom-5 left-0 right-0 z-40 px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div className="max-w-xs sm:max-w-sm mx-auto pointer-events-auto">
        {/* Authentic Blinkit Floating Green Pill */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-full bg-[#0C831F] hover:bg-[#0A6C19] text-white rounded-full py-2.5 px-4 shadow-2xl flex items-center justify-between border border-white/25 transition-all hover:scale-102 active:scale-98 group"
          title="Open Shopping Cart"
          aria-label="View Cart"
        >
          {/* Left: Thumbnail & View Cart label */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <ShoppingBag className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div className="text-left flex items-baseline gap-1.5 leading-none">
              <span className="font-black text-sm tracking-tight text-white">
                View cart
              </span>
              <span className="text-white/70 text-[11px] font-bold">
                • {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Right: Subtotal & Chevron */}
          <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-[#FDE047] shrink-0">
            <span>₹{cartSubtotal}</span>
            <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </aside>
  );
}
