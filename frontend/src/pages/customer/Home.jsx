import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import ProductCard from '../../components/customer/ProductCard';
import {
  Zap,
  Flame,
  Leaf,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Clock,
  Tag,
  Percent,
  TrendingUp,
  Award
} from 'lucide-react';

export default function Home() {
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=12'),
          api.get('/products/categories')
        ]);
        setBestsellers(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const promoBanners = [
    {
      id: 1,
      badge: '⚡ EXPRESS DISPATCH',
      title: 'Craving Artisanal Crunch?',
      subtitle: 'Slow-roasted jumbo fox nuts tossed in cold-pressed virgin olive oil.',
      cta: 'Shop Fresh Roasts',
      link: '/products',
      bgGradient: 'from-qcPurple-900 via-qcPurple-800 to-brand-800',
      badgeBg: 'bg-qcYellow-400 text-charcoal-950'
    },
    {
      id: 2,
      badge: '🎉 SPECIAL OFFER',
      title: 'Flat ₹50 OFF Your First Snack',
      subtitle: 'Apply code ZUNO50 at checkout on orders above ₹299.',
      cta: 'Use Code ZUNO50',
      link: '/products',
      bgGradient: 'from-brand-800 via-qcGreen-800 to-qcGreen-700',
      badgeBg: 'bg-white text-qcGreen-800'
    }
  ];

  const categoryPastels = [
    { bg: 'bg-emerald-50 hover:bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-900' },
    { bg: 'bg-rose-50 hover:bg-rose-100', border: 'border-rose-200', text: 'text-rose-900' },
    { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200', text: 'text-amber-900' },
    { bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-200', text: 'text-purple-900' },
    { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200', text: 'text-blue-900' }
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-24">
      {/* Zepto-Style Promotional Banners Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promoBanners.map((banner) => (
            <div
              key={banner.id}
              className={`relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r ${banner.bgGradient} text-white overflow-hidden shadow-card flex flex-col justify-between min-h-[190px]`}
            >
              <div className="relative z-10 space-y-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase shadow-2xs ${banner.badgeBg}`}>
                  {banner.badge}
                </span>
                <h2 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                  {banner.title}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 max-w-sm">
                  {banner.subtitle}
                </p>
              </div>

              <div className="relative z-10 pt-4">
                <Link
                  to={banner.link}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-charcoal-950 font-black text-xs hover:bg-qcYellow-400 transition shadow-sm group"
                >
                  <span>{banner.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Background ambient glow circle */}
              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            </div>
          ))}
        </div>
      </section>

      {/* Zepto-Style "Explore By Category" Squircle Rail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-sans font-black text-lg sm:text-2xl text-charcoal-950 tracking-tight flex items-center gap-2">
              <span>Explore Categories</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">Handcrafted single-origin lotus seeds</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-black text-qcPurple-700 hover:text-qcPurple-900 flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat, idx) => {
            const pastel = categoryPastels[idx % categoryPastels.length];
            return (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                className={`p-4 rounded-2xl border ${pastel.bg} ${pastel.border} transition-all duration-200 hover:-translate-y-1 hover:shadow-card text-center flex flex-col items-center justify-between space-y-2 group`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white shadow-sm p-1 border border-cream-200 group-hover:scale-105 transition-transform">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className={`font-sans font-extrabold text-xs sm:text-sm ${pastel.text} leading-tight`}>
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-500 mt-0.5 block">
                    ⚡ Express
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Product Rail: Handcrafted Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-qcYellow-400 flex items-center justify-center text-charcoal-950 font-black shadow-2xs">
              <Zap className="w-4 h-4 fill-charcoal-950" />
            </div>
            <div>
              <h2 className="font-sans font-black text-lg sm:text-2xl text-charcoal-950 tracking-tight flex items-center gap-2">
                <span>Handcrafted Bestsellers</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">Bestselling roasts freshly packed from our dark store</p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-xs font-black text-qcPurple-700 hover:text-qcPurple-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-cream-200/70 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {bestsellers.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Value & Quality Guarantees Bar (Zepto Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-5 sm:p-6 rounded-3xl bg-cream-50 border border-cream-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-qcYellow-100 flex items-center justify-center text-qcYellow-700 shrink-0">
              <Zap className="w-5 h-5 fill-qcYellow-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-charcoal-950">10-Min Delivery</h3>
              <p className="text-[11px] text-gray-500 font-medium">Instant hyper-local dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Flame className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-charcoal-950">Slow Roasted</h3>
              <p className="text-[11px] text-gray-500 font-medium">0% deep fried or palm oils</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
              <Leaf className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-charcoal-950">Pure Mithila Lotus</h3>
              <p className="text-[11px] text-gray-500 font-medium">Single-origin jumbo kernels</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-charcoal-950">FREE Shipping ₹499+</h3>
              <p className="text-[11px] text-gray-500 font-medium">No hidden handling fees</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
