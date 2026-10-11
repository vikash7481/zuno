import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import ProductCard from '../../components/customer/ProductCard';
import FestiveMaaBanner from '../../components/customer/FestiveMaaBanner';
import ProductCardSkeleton from '../../components/common/ProductCardSkeleton';
import { getThemeStyles } from '../../utils/themeStyles';
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
  Award,
  Heart,
  Gift,
  Package,
  Crown
} from 'lucide-react';

export default function Home() {
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFestiveTab, setActiveFestiveTab] = useState('top_picks');
  const [activeTheme, setActiveTheme] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes, themeRes] = await Promise.all([
          api.get('/products?limit=12'),
          api.get('/products/categories'),
          api.get('/themes/active').catch(() => ({ data: {} }))
        ]);
        setBestsellers(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
        if (themeRes.data?.success && themeRes.data.theme) {
          setActiveTheme(themeRes.data.theme);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();

    const handleSync = () => {
      api.get('/themes/active').then((res) => {
        if (res.data?.success && res.data.theme) {
          setActiveTheme(res.data.theme);
        }
      }).catch(() => {});
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('zuno_active_theme_sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('zuno_active_theme_sync', handleSync);
    };
  }, []);

  const themeStyles = getThemeStyles(activeTheme);

  // Blinkit Festive Curated Hub Grid (Matching the user's reference screenshot)
  const festiveCuratedCards = [
    {
      id: 'fasting-flours',
      title: 'Fasting Flours',
      subtitle: 'Starting at ₹29',
      priceTag: '₹65',
      mrpTag: '₹72',
      tagLabel: 'Dhoop & Vrat Pack',
      img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80',
      link: '/products?category=classic-roasted',
      featured: true
    },
    {
      id: 'fasting-essentials',
      title: 'Fasting Essentials',
      subtitle: 'Sendha Namak & Pure Ghee',
      img: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80',
      link: '/products?category=classic-roasted'
    },
    {
      id: 'kids-mela',
      title: 'Kids Mela',
      subtitle: 'Sweet Caramel & Cacao',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
      link: '/products?category=sweet-delights'
    },
    {
      id: 'dandiya-ready',
      title: 'Dandiya Ready',
      subtitle: 'Energy Roasts & Treats',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      link: '/products?category=gourmet-flavoured'
    },
    {
      id: 'kanjak-corner',
      title: 'Kanjak Corner',
      subtitle: 'Gift Boxes & Samplers',
      img: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80',
      link: '/products?category=combos-and-family-packs'
    }
  ];

  // « Festive Picks » Circular Pills Rail
  const festivePillCategories = [
    {
      id: 'top_picks',
      name: 'Top Picks',
      icon: '🎖️',
      isBadge: true,
      categoryQuery: ''
    },
    {
      id: 'vrat_flour',
      name: 'Vrat Flour',
      img: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=120&q=80',
      categoryQuery: 'classic-roasted'
    },
    {
      id: 'flowers_fruits',
      name: 'Flowers & Fruits',
      img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=120&q=80',
      categoryQuery: 'raw-superfood'
    },
    {
      id: 'vrat_snacks',
      name: 'Vrat Snacks',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80',
      categoryQuery: 'classic-roasted'
    },
    {
      id: 'chunri_shringar',
      name: 'Chunri & Shringar',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=120&q=80',
      categoryQuery: 'combos-and-family-packs'
    },
    {
      id: 'khetri_specials',
      name: 'Khetri Specials',
      img: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=120&q=80',
      categoryQuery: 'gourmet-flavoured'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-10 pb-24 bg-[#FFFDF7]">
      {/* 1. Curated Festive Hero Section — Seamlessly matches active theme */}
      <section
        className="px-3 sm:px-6 pt-4 pb-7 rounded-b-3xl shadow-sm overflow-hidden relative transition-colors duration-700"
        style={{ background: themeStyles.homeSectionBg }}
      >
        {/* Dynamic Animated Moving Festive Deity Banner */}
        <FestiveMaaBanner activeThemeProp={activeTheme} />

        {/* 2. Curated Quick-Commerce Festive Grid (Matching Blinkit Cards Layout with matching luxury glassmorphism) */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            {festiveCuratedCards.map((card, idx) => (
              <Link
                key={card.id}
                to={card.link}
                className={`p-3 rounded-2xl ${themeStyles.cardBg} transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden relative group ${
                  idx === 0 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                {/* Header Text */}
                <div className="z-10">
                  <h3 className={`font-sans font-black text-xs sm:text-sm leading-tight ${themeStyles.cardTitleColor}`}>
                    {card.title}
                  </h3>
                  <p className={`text-[11px] font-bold mt-0.5 ${themeStyles.cardSubtitleColor}`}>
                    {card.subtitle}
                  </p>
                </div>

                {/* Price & Tag Pill (if featured) */}
                {card.priceTag && (
                  <div className="my-2 z-10 flex items-center gap-1.5 flex-wrap">
                    <span className="bg-[#DC2626] text-white font-black text-[11px] px-2 py-0.5 rounded-md shadow-2xs">
                      {card.priceTag}
                    </span>
                    {card.mrpTag && (
                      <span className="text-[10px] text-white/60 font-bold line-through">
                        {card.mrpTag}
                      </span>
                    )}
                    {card.tagLabel && (
                      <span className="text-[10px] font-bold text-amber-200/90 block w-full mt-0.5">
                        {card.tagLabel}
                      </span>
                    )}
                  </div>
                )}

                {/* Preview Thumbnail */}
                <div className={`mt-2 w-full h-24 sm:h-28 rounded-xl overflow-hidden ${themeStyles.cardImageBg} p-1 flex items-center justify-center group-hover:scale-102 transition-transform`}>
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. « Festive Picks » Section (Deep Maroon Flourish & Circular Carousel) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        {/* Festive Picks Header with Traditional Diamond Flourishes */}
        <div className="flex items-center justify-center gap-2 pt-2 text-center">
          <span className="text-amber-600 font-bold text-sm">❖</span>
          <span className="h-[1px] w-12 sm:w-20 bg-rose-900/30" />
          <h2 className="font-serif font-black text-xl sm:text-2xl text-[#881337] tracking-tight">
            Festive Picks
          </h2>
          <span className="h-[1px] w-12 sm:w-20 bg-rose-900/30" />
          <span className="text-amber-600 font-bold text-sm">❖</span>
        </div>

        {/* Circular Category Pills Bar */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 px-1">
          {festivePillCategories.map((item) => {
            const isSelected = activeFestiveTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveFestiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1.5 shrink-0 transition-all select-none group min-w-[72px]`}
              >
                {/* Circular Container */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-2 border-[#881337] ring-2 ring-amber-300 shadow-sm bg-amber-50'
                      : 'border border-cream-300 bg-white shadow-2xs group-hover:border-amber-400'
                  }`}
                >
                  {item.isBadge ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-100/70 text-[#881337]">
                      <Award className="w-6 h-6 text-[#991B1B] fill-amber-400" />
                    </div>
                  ) : (
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>

                {/* Title */}
                <span
                  className={`text-[11px] font-black text-center max-w-[76px] leading-tight line-clamp-2 ${
                    isSelected ? 'text-[#881337]' : 'text-charcoal-800'
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Product Rail: Handcrafted Bestsellers & Quick Commerce Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FACC15] flex items-center justify-center text-charcoal-950 font-black shadow-2xs">
              <Zap className="w-4 h-4 fill-charcoal-950" />
            </div>
            <div>
              <h2 className="font-sans font-black text-lg sm:text-2xl text-charcoal-950 tracking-tight flex items-center gap-2">
                <span>Handcrafted Bestsellers</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">100% Sendha Namak & artisan slow-roasted makhana</p>
            </div>
          </div>

          <Link
            to="/products"
            className="text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <ProductCardSkeleton key={n} />
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

      {/* 5. Quick Value & Fresh Roasting Assurances (Blinkit / Zepto Style) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-white border border-amber-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Zap className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-charcoal-950">29-Min Delivery</h3>
              <p className="text-[11px] text-gray-500 font-medium">Hyper-local dark store dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Flame className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-charcoal-950">Vrat Friendly</h3>
              <p className="text-[11px] text-gray-500 font-medium">Pink Himalayan Rock Salt</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
              <Leaf className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-charcoal-950">Mithila Lotus Grade-A</h3>
              <p className="text-[11px] text-gray-500 font-medium">Jumbo kernels, zero palm oil</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-charcoal-950">FREE Shipping ₹499+</h3>
              <p className="text-[11px] text-gray-500 font-medium">Zero handling or surge fees</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
