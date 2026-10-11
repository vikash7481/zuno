import React, { useState, useEffect, useRef } from 'react';
import { Tag, Copy, Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../../api/client';

export default function CouponStrip() {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/coupons/active');
        if (res.data?.success && Array.isArray(res.data.coupons) && res.data.coupons.length > 0) {
          setCoupons(res.data.coupons);
        } else {
          // Fallback sample offers if DB has none seeded
          setCoupons([
            { code: 'FEAST100', discountType: 'fixed', discountValue: 100, minOrderValue: 699 },
            { code: 'FIRST50', discountType: 'fixed', discountValue: 50, minOrderValue: 299 },
            { code: 'FESTIVE25', discountType: 'percentage', discountValue: 25, minOrderValue: 299 },
            { code: 'ZUNO10', discountType: 'percentage', discountValue: 10, minOrderValue: 399 }
          ]);
        }
      } catch {
        // Fallback default offers
        setCoupons([
          { code: 'FEAST100', discountType: 'fixed', discountValue: 100, minOrderValue: 699 },
          { code: 'FIRST50', discountType: 'fixed', discountValue: 50, minOrderValue: 299 },
          { code: 'FESTIVE25', discountType: 'percentage', discountValue: 25, minOrderValue: 299 },
          { code: 'ZUNO10', discountType: 'percentage', discountValue: 10, minOrderValue: 399 }
        ]);
      }
    };
    fetchCoupons();
  }, []);

  // Smooth continuous auto-movement ticker
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isPaused || coupons.length === 0) return;

    let animId;
    const step = () => {
      if (!isPaused && el && !isDraggingRef.current) {
        el.scrollLeft += 0.75;
        // Seamless loop when reaching midpoint of duplicated list
        if (el.scrollLeft >= (el.scrollWidth - el.clientWidth) / 2) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, coupons.length]);

  const handleCopy = (code, e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll handlers for desktop mouse interaction
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    setIsPaused(true);
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setTimeout(() => setIsPaused(false), 1500);
  };

  if (!coupons || coupons.length === 0) return null;

  // Duplicate items for continuous seamless loop
  const displayCoupons = coupons.length > 0 ? [...coupons, ...coupons, ...coupons] : coupons;

  return (
    <div
      className="relative bg-black/25 border-t border-white/10 py-1.5 px-2 sm:px-6 select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!isDraggingRef.current) setIsPaused(false);
      }}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {/* Strip Badge */}
        <div className="flex items-center gap-1 shrink-0 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300 pr-1 border-r border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Offers</span>
        </div>

        {/* Left Arrow Button (Always clickable to scroll left) */}
        <button
          onClick={() => scroll('left')}
          className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/15 hover:bg-white/30 text-white shrink-0 transition active:scale-90 border border-white/10 shadow-2xs"
          aria-label="Scroll offers left"
          title="Scroll Left"
        >
          <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>

        {/* Movable Horizontal Carousel Rail (Auto-moving & Draggable) */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-0.5 w-full cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: 'auto' }}
        >
          {displayCoupons.map((coupon, idx) => {
            const isCopied = copiedCode === coupon.code;
            const discountLabel =
              coupon.discountType === 'percentage'
                ? `${coupon.discountValue}% OFF`
                : `₹${coupon.discountValue} OFF`;

            return (
              <div
                key={`${coupon.code}_${idx}`}
                className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-amber-400/35 hover:border-amber-400 rounded-full px-3 py-1 shrink-0 text-white shadow-2xs transition group"
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="font-mono font-black text-xs text-amber-300 tracking-wide">
                    {coupon.code}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-white">
                  {discountLabel}
                </span>

                {coupon.minOrderValue > 0 && (
                  <span className="text-[10px] text-gray-300 hidden md:inline">
                    (above ₹{coupon.minOrderValue})
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => handleCopy(coupon.code, e)}
                  className="flex items-center gap-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-charcoal-950 transition ml-1 shrink-0 active:scale-95 shadow-2xs"
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

        {/* Right Arrow Button (Always clickable to scroll right) */}
        <button
          onClick={() => scroll('right')}
          className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/15 hover:bg-white/30 text-white shrink-0 transition active:scale-90 border border-white/10 shadow-2xs"
          aria-label="Scroll offers right"
          title="Scroll Right"
        >
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
}
