import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, UserCheck, Truck, ShoppingBag, ArrowRight } from 'lucide-react';

export default function RoleSwitcherBanner() {
  const { user, quickLogin, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSwitch = async (roleName, targetPath) => {
    try {
      await quickLogin(roleName);
      if (targetPath) navigate(targetPath);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-charcoal-900 text-cream-200 text-xs py-1.5 px-4 border-b border-gold-600/30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-1 text-[11px] sm:text-xs">
            <ShieldCheck className="w-3.5 h-3.5" /> Demo Switcher:
          </span>
          <span className="text-gray-300 hidden sm:inline">Test multi-role workflows instantly:</span>
        </div>

        <div className="flex items-center flex-wrap gap-1 sm:gap-1.5">
          <button
            onClick={() => handleSwitch('customer', '/')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-medium transition flex items-center gap-1 ${
              role === 'customer'
                ? 'bg-gold-500 text-charcoal-900 font-bold shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-gray-200'
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            Customer
          </button>

          <button
            onClick={() => handleSwitch('admin', '/admin')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-medium transition flex items-center gap-1 ${
              role === 'admin' || role === 'super_admin'
                ? 'bg-brand-600 text-white font-bold shadow-sm ring-1 ring-brand-300'
                : 'bg-white/10 hover:bg-white/20 text-gray-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Zuno Business
          </button>

          <button
            onClick={() => handleSwitch('delivery', '/delivery')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-medium transition flex items-center gap-1 ${
              role === 'delivery_partner'
                ? 'bg-amber-500 text-charcoal-900 font-bold shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-gray-200'
            }`}
          >
            <Truck className="w-3 h-3" />
            Zuno Delivery
          </button>

          {user && (
            <span className="text-gray-400 pl-2 border-l border-white/20 hidden md:inline">
              Active: <strong className="text-cream-100">{user.name}</strong> ({user.role})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
