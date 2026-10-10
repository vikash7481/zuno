import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Star, ShoppingBag, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAddedAnim, setIsAddedAnim] = useState(false);

  const variants = product.variants || [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {};
  const discountPercent =
    currentVariant.mrp && currentVariant.sellingPrice && currentVariant.mrp > currentVariant.sellingPrice
      ? Math.round(((currentVariant.mrp - currentVariant.sellingPrice) / currentVariant.mrp) * 100)
      : 0;

  const availableStock = currentVariant.availableStock !== undefined ? currentVariant.availableStock : 10;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 15;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, currentVariant, 1);
    setIsAddedAnim(true);
    setTimeout(() => setIsAddedAnim(false), 1200);
  };

  return (
    <div className="group bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-card hover:shadow-luxury hover:border-gold-300 transition-all duration-300 flex flex-col h-full">
      {/* Product Image & Badges */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-cream-200">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-brand-700 text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="absolute top-3 right-3 bg-amber-500 text-charcoal-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Only {availableStock} Left
          </span>
        ) : null}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Flavor Pill & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
              {currentVariant.flavor || product.category?.name || 'Artisanal'}
            </span>
            <div className="flex items-center gap-1 text-gold-600 font-bold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
              <span>{product.averageRating || '4.8'}</span>
              <span className="text-gray-400 font-normal">({product.reviewCount || 20})</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif text-sm font-bold text-brand-950 group-hover:text-brand-700 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Variant Selector Pills */}
          {variants.length > 1 && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {variants.map((v, idx) => (
                <button
                  key={v.sku}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariantIndex(idx);
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition ${
                    selectedVariantIndex === idx
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-cream-100 text-charcoal-800 border-cream-300 hover:border-brand-500'
                  }`}
                >
                  {v.packSize}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-cream-200 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-base font-bold text-brand-900">
                ₹{currentVariant.sellingPrice || 129}
              </span>
              {currentVariant.mrp > currentVariant.sellingPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{currentVariant.mrp}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500">
              Inclusive of GST
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isAddedAnim
                ? 'bg-brand-600 text-white'
                : 'bg-brand-700 hover:bg-brand-800 text-white'
            }`}
          >
            {isAddedAnim ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-gold-300" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
