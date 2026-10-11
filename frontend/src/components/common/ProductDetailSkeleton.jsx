import React from 'react';

export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-300">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-12 bg-cream-200 rounded-md animate-shimmer" />
        <div className="h-3 w-3 bg-cream-200 rounded-md" />
        <div className="h-3 w-16 bg-cream-200 rounded-md animate-shimmer" />
        <div className="h-3 w-3 bg-cream-200 rounded-md" />
        <div className="h-3 w-32 bg-cream-200 rounded-md animate-shimmer" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Gallery Column (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Hero Main Image Skeleton */}
          <div className="relative aspect-square rounded-3xl bg-cream-200/80 border border-cream-300 overflow-hidden animate-shimmer">
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="h-5 w-16 bg-cream-300/80 rounded-md" />
              <div className="h-5 w-20 bg-cream-300/80 rounded-full" />
            </div>
          </div>

          {/* Thumbnails Row */}
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-cream-200/70 border border-cream-300 overflow-hidden animate-shimmer"
              />
            ))}
          </div>
        </div>

        {/* Product Info Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand & Rating Badges */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-cream-200 rounded-md animate-shimmer" />
            <div className="h-6 w-20 bg-cream-200 rounded-full animate-shimmer" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 w-4/5 bg-cream-200 rounded-xl animate-shimmer" />
            <div className="h-8 w-3/5 bg-cream-200 rounded-xl animate-shimmer" />
          </div>

          {/* Price Block */}
          <div className="p-4 rounded-2xl bg-cream-100/80 border border-cream-200 space-y-2 animate-shimmer">
            <div className="flex items-baseline gap-3">
              <div className="h-9 w-28 bg-cream-200 rounded-lg" />
              <div className="h-5 w-20 bg-cream-200 rounded-lg" />
              <div className="h-5 w-16 bg-cream-200 rounded-full" />
            </div>
            <div className="h-3 w-40 bg-cream-200 rounded-md" />
          </div>

          {/* Variant Pack Sizes */}
          <div className="space-y-3">
            <div className="h-4 w-32 bg-cream-200 rounded-md animate-shimmer" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((v) => (
                <div
                  key={v}
                  className="h-16 rounded-2xl bg-cream-100 border border-cream-200 p-2.5 space-y-1.5 animate-shimmer"
                >
                  <div className="h-4 w-12 bg-cream-200 rounded" />
                  <div className="h-4 w-16 bg-cream-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <div className="h-12 w-28 rounded-2xl bg-cream-200 animate-shimmer" />
              <div className="h-12 flex-1 rounded-2xl bg-emerald-700/30 animate-shimmer" />
              <div className="h-12 flex-1 rounded-2xl bg-amber-400/30 animate-shimmer" />
            </div>
          </div>

          {/* Pincode Checker Card */}
          <div className="p-4 rounded-2xl bg-cream-100/60 border border-cream-200 flex gap-3 animate-shimmer">
            <div className="h-10 flex-1 bg-cream-200 rounded-xl" />
            <div className="h-10 w-24 bg-cream-200 rounded-xl" />
          </div>

          {/* Feature Badges Row */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[1, 2, 3].map((f) => (
              <div
                key={f}
                className="h-20 rounded-2xl bg-cream-100 border border-cream-200 p-3 space-y-2 animate-shimmer"
              >
                <div className="w-6 h-6 rounded-full bg-cream-200" />
                <div className="h-3 w-16 bg-cream-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="pt-8 border-t border-cream-200 space-y-4">
        <div className="h-6 w-48 bg-cream-200 rounded-lg animate-shimmer" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((c) => (
            <div
              key={c}
              className="p-3 rounded-2xl bg-white border border-cream-300 space-y-3 animate-shimmer"
            >
              <div className="aspect-square bg-cream-200 rounded-xl" />
              <div className="h-4 w-3/4 bg-cream-200 rounded" />
              <div className="h-4 w-1/2 bg-cream-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
