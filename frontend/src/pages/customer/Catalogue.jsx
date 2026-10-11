import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import ProductCard from '../../components/customer/ProductCard';
import ProductCardSkeleton from '../../components/common/ProductCardSkeleton';
import { Filter, SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters state from URL params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [selectedFlavor, setSelectedFlavor] = useState('');

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.data.categories || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryParam) params.set('category', categoryParam);
        if (searchParam) params.set('search', searchParam);
        if (sortParam) params.set('sort', sortParam);
        if (selectedFlavor) params.set('flavor', selectedFlavor);
        params.set('page', pageParam);
        params.set('limit', 12);

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch (err) {
        console.error('Failed to load catalogue products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam, searchParam, sortParam, selectedFlavor, pageParam]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // reset page
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const flavorsList = [
    'Himalayan Pink Salt',
    'Spicy Peri Peri',
    'Cream & Garden Onion',
    'Pudina Punch',
    'Jaggery Caramel',
    'Natural Raw'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-gold-600">The Zuno Collection</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-950">Artisanal Roasted Makhana</h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
          Browse our handpicked single-origin fox nuts roasted in cold-pressed virgin oils and tossed in wholesome spice blends.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => updateParam('category', '')}
          className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition ${
            !categoryParam
              ? 'bg-qcPurple-800 text-white shadow-sm'
              : 'bg-white text-charcoal-800 border border-cream-300 hover:border-qcPurple-500'
          }`}
        >
          All Flavours
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => updateParam('category', cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition ${
              categoryParam === cat.slug
                ? 'bg-qcPurple-800 text-white shadow-sm'
                : 'bg-white text-charcoal-800 border border-cream-300 hover:border-qcPurple-500'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search, Flavor Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-cream-300 shadow-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search keywords, pink salt, peri peri..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-qcPurple-700 font-medium"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateParam('search', '');
              }}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {/* Flavor filter dropdown */}
          <select
            value={selectedFlavor}
            onChange={(e) => setSelectedFlavor(e.target.value)}
            className="px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl font-bold text-charcoal-900 focus:outline-none focus:border-qcPurple-700"
          >
            <option value="">All Flavours</option>
            {flavorsList.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortParam}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              updateParam('sort', e.target.value);
            }}
            className="px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl font-bold text-charcoal-900 focus:outline-none focus:border-qcPurple-700"
          >
            <option value="featured">Featured / Bestselling</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <ProductCardSkeleton key={n} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-cream-300 p-8">
          <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto text-gray-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-sans font-black text-xl text-charcoal-950">No products match your criteria</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Try adjusting your search keywords, clear active filters, or explore all categories.
          </p>
          <button
            onClick={() => {
              setSearchInput('');
              setSelectedFlavor('');
              setSearchParams({});
            }}
            className="px-6 py-2.5 rounded-xl bg-qcPurple-700 hover:bg-qcPurple-800 text-white text-xs font-black shadow-sm transition uppercase"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={pageParam <= 1}
            onClick={() => updateParam('page', String(pageParam - 1))}
            className="p-2 rounded-lg border border-cream-300 bg-white disabled:opacity-40 hover:bg-cream-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-brand-900 px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pageParam >= pagination.totalPages}
            onClick={() => updateParam('page', String(pageParam + 1))}
            className="p-2 rounded-lg border border-cream-300 bg-white disabled:opacity-40 hover:bg-cream-100 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
