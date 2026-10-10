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
  Clock
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isRole } = useAuth();
  const { cartCount, cartSubtotal, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Bengaluru - 560001');
  const [locationInput, setLocationInput] = useState('');

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
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navCategories = [
    { name: 'All Makhana', path: '/catalogue' },
    { name: '⚡ Classic Roasted', path: '/catalogue?category=classic-roasted' },
    { name: '🌶️ Gourmet Spiced', path: '/catalogue?category=gourmet-flavoured' },
    { name: '🍯 Sweet Delights', path: '/catalogue?category=sweet-delights' },
    { name: '🌿 Raw Superfood', path: '/catalogue?category=raw-superfood' },
    { name: '🎁 Family Packs', path: '/catalogue?category=combos-and-family-packs' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-300 shadow-xs transition-all">
        {/* Main Quick-Commerce Top Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
            {/* Left: Brand Logo & Zepto-Style Delivery Pill */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-qcPurple-800 flex items-center justify-center text-qcYellow-400 shadow-sm border border-qcPurple-600 group-hover:scale-105 transition">
                  <Sparkles className="w-5 h-5 text-qcYellow-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans font-black text-2xl tracking-tight text-qcPurple-950 leading-none">
                    Zuno
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-qcGreen-700 mt-0.5">
                    10-Min Superfood
                  </span>
                </div>
              </Link>

              {/* Zepto-Style 10-Minute Delivery Location Pill */}
              <div className="hidden sm:flex flex-col text-left pl-3 sm:pl-4 border-l border-cream-300">
                <div className="flex items-center gap-1.5 font-black text-xs text-charcoal-950">
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-qcYellow-400 text-charcoal-950 font-black text-[10px] shadow-2xs">
                    <Zap className="w-2.5 h-2.5 fill-charcoal-950" /> 10 MINS
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">Delivery to</span>
                </div>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-xs font-black text-charcoal-900 flex items-center gap-1 hover:text-qcPurple-700 truncate max-w-[160px] md:max-w-[200px]"
                >
                  <MapPin className="w-3 h-3 text-qcPurple-700 shrink-0" />
                  <span className="truncate">{selectedLocation}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                </button>
              </div>
            </div>

            {/* Center: Wide Zepto Search Bar */}
            <div className="flex-1 max-w-xl hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder={searchSuggestions[placeholderIndex]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-cream-100/80 border border-cream-300 rounded-xl shadow-2xs focus:outline-none focus:border-qcPurple-700 focus:bg-white focus:ring-2 focus:ring-qcPurple-100 transition-all text-charcoal-950 placeholder-gray-400 font-medium"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              </form>
            </div>

            {/* Right: User Account, Wishlist, and Zepto Cart Pill */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-charcoal-800 hover:text-qcPurple-700 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="p-2 text-charcoal-800 hover:text-qcPurple-700 hover:bg-cream-100 rounded-xl transition relative hidden sm:flex"
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
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-xs font-bold text-charcoal-900 transition"
                    >
                      <User className="w-4 h-4 text-qcPurple-700" />
                      <span className="hidden lg:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
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
                          to="/profile"
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

                        {isRole(['admin', 'super_admin', 'inventory_manager', 'order_manager', 'production_manager']) && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-qcPurple-700 bg-qcPurple-50 hover:bg-qcPurple-100 transition"
                          >
                            <Shield className="w-4 h-4 text-qcPurple-700" /> Zuno Business Admin
                          </Link>
                        )}

                        {isRole(['delivery_partner']) && (
                          <Link
                            to="/delivery"
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
                    className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-900 border border-cream-300 text-xs font-bold transition"
                  >
                    <User className="w-3.5 h-3.5 text-qcPurple-700" />
                    <span>Login</span>
                  </Link>
                )}
              </div>

              {/* Zepto-Style Cart Trigger Pill with Live Amount */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl bg-qcGreen-700 hover:bg-qcGreen-800 text-white font-extrabold shadow-sm transition active:scale-95 group"
              >
                <ShoppingBag className="w-4 h-4 text-qcYellow-300 group-hover:scale-110 transition" />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[10px] uppercase font-bold text-qcGreen-100">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-xs font-black text-white">
                    ₹{cartSubtotal}
                  </span>
                </div>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-charcoal-800 hover:text-qcPurple-700 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Zepto-Style Category Ribbon Strip */}
        <div className="bg-cream-50 border-t border-cream-200/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 shrink-0">
            {navCategories.map((cat) => {
              const isActive = location.pathname + location.search === cat.path;
              return (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-qcPurple-700 text-white shadow-2xs'
                      : 'text-charcoal-800 hover:bg-cream-200/90'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Zepto-Style Delivery Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-qcPurple-700" />
                <h3 className="font-bold text-base text-charcoal-950">Select Delivery Location</h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Zuno delivers fresh, slow-roasted artisanal fox nuts to your doorstep within 10 to 15 minutes!
            </p>

            <div className="space-y-2">
              {[
                { name: 'Bengaluru - 560001', area: 'MG Road, Indiranagar, Koramangala' },
                { name: 'Mumbai - 400001', area: 'Bandra, Fort, Colaba, Andheri' },
                { name: 'Delhi NCR - 110001', area: 'Connaught Place, South Ex, Gurgaon' },
                { name: 'Hyderabad - 500001', area: 'Banjara Hills, Hitec City, Jubilee Hills' }
              ].map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    setSelectedLocation(loc.name);
                    setIsLocationModalOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    selectedLocation === loc.name
                      ? 'border-qcPurple-700 bg-qcPurple-50/60 ring-1 ring-qcPurple-700'
                      : 'border-cream-300 hover:border-gray-400 bg-cream-50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs text-charcoal-900">{loc.name}</p>
                    <p className="text-[11px] text-gray-500">{loc.area}</p>
                  </div>
                  <span className="text-[10px] font-extrabold text-qcGreen-700 bg-qcGreen-100 px-2 py-0.5 rounded-full">
                    ⚡ 10 Mins
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
