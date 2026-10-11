import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Star, Zap, Clock, Plus, Minus } from 'lucide-react';

export default function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const variants = product.variants || [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {};
  const discountPercent =
    currentVariant.mrp && currentVariant.sellingPrice && currentVariant.mrp > currentVariant.sellingPrice
      ? Math.round(((currentVariant.mrp - currentVariant.sellingPrice) / currentVariant.mrp) * 100)
      : 0;

  const availableStock = currentVariant.availableStock !== undefined ? currentVariant.availableStock : 10;
  const isOutOfStock = availableStock <= 0;

  // Check if this specific variant is already in cart
  const inCartItem = cartItems.find((item) => item.variant.sku === currentVariant.sku);
  const cartQuantity = inCartItem ? inCartItem.quantity : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, currentVariant, 1, false);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(currentVariant.sku, cartQuantity + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(currentVariant.sku, cartQuantity - 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-cream-300 hover:border-qcGreen-500 hover:shadow-luxury transition-all duration-300 flex flex-col justify-between overflow-hidden p-3 h-full">
      {/* Top Image Container */}
      <div className="relative block aspect-square rounded-xl overflow-hidden bg-cream-100 mb-2.5">
        <Link to={`/products/${product.slug || product._id}`} className="block w-full h-full">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Floating Quick Commerce Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-charcoal-900 border border-cream-200 text-[10px] font-black flex items-center gap-1 shadow-sm">
            <Zap className="w-2.5 h-2.5 fill-qcYellow-400 text-qcYellow-500" />
            <span>EXPRESS</span>
          </span>
        </div>

        {/* Stock Alert */}
        {isOutOfStock ? (
          <span className="absolute top-2 right-2 bg-charcoal-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
            Sold Out
          </span>
        ) : null}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Fast Delivery & Rating Indicator */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 font-bold text-gray-500 tracking-wide">
              <Clock className="w-3 h-3 text-qcGreen-700" />
              <span>FAST DISPATCH</span>
            </span>
            <div className="flex items-center gap-1 font-bold text-charcoal-800 bg-cream-100 px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
              <span>{product.averageRating || '4.9'}</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.slug || product._id}`} className="block">
            <h3 className="font-sans text-xs sm:text-sm font-bold text-charcoal-950 group-hover:text-qcGreen-700 transition line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Pack Variant Pills (Zepto style) */}
          {variants.length > 1 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {variants.map((v, idx) => (
                <button
                  key={v.sku}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariantIndex(idx);
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition ${
                    selectedVariantIndex === idx
                      ? 'bg-qcPurple-50 text-qcPurple-800 border-qcPurple-600 font-extrabold shadow-xs'
                      : 'bg-white text-gray-600 border-cream-300 hover:border-gray-400'
                  }`}
                >
                  {v.packSize}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price & Zepto-Style Interactive ADD / Stepper Button */}
        <div className="pt-2 border-t border-cream-200/80 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-sm sm:text-base font-extrabold text-charcoal-950">
                ₹{currentVariant.sellingPrice || 129}
              </span>
              {currentVariant.mrp > currentVariant.sellingPrice && (
                <span className="text-[11px] text-gray-400 line-through">
                  ₹{currentVariant.mrp}
                </span>
              )}
            </div>
            <span className="text-[9px] text-gray-500 font-medium block">
              {currentVariant.weightGrams ? `${currentVariant.weightGrams}g` : currentVariant.packSize}
            </span>
          </div>

          {/* Zepto Stepper or ADD Button */}
          {cartQuantity > 0 ? (
            <div className="flex items-center rounded-lg bg-qcGreen-700 text-white shadow-sm overflow-hidden h-8">
              <button
                onClick={handleDecrement}
                className="w-7 h-full hover:bg-qcGreen-800 active:bg-qcGreen-900 transition flex items-center justify-center font-bold"
                title="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-2 font-black text-xs text-white min-w-[20px] text-center">
                {cartQuantity}
              </span>
              <button
                onClick={handleIncrement}
                className="w-7 h-full hover:bg-qcGreen-800 active:bg-qcGreen-900 transition flex items-center justify-center font-bold"
                title="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`h-8 px-4 rounded-lg font-extrabold text-xs tracking-wider transition uppercase flex items-center justify-center gap-1 shadow-xs ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  : 'bg-white hover:bg-qcGreen-700 text-qcGreen-700 hover:text-white border-2 border-qcGreen-700 active:scale-95'
              }`}
            >
              <span>ADD</span>
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
