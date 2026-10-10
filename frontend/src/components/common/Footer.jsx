import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Leaf, Flame, HeartHandshake, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-cream-200 border-t border-gold-600/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Superfood Value Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-800/80 border border-gold-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-100">Slow Roasted</h4>
              <p className="text-[11px] text-gray-400">100% roasted, never deep fried</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-800/80 border border-gold-500/30 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-100">Pure & Vegan</h4>
              <p className="text-[11px] text-gray-400">No artificial colors or preservatives</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-800/80 border border-gold-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-100">Direct From Mithila</h4>
              <p className="text-[11px] text-gray-400">Grade-A hand-screened kernels</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-800/80 border border-gold-500/30 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-100">Quality Guaranteed</h4>
              <p className="text-[11px] text-gray-400">Crispness sealed in nitrogen barrier</p>
            </div>
          </div>
        </div>

        {/* Footer Links & Brand Story */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-gold-400 border border-gold-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-cream-100">Zuno</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              Handpicked, slow-roasted artisanal fox nuts seasoned with natural whole spices. Reimagining mindful Indian superfoods for modern snacking.
            </p>
            <div className="space-y-1.5 text-xs text-gray-300 pt-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-400" /> support@zuno.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-400" /> +91 98765 43210
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-400" /> Bengaluru & Darbhanga
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">Shop Collections</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/catalogue" className="hover:text-gold-300 transition">All Fox Nuts</Link></li>
              <li><Link to="/catalogue?category=classic-roasted" className="hover:text-gold-300 transition">Classic Pink Salt</Link></li>
              <li><Link to="/catalogue?category=gourmet-flavoured" className="hover:text-gold-300 transition">Spicy Peri Peri</Link></li>
              <li><Link to="/catalogue?category=sweet-delights" className="hover:text-gold-300 transition">Jaggery Caramel</Link></li>
              <li><Link to="/catalogue?category=raw-superfood" className="hover:text-gold-300 transition">Raw Jumbo Kernels</Link></li>
              <li><Link to="/catalogue?category=combos-and-family-packs" className="hover:text-gold-300 transition">Gift & Combo Boxes</Link></li>
            </ul>
          </div>

          {/* Business & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/orders" className="hover:text-gold-300 transition">Track Your Order</Link></li>
              <li><Link to="/policies#shipping" className="hover:text-gold-300 transition">Shipping Policy</Link></li>
              <li><Link to="/policies#returns" className="hover:text-gold-300 transition">Returns & Refunds</Link></li>
              <li><Link to="/policies#privacy" className="hover:text-gold-300 transition">Privacy Policy</Link></li>
              <li><Link to="/policies#terms" className="hover:text-gold-300 transition">Terms of Service</Link></li>
              <li><Link to="/our-story" className="hover:text-gold-300 transition">The Mithila Story</Link></li>
            </ul>
          </div>

          {/* Newsletter / Club */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">Zuno Snacking Club</h4>
            <p className="text-xs text-gray-400 mb-3">
              Subscribe for exclusive batch releases, tasting notes, and secret discount coupons.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-cream-100 placeholder-gray-400 focus:outline-none focus:border-gold-400 flex-1"
              />
              <button className="bg-gold-500 hover:bg-gold-600 text-charcoal-900 font-bold px-3.5 py-2 rounded-lg text-xs transition">
                Join
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">No spam. Only fresh roasts and perks.</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} Zuno Fox Nuts India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>FSSAI Lic: 10026011000492</span>
            <span>•</span>
            <span>Made with pride in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
