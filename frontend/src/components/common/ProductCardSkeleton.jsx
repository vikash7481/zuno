import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-cream-300 p-3 flex flex-col justify-between overflow-hidden h-full space-y-3">
      {/* Aspect Square Image Shimmer */}
      <div className="relative aspect-square rounded-xl bg-cream-200/80 overflow-hidden animate-shimmer">
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="h-4 w-12 bg-cream-300 rounded" />
          <div className="h-4 w-16 bg-cream-300 rounded-full" />
        </div>
      </div>

      {/* Info Shimmer */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Dispatch indicator & rating */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-cream-200 rounded animate-shimmer" />
            <div className="h-3 w-8 bg-cream-200 rounded animate-shimmer" />
          </div>

          {/* Title lines */}
          <div className="h-4 w-full bg-cream-200 rounded animate-shimmer" />
          <div className="h-4 w-2/3 bg-cream-200 rounded animate-shimmer" />
        </div>

        {/* Pricing and Button */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-cream-100">
          <div className="space-y-1">
            <div className="h-4 w-14 bg-cream-200 rounded animate-shimmer" />
            <div className="h-2.5 w-10 bg-cream-200 rounded animate-shimmer" />
          </div>
          <div className="h-8 w-20 rounded-xl bg-emerald-700/20 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
