import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/customer/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export default function Wishlist() {
  const { user } = useAuth();
  const wishlistProducts = user?.wishlist || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Your Saved Snacks</span>
        <h1 className="font-serif text-3xl font-bold text-brand-950">Wishlist ({wishlistProducts.length})</h1>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-cream-300 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto text-gray-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-950">Your Wishlist is Empty</h3>
          <p className="text-xs text-gray-500">
            Save your favourite roasted makhana flavours to easily reorder them whenever cravings hit.
          </p>
          <Link
            to="/catalogue"
            className="inline-block px-6 py-2.5 rounded-full bg-brand-700 text-white text-xs font-bold shadow-sm"
          >
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((p) => (
            <ProductCard key={p._id || p} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
