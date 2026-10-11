import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  Search,
  User,
  Heart,
  ChevronDown,
  LogOut,
  PackageCheck,
  Shield,
  Truck,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  ArrowRight,
  Palette
} from 'lucide-react';
import DeliveryLocationModal from './DeliveryLocationModal';
import FestiveHeaderBackground from './FestiveHeaderBackground';
import CouponStrip from './CouponStrip';
import api from '../../api/client';

export default function Navbar() {
  const { user, isAuthenticated, logout, isRole } = useAuth();
  const { cartCount, cartSubtotal, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('zuno_delivery_location') || 'Bengaluru - 560001';
  });

  // Dynamic Theme State
  const [activeTheme, setActiveTheme] = useState(null);

  // Dynamic Categories from Backend
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const [themeRes, catRes] = await Promise.allSettled([
          api.get('/themes/active'),
          api.get('/products/categories')
        ]);

        if (themeRes.status === 'fulfilled' && themeRes.value.data?.success) {
          setActiveTheme(themeRes.value.data.theme);
        }

        if (catRes.status === 'fulfilled' && catRes.value.data?.categories) {
          setCategories(catRes.value.data.categories);
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchHeaderData();

    // Poll every 60s for scheduled theme transitions
    const timer = setInterval(fetchHeaderData, 60000);

    const handleStorageChange = (e) => {
      if (e.key === 'zuno_active_theme_sync') {
        fetchHeaderData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Animated search placeholder rotation
  const searchPlaceholders = [
    'Search makhana, flavours & combos',
    'Search Himalayan Pink Salt...',
    'Search Spicy Peri Peri...',
    'Search Jaggery Caramel Makhana...',
    'Search Raw Jumbo Kernels...'
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [searchPlaceholders.length]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Build categories list (Real DB categories or fallback)
  const navCategories = [
    { name: 'All Makhana', path: '/products' },
    ...(categories.length > 0
      ? categories.map((c) => ({
          name: c.name,
          path: `/products?category=${c.slug}`
        }))
      : [
          { name: 'Classic Roasted', path: '/products?category=classic-roasted' },
          { name: 'Gourmet Spiced', path: '/products?category=gourmet-flavoured' },
          { name: 'Sweet Delights', path: '/products?category=sweet-delights' },
          { name: 'Raw Superfood', path: '/products?category=raw-superfood' },
          { name: 'Family Combos', path: '/products?category=combos-and-family-packs' }
        ])
  ];

  // Delivery promise display (admin-configured or active theme)
  const deliveryETA = activeTheme?.deliveryPillTime || 'Express Dispatch';
  const deliveryBadge = activeTheme?.deliveryPillBadge || 'Instant Dispatch';

  return (
    <>
      <header className="sticky top-0 z-40 transition-all border-b border-white/10 shadow-md">
        <FestiveHeaderBackground theme={activeTheme}>
          {/* Optional Festive Greeting / Announcement Bar */}
          {activeTheme?.greeting && (
            <div className="bg-black/45 backdrop-blur-md border-b border-white/10 text-white text-[11px] py-1 px-3 text-center">
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-amber-300">
                  {activeTheme.badgeText || 'Festive Special'}
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="font-medium text-white/95 truncate max-w-[240px] sm:max-w-none">
                  {activeTheme.greeting}
                </span>
                {activeTheme.ctaText && (
                  <Link
                    to={activeTheme.ctaLink || '/products'}
                    className="inline-flex items-center gap-0.5 font-black text-amber-300 hover:text-amber-200 underline underline-offset-2 ml-1"
                  >
                    <span>{activeTheme.ctaText}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Main Mobile-First Navigation Block */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2">
            {/* Top Row: Logo, Location Picker, and Shopping Actions */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Left: Brand Logo & Delivery ETA Pill */}
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <Link to="/" className="flex items-center gap-2 shrink-0 group">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-qcPurple-800/90 backdrop-blur-md flex items-center justify-center text-qcYellow-400 shadow-md border border-qcPurple-500/50 group-hover:scale-105 transition shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-qcYellow-400" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-sans font-black text-xl sm:text-2xl tracking-tight text-white drop-shadow-sm">
                      Zuno
                    </span>
                    <span className="text-[9px] uppercase font-black tracking-widest text-emerald-300 mt-0.5">
                      Artisanal
                    </span>
                  </div>
                </Link>

                {/* Delivery Location & ETA Pill (Zepto Style) */}
                <div className="flex flex-col text-left pl-2 sm:pl-3 border-l border-white/20 min-w-0">
                  <div className="flex items-center gap-1 font-black text-[10px] sm:text-xs text-white leading-none">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-charcoal-950 font-black text-[9px] shadow-2xs shrink-0">
                      <Zap className="w-2 h-2 fill-charcoal-950" /> {deliveryBadge}
                    </span>
                    <span className="text-[10px] font-bold text-gray-200 hidden xs:inline truncate">
                      {deliveryETA}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-[11px] sm:text-xs font-black text-white/95 flex items-center gap-0.5 hover:text-amber-300 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[240px] mt-0.5"
                    aria-label="Change delivery location"
                  >
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{selectedLocation}</span>
                    <ChevronDown className="w-3 h-3 text-gray-300 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Right: Profile, Wishlist and Cart Action */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                {/* Wishlist Link (Tablet/Desktop) */}
                {isAuthenticated && (
                  <Link
                    to="/wishlist"
                    className="p-2 text-white hover:text-amber-300 hover:bg-white/10 rounded-xl transition relative hidden sm:flex"
                    title="Wishlist"
                  >
                    <Heart className="w-4 h-4" />
                  </Link>
                )}

                {/* Profile Button */}
                <div className="relative">
                  {isAuthenticated ? (
                    <div>
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition backdrop-blur-sm h-9 min-w-[36px]"
                        aria-label="User Account"
                      >
                        <User className="w-4 h-4 text-amber-300" />
                        <span className="hidden md:inline max-w-[70px] truncate">
                          {user.name.split(' ')[0]}
                        </span>
                        <ChevronDown className="w-3 h-3 text-gray-300 hidden sm:inline" />
                      </button>

                      {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-luxury border border-cream-300 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="px-4 py-2 border-b border-cream-200">
                            <p className="text-xs font-bold text-brand-900 truncate">{user.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-qcPurple-50 text-qcPurple-800 border border-qcPurple-200">
                              {user.role.replace('_', ' ')}
                            </span>
                          </div>

                          <Link
                            to="/account"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-800 hover:bg-cream-100 transition"
                          >
                            <User className="w-4 h-4" /> My Profile & Addresses
                          </Link>

                          <Link
                            to="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-800 hover:bg-cream-100 transition"
                          >
                            <PackageCheck className="w-4 h-4" /> My Orders & Invoices
                          </Link>

                          {isRole(['admin', 'super_admin']) && (
                            <>
                              <Link
                                to="/business/dashboard"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition"
                              >
                                <Shield className="w-4 h-4 text-emerald-700" /> Zuno Business Admin
                              </Link>
                              <Link
                                to="/business/themes"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 transition"
                              >
                                <Palette className="w-4 h-4 text-purple-700" /> Theme Studio ✨
                              </Link>
                            </>
                          )}

                          {isRole(['delivery_partner']) && (
                            <Link
                              to="/delivery/dashboard"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                            >
                              <Truck className="w-4 h-4 text-amber-700" /> Zuno Delivery Partner
                            </Link>
                          )}

                          <div className="border-t border-cream-200 mt-1 pt-1">
                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                logout();
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left"
                            >
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition backdrop-blur-sm h-9"
                    >
                      <User className="w-3.5 h-3.5 text-amber-300" />
                      <span className="hidden sm:inline">Login</span>
                    </Link>
                  )}
                </div>

                {/* Zepto Cart Button Pill */}
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:px-3.5 rounded-xl bg-qcGreen-700 hover:bg-qcGreen-800 text-white font-extrabold shadow-md transition active:scale-95 border border-qcGreen-500/40 h-9"
                  aria-label="View Cart"
                >
                  <ShoppingBag className="w-4 h-4 text-qcYellow-300 shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[9px] uppercase font-bold text-qcGreen-100">
                      {cartCount} {cartCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-xs font-black text-white">₹{cartSubtotal}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Row 2: Full-Width Quick-Commerce Search Bar */}
            <div className="w-full">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder={searchPlaceholders[placeholderIndex]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-md focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-300/40 transition-all text-charcoal-950 placeholder-gray-500 font-semibold h-11"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5 pointer-events-none" />
              </form>
            </div>
          </div>

          {/* Row 3: Horizontally Scrollable Category Rail (Zepto Style) */}
          <div className="bg-black/35 backdrop-blur-md border-t border-white/10 px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
            <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 shrink-0">
              {navCategories.map((cat) => {
                const isActive = location.pathname + location.search === cat.path;
                return (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-charcoal-950 shadow-sm font-black'
                        : 'text-white/90 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Row 4: Horizontal Promotional Coupon Strip */}
          <CouponStrip />
        </FestiveHeaderBackground>
      </header>

      {/* Real Delivery Location Modal */}
      <DeliveryLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={selectedLocation}
        onLocationSelect={(newLoc, addressDetails) => {
          setSelectedLocation(newLoc);
          localStorage.setItem('zuno_delivery_location', newLoc);
          if (addressDetails) {
            localStorage.setItem('zuno_delivery_address', JSON.stringify(addressDetails));
          }
        }}
      />
    </>
  );
}
