import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import ProductCard from '../../components/customer/ProductCard';
import {
  Sparkles,
  Flame,
  Leaf,
  ShieldCheck,
  ArrowRight,
  Star,
  Award,
  ChevronRight,
  CheckCircle2,
  Package
} from 'lucide-react';

export default function Home() {
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=8'),
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

  return (
    <div className="space-y-16 pb-20">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-cream-50 pt-12 pb-20 border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>100% Slow Roasted • Never Deep Fried</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-950 leading-[1.15] tracking-tight">
                Artisanal Makhana, <br className="hidden sm:inline" />
                <span className="gold-gradient-text">Roasted to Crisp Perfection.</span>
              </h1>

              <p className="text-sm sm:text-base text-charcoal-800 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Directly harvested from the pristine wetlands of Mithila. Screened for jumbo Grade-A kernels, slow-toasted with cold-pressed olive oils, and hand-dusted with gourmet whole spices.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/catalogue"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs tracking-wider uppercase shadow-luxury flex items-center justify-center gap-2 transition"
                >
                  <span>Shop Gourmet Roasts</span>
                  <ArrowRight className="w-4 h-4 text-gold-400" />
                </Link>

                <Link
                  to="/catalogue?category=classic-roasted"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-cream-100 text-brand-900 border border-cream-400 font-bold text-xs tracking-wider uppercase shadow-card transition text-center"
                >
                  Classic Himalayan Salt
                </Link>
              </div>

              {/* Social Proof */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    <span className="w-6 h-6 rounded-full bg-brand-200 border border-white flex items-center justify-center text-[10px] font-bold text-brand-800">VK</span>
                    <span className="w-6 h-6 rounded-full bg-gold-200 border border-white flex items-center justify-center text-[10px] font-bold text-gold-800">PI</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-200 border border-white flex items-center justify-center text-[10px] font-bold text-emerald-800">AR</span>
                  </div>
                  <span className="font-semibold text-charcoal-900">4.9/5 Rating</span>
                  <span className="text-gray-400">(1,200+ Reviews)</span>
                </div>
                <span>•</span>
                <span className="font-semibold text-brand-800">Fresh Nitrogen Packing</span>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80"
                  alt="Zuno Artisanal Makhana Roasted Snack"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-300 bg-white/20 px-2 py-0.5 rounded-full">
                      Zuno Signature
                    </span>
                    <h3 className="font-serif text-xl font-bold">Himalayan Pink Salt</h3>
                    <p className="text-xs text-cream-200">Crispy airy kernels dusted in pure mineral rock salt</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 sm:left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-cream-300 shadow-luxury flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600 font-bold text-lg">
                  10g
                </div>
                <div>
                  <p className="text-[11px] font-bold text-brand-900">Plant Protein</p>
                  <p className="text-[10px] text-gray-500">Per 100g serving</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-cream-300 shadow-card">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-gold-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-brand-950">Slow Roasted</h4>
              <p className="text-[11px] text-gray-500">Zero fried oils or trans fats</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Leaf className="w-6 h-6 text-brand-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-brand-950">Pure Lotus Seeds</h4>
              <p className="text-[11px] text-gray-500">Natural ancient superfood</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-gold-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-brand-950">Non-GMO & Vegan</h4>
              <p className="text-[11px] text-gray-500">Gluten-free clean snack</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-brand-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-brand-950">Free Express Delivery</h4>
              <p className="text-[11px] text-gray-500">On all orders above ₹499</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Curated Flavours</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Explore by Category</h2>
          </div>
          <Link to="/catalogue" className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/catalogue?category=${cat.slug}`}
              className="group p-4 rounded-2xl bg-white border border-cream-300 hover:border-gold-400 hover:shadow-luxury transition-all text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-cream-200 border-2 border-white shadow-sm group-hover:scale-105 transition">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xs font-bold text-brand-900 group-hover:text-brand-700 transition">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Bestsellers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Handcrafted Selection</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Bestselling Gourmet Makhana</h2>
          </div>
          <Link to="/catalogue" className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1">
            <span>Browse Catalogue</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-cream-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner: Welcome Discount */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-cream-100 p-8 sm:p-12 relative overflow-hidden shadow-luxury border border-gold-500/20">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400 bg-white/10 px-3 py-1 rounded-full border border-gold-400/20">
              Welcome Snacker Offer
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Flat ₹50 OFF Your First Order
            </h2>
            <p className="text-xs sm:text-sm text-cream-200 leading-relaxed">
              Experience the crunch of artisanal roasted makhana. Apply coupon code <strong className="text-gold-300 font-mono text-base px-2 py-0.5 rounded bg-white/15 border border-gold-400/40">FIRST50</strong> at checkout on orders above ₹299.
            </p>
            <div className="pt-2">
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 hover:bg-gold-600 text-charcoal-900 font-bold text-xs uppercase tracking-wider transition shadow-lg"
              >
                <span>Claim Offer Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Makhana: Health Superfood Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Nutritional Mastery</span>
          <h2 className="font-serif text-3xl font-bold text-brand-950">Why Switch to Zuno Makhana?</h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Compare the nutritional profile of our slow-roasted fox nuts against conventional deep-fried snacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-brand-900">Zero Trans Fats</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Unlike deep-fried potato chips that soak in 35g of reheated palm oils, Zuno makhana contains under 6g of healthy cold-pressed fats.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-brand-900">High Biological Protein</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Supplying ~9.8g of plant-based protein per 100g, makhana provides sustained satiety without post-snack lethargy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-brand-900">Low Glycemic Index</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Releases energy slowly into the bloodstream, making it a doctor-recommended superfood for mindful weight and sugar management.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
