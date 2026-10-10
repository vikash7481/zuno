import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isRole } = useAuth();
  const { cartCount, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'All Makhana', path: '/catalogue' },
    { name: 'Classic Roasted', path: '/catalogue?category=classic-roasted' },
    { name: 'Gourmet Spiced', path: '/catalogue?category=gourmet-flavoured' },
    { name: 'Raw Superfood', path: '/catalogue?category=raw-superfood' },
    { name: 'Family Combos', path: '/catalogue?category=combos-and-family-packs' },
    { name: 'Our Craft', path: '/our-story' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-md border-b border-cream-300/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-gold-400 shadow-sm border border-gold-500/30 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-brand-800 leading-none group-hover:text-brand-900 transition">
                Zuno
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 mt-0.5">
                Artisanal Makhana
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-brand-700 ${
                  location.pathname + location.search === link.path
                    ? 'text-brand-700 font-semibold border-b-2 border-brand-700 pb-1'
                    : 'text-charcoal-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions: Search, Wishlist, User Menu, Cart */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center">
              <input
                type="text"
                placeholder="Search flavors, roasted..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-60 pl-9 pr-4 py-1.5 text-xs bg-cream-200/80 border border-cream-400 rounded-full focus:outline-none focus:border-brand-500 focus:bg-white focus:w-64 transition-all"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" />
            </form>

            {/* Wishlist Link */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="p-2 text-charcoal-800 hover:text-brand-700 hover:bg-cream-200 rounded-full transition relative hidden sm:flex"
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
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-cream-200 hover:bg-cream-300 border border-cream-400 text-xs font-semibold text-brand-900 transition"
                  >
                    <User className="w-4 h-4 text-brand-700" />
                    <span className="hidden md:inline max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-luxury border border-cream-300 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-cream-200">
                        <p className="text-xs font-bold text-brand-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-800 hover:bg-cream-100 hover:text-brand-700 transition"
                      >
                        <User className="w-4 h-4" /> My Profile & Addresses
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-800 hover:bg-cream-100 hover:text-brand-700 transition"
                      >
                        <PackageCheck className="w-4 h-4" /> My Orders & Invoices
                      </Link>

                      {/* Staff & Admin links */}
                      {isRole(['admin', 'super_admin', 'inventory_manager', 'order_manager', 'production_manager']) && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition"
                        >
                          <Shield className="w-4 h-4 text-brand-700" /> Zuno Business Admin
                        </Link>
                      )}

                      {/* Delivery Partner link */}
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
                  className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-brand-700 hover:bg-brand-800 text-white shadow-soft transition relative group"
            >
              <ShoppingBag className="w-4 h-4 text-gold-300 group-hover:scale-110 transition" />
              <span className="text-xs font-bold">{cartCount}</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal-800 hover:text-brand-700 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-cream-300 bg-cream-50 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Search flavours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-cream-400 rounded-full"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-charcoal-800 hover:bg-cream-200 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {isAuthenticated && (
            <div className="pt-3 border-t border-cream-300 space-y-2">
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-charcoal-800"
              >
                <PackageCheck className="w-4 h-4" /> My Orders
              </Link>

              {isRole(['admin', 'super_admin']) && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-brand-700 bg-brand-50 rounded-lg"
                >
                  <Shield className="w-4 h-4" /> Zuno Business Dashboard
                </Link>
              )}

              {isRole(['delivery_partner']) && (
                <Link
                  to="/delivery"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-700 bg-amber-50 rounded-lg"
                >
                  <Truck className="w-4 h-4" /> Zuno Delivery Interface
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
