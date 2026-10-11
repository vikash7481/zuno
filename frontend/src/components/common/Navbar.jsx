import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  Search,
  User,
  Heart,
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('zuno_delivery_location') || 'Bengaluru - 560001';
  });

  // Active Festive Theme State (Authoritative Server Source of Truth)
  const [activeTheme, setActiveTheme] = useState(null);

  useEffect(() => {
    const fetchActiveTheme = async () => {
      try {
        const res = await api.get('/themes/active');
        if (res.data?.success && res.data.theme) {
          setActiveTheme(res.data.theme);
        }
      } catch {
        // Fallback default
      }
    };

    fetchActiveTheme();

    // Poll every 60 seconds for scheduled campaign activation / expiry
    const timer = setInterval(fetchActiveTheme, 60000);

    // Also listen to custom broadcast or storage event when admin changes theme
    const handleStorageChange = (e) => {
      if (e.key === 'zuno_active_theme_sync') {
        fetchActiveTheme();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Animated search placeholder rotation (Zepto-style)
  const searchSuggestions = [
    "Search 'Himalayan Pink Salt'...",
    "Search 'Spicy Peri Peri'...",
    "Search 'Cream & Garden Onion'...",
    "Search 'Jaggery Caramel Makhana'...",
    "Search 'Raw Jumbo Kernels'..."
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchSuggestions.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [searchSuggestions.length]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navCategories = [
    { name: 'All Makhana', path: '/products' },
    { name: '⚡ Classic Roasted', path: '/products?category=classic-roasted' },
    { name: '🌶️ Gourmet Spiced', path: '/products?category=gourmet-flavoured' },
    { name: '🍯 Sweet Delights', path: '/products?category=sweet-delights' },
    { name: '🌿 Raw Superfood', path: '/products?category=raw-superfood' },
    { name: '🎁 Family Packs', path: '/products?category=combos-and-family-packs' }
  ];

  const isFestive = activeTheme && activeTheme.occasion !== 'default';

  return (
    <>
      <header className="sticky top-0 z-40 transition-all border-b border-white/10 shadow-md">
        <FestiveHeaderBackground theme={activeTheme}>
          {/* 1. Optional Festive Promotional Announcement Banner */}
          {activeTheme?.greeting && (
            <div className="bg-black/40 backdrop-blur-md border-b border-white/10 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center">
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
                <span className="font-extrabold text-amber-300">
                  {activeTheme.badgeText || 'Festive Special'}
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="font-medium text-white/95">{activeTheme.greeting}</span>
                {activeTheme.ctaText && (
                  <Link
                    to={activeTheme.ctaLink || '/products'}
                    className="inline-flex items-center gap-1 font-black text-amber-300 hover:text-amber-200 underline underline-offset-2 ml-1"
                  >
                    <span>{activeTheme.ctaText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* 2. Main Quick-Commerce Top Navigation */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
              {/* Left: Brand Logo & Delivery Pill */}
              <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                <Link to="/" className="flex items-center gap-2.5 group">
                  <div className="w-10 h-10 rounded-xl bg-qcPurple-800/90 backdrop-blur-md flex items-center justify-center text-qcYellow-400 shadow-md border border-qcPurple-500/50 group-hover:scale-105 transition">
                    <Sparkles className="w-5 h-5 text-qcYellow-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-black text-2xl tracking-tight text-white drop-shadow-sm leading-none">
                      Zuno
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300 mt-0.5">
                      Artisanal Superfood
                    </span>
                  </div>
                </Link>

                {/* Express Delivery Location Pill with Dynamic Theme Badge */}
                <div className="hidden sm:flex flex-col text-left pl-3 sm:pl-4 border-l border-white/20">
                  <div className="flex items-center gap-1.5 font-black text-xs text-white">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-charcoal-950 font-black text-[10px] shadow-2xs">
                      <Zap className="w-2.5 h-2.5 fill-charcoal-950" />{' '}
                      {activeTheme?.deliveryPillBadge || 'Express Dispatch'}
                    </span>
                    <span className="text-[11px] font-bold text-gray-200">Delivery to</span>
                  </div>
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs font-black text-white/95 flex items-center gap-1 hover:text-amber-300 truncate max-w-[160px] md:max-w-[200px]"
                  >
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{selectedLocation}</span>
                    <ChevronDown className="w-3 h-3 text-gray-300 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Center: Wide High-Contrast Search Bar */}
              <div className="flex-1 max-w-xl hidden md:block">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <input
                    type="text"
                    placeholder={searchSuggestions[placeholderIndex]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-md focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-300/40 transition-all text-charcoal-950 placeholder-gray-500 font-semibold"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
                </form>
              </div>

              {/* Right: User Account, Wishlist, and Zepto Cart Pill */}
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                {/* Mobile Search Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2 text-white hover:text-amber-300 rounded-lg"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist Link */}
                {isAuthenticated && (
                  <Link
                    to="/wishlist"
                    className="p-2 text-white hover:text-amber-300 hover:bg-white/10 rounded-xl transition relative hidden sm:flex"
                    title="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                )}

                {/* User Account Dropdown */}
                <div className="relative">
                  {isAuthenticated ? (
                    <div>
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition backdrop-blur-sm"
                      >
                        <User className="w-4 h-4 text-amber-300" />
                        <span className="hidden lg:inline max-w-[80px] truncate">
                          {user.name.split(' ')[0]}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
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
                      className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition backdrop-blur-sm"
                    >
                      <User className="w-3.5 h-3.5 text-amber-300" />
                      <span>Login</span>
                    </Link>
                  )}
                </div>

                {/* Zepto-Style Cart Trigger Pill with Live Amount */}
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl bg-qcGreen-700 hover:bg-qcGreen-800 text-white font-extrabold shadow-md transition active:scale-95 group border border-qcGreen-500/40"
                >
                  <ShoppingBag className="w-4 h-4 text-qcYellow-300 group-hover:scale-110 transition" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] uppercase font-bold text-qcGreen-100">
                      {cartCount} {cartCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-xs font-black text-white">₹{cartSubtotal}</span>
                  </div>
                </button>

                {/* Mobile Hamburger */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-white hover:text-amber-300 rounded-lg"
                  aria-label="Toggle Navigation Menu"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* 3. Zepto-Style Category Ribbon Strip */}
          <div className="bg-black/35 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
            <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 shrink-0">
              {navCategories.map((cat) => {
                const isActive = location.pathname + location.search === cat.path;
                return (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-400 text-charcoal-950 shadow-sm'
                        : 'text-white/90 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 4. Integrated Coupon Promotional Strip */}
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

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-cream-300 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Search flavours, combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-cream-100 border border-cream-300 rounded-xl"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="flex flex-col space-y-1">
            {navCategories.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-bold text-charcoal-800 hover:bg-cream-100 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
