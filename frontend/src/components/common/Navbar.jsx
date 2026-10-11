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
  Palette,
  Wallet,
  Mic,
  Flame,
  Sprout,
  Gift,
  Package,
  Crown
} from 'lucide-react';
import DeliveryLocationModal from './DeliveryLocationModal';
import CouponStrip from './CouponStrip';
import api from '../../api/client';
import { getThemeStyles } from '../../utils/themeStyles';

export default function Navbar() {
  const { user, isAuthenticated, logout, isRole } = useAuth();
  const { cartCount, cartSubtotal, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('zuno_delivery_location') || 'Sarfabad Village, Sector 73, Block D';
  });

  // Dynamic Theme State
  const [activeTheme, setActiveTheme] = useState(null);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const themeRes = await api.get('/themes/active');
        if (themeRes.data?.success) {
          setActiveTheme(themeRes.data.theme);
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchHeaderData();
    const timer = setInterval(fetchHeaderData, 60000);

    const handleStorageChange = (e) => {
      if (e.key === 'zuno_active_theme_sync') {
        fetchHeaderData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('zuno_active_theme_sync', fetchHeaderData);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('zuno_active_theme_sync', fetchHeaderData);
    };
  }, []);

  // Animated Blinkit-style search placeholder rotation
  const searchPlaceholders = [
    'Search "birthday gift"',
    'Search "spicy peri peri"',
    'Search "himalayan pink salt"',
    'Search "jaggery caramel"',
    'Search "family combo pack"',
    'Search "raw jumbo makhana"'
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [searchPlaceholders.length]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Web Speech API Voice Search handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          navigate(`/products?search=${encodeURIComponent(transcript)}`);
        };
        recognition.start();
        return;
      } catch {
        // Fallback to simulated voice input
      }
    }

    // Simulated voice search recognition feedback
    setIsListening(true);
    const sampleSuggestions = ['spicy peri peri', 'himalayan pink salt', 'jaggery caramel', 'raw jumbo'];
    const chosen = sampleSuggestions[Math.floor(Math.random() * sampleSuggestions.length)];
    setTimeout(() => {
      setIsListening(false);
      setSearchQuery(chosen);
      navigate(`/products?search=${encodeURIComponent(chosen)}`);
    }, 900);
  };

  // Quick-Commerce Categories with Icons (Matching Blinkit mobile category layout)
  const qcCategories = [
    { id: 'all', name: 'All', path: '/products', icon: ShoppingBag },
    { id: 'roasted', name: 'Roasted', path: '/products?category=classic-roasted', icon: Flame },
    { id: 'gourmet', name: 'Gourmet', path: '/products?category=gourmet-flavoured', icon: Sparkles },
    { id: 'sweet', name: 'Sweet', path: '/products?category=sweet-delights', icon: Heart },
    { id: 'raw', name: 'Raw Jumbo', path: '/products?category=raw-superfood', icon: Sprout },
    { id: 'combos', name: 'Combos', path: '/products?category=combos-and-family-packs', icon: Package },
    { id: 'gifting', name: 'Gifting', path: '/products?search=gift', icon: Gift },
    { id: 'vrat', name: 'Festive Vrat', path: '/products?search=salt', icon: Crown }
  ];

  const isCategoryActive = (cat) => {
    if (cat.id === 'all') {
      return (
        (location.pathname === '/' || location.pathname === '/products') &&
        !location.search.includes('category=') &&
        !location.search.includes('search=')
      );
    }
    return location.pathname + location.search === cat.path;
  };

  // Delivery promise display (Blinkit style: '29 minutes' + '🌧 Rain')
  const deliveryETA = activeTheme?.deliveryPillTime || '29 minutes';
  const deliveryBadge = activeTheme?.deliveryPillBadge || '🌧 Rain';
  const themeStyles = getThemeStyles(activeTheme);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all border-b shadow-sm select-none ${themeStyles.headerBorder}`}
        style={{ background: themeStyles.headerBg }}
      >
        {/* Optional Festive Greeting / Announcement Bar */}
        {activeTheme?.greeting && (
          <div className="bg-charcoal-950/85 backdrop-blur-md border-b border-white/10 text-white text-[11px] py-1 px-3 text-center">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-amber-300">
                {activeTheme.badgeText || 'Festive Special'}
              </span>
              <span className="text-gray-400 hidden sm:inline">•</span>
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

        {/* Main Quick-Commerce Header Block */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 pb-2 space-y-2">
          {/* Row 1: Delivery ETA, Location Selector, Wallet and Profile Buttons */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Blinkit-style "Zuno in" + Delivery Minutes + Rain Badge + Address Dropdown */}
            <div className="flex flex-col min-w-0">
              <span className={`text-[11px] font-extrabold leading-tight tracking-tight uppercase ${themeStyles.headerSubtextColor}`}>
                Zuno in
              </span>

              {/* Huge Bold Time + Weather/Dispatch Badge */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${themeStyles.headerTextColor}`}>
                  {deliveryETA}
                </span>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black ${themeStyles.etaBadgeBg}`}>
                  {deliveryBadge}
                </span>
              </div>

              {/* Delivery Address with Dropdown Caret */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className={`flex items-center gap-1 text-[12px] font-black mt-1 max-w-[210px] xs:max-w-[280px] sm:max-w-[360px] truncate text-left group ${themeStyles.headerTextColor}`}
                aria-label="Change delivery location"
              >
                <span className="truncate">{selectedLocation}</span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 group-hover:translate-y-0.5 transition-transform ${themeStyles.addressCaretColor}`} />
              </button>
            </div>

            {/* Right: Wallet pill [💵 ₹0] and Profile circular button [👤] */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Wallet Pill */}
              <button
                onClick={() => navigate('/account')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-2xs border border-amber-300/80 text-xs font-black text-charcoal-950 hover:bg-amber-50 active:scale-95 transition"
                title="Zuno Wallet Balance"
                aria-label="Wallet Balance"
              >
                <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-black text-[12px]">₹0</span>
              </button>

              {/* Profile Avatar Button */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 rounded-full bg-white shadow-2xs border border-amber-300/80 flex items-center justify-center text-charcoal-950 hover:bg-amber-50 active:scale-95 transition"
                  aria-label="User Account"
                >
                  <User className="w-4.5 h-4.5 text-charcoal-950" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-luxury border border-cream-300 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {isAuthenticated ? (
                      <>
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
                      </>
                    ) : (
                      <div className="p-3 space-y-2">
                        <p className="text-xs font-bold text-charcoal-900">Welcome to Zuno</p>
                        <p className="text-[11px] text-gray-500">Sign in to track orders, addresses and saved items</p>
                        <Link
                          to="/login"
                          onClick={() => setIsProfileOpen(false)}
                          className="block w-full py-2 bg-charcoal-950 text-white text-center rounded-xl text-xs font-black hover:bg-black transition shadow-sm"
                        >
                          Sign In / Register
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Counter Trigger (Desktop shortcut) */}
              {cartCount > 0 && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="hidden md:flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-qcGreen-700 hover:bg-qcGreen-800 text-white font-extrabold shadow-sm text-xs active:scale-95 transition"
                  aria-label="View Cart"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-qcYellow-300" />
                  <span>{cartCount}</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Full-Width Search Bar with Mic Icon */}
          <div className="w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="relative flex items-center bg-white rounded-2xl shadow-xs border border-amber-200/80 px-3.5 py-2.5 h-11 w-full focus-within:ring-2 focus-within:ring-charcoal-950 focus-within:border-charcoal-950 transition-all">
                <Search className="w-4.5 h-4.5 text-charcoal-600 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder={searchPlaceholders[placeholderIndex]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold text-charcoal-950 placeholder:text-charcoal-500 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-1 rounded-full transition shrink-0 ${
                    isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-charcoal-700 hover:text-black'
                  }`}
                  title={isListening ? 'Listening...' : 'Voice Search'}
                  aria-label="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Row 3: Horizontal Category Icon Rail (Blinkit Style: Icon on top, Label below, Active underline) */}
        <div className={`border-t px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none ${themeStyles.headerBorder}`}>
          <div className="max-w-7xl mx-auto flex items-center gap-4 sm:gap-6 shrink-0">
            {qcCategories.map((cat) => {
              const active = isCategoryActive(cat);
              const IconComponent = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={cat.path}
                  className={`flex flex-col items-center justify-center gap-1 min-w-[58px] text-center shrink-0 transition-all select-none relative pb-1.5 ${
                    active
                      ? `${themeStyles.headerTextColor} font-black`
                      : `${themeStyles.categoryInactiveText} font-semibold`
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <IconComponent
                      className={`w-5 h-5 transition-transform ${
                        active ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] whitespace-nowrap leading-tight">
                    {cat.name}
                  </span>
                  {active && (
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full ${themeStyles.activeUnderline}`} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Row 4: Promotional Coupon Carousel Strip */}
        <CouponStrip />
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
