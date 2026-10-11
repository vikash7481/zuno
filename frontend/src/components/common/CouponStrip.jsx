import React, { useState, useEffect, useRef } from 'react';
import { Tag, Copy, Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../../api/client';

export default function CouponStrip() {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/coupons/active');
        if (res.data?.success && Array.isArray(res.data.coupons)) {
          setCoupons(res.data.coupons);
        }
      } catch {
        // Quiet fallback - strip stays hidden if no active coupons
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!coupons || coupons.length === 0) return null;

  return (
    <div className="relative bg-amber-500/10 border-y border-amber-500/20 py-1.5 px-3 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Strip Badge */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0 text-[11px] font-black uppercase tracking-wider text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Offers</span>
        </div>

        {/* Carousel controls if > 2 coupons */}
        {coupons.length > 2 && (
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white shrink-0 transition"
            aria-label="Scroll coupons left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Horizontal Container */}
        <div
          ref={scrollRef}
          className={`flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5 w-full ${
            coupons.length <= 2 ? 'justify-center sm:justify-start' : ''
          }`}
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {coupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            const discountLabel =
              coupon.discountType === 'percentage'
                ? `${coupon.discountValue}% OFF`
                : `₹${coupon.discountValue} OFF`;

            return (
              <div
                key={coupon._id || coupon.code}
                className="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-amber-400/30 rounded-full px-3 py-1 shrink-0 text-white shadow-2xs hover:border-amber-400 transition"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span className="font-mono font-black text-xs text-amber-300 tracking-wide">
                    {coupon.code}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-gray-200">
                  {discountLabel}
                </span>

                {coupon.minOrderValue > 0 && (
                  <span className="text-[10px] text-gray-300 hidden lg:inline">
                    (above ₹{coupon.minOrderValue})
                  </span>
                )}

                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="flex items-center gap-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-charcoal-950 transition ml-1"
                  title="Copy coupon code"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-900" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5 text-charcoal-950" /> Copy
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {coupons.length > 2 && (
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white shrink-0 transition"
            aria-label="Scroll coupons right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
