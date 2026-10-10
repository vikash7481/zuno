import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Shield, User, Truck, Factory, Boxes, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (['admin', 'super_admin', 'inventory_manager', 'production_manager'].includes(user.role)) {
        navigate('/admin');
      } else if (user.role === 'delivery_partner') {
        navigate('/delivery');
      } else {
        navigate(redirectPath);
      }
    } catch {
      // Notification handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleKey, target) => {
    setLoading(true);
    try {
      await quickLogin(roleKey);
      navigate(target);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-gold-400 mx-auto shadow-md border border-gold-500/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-brand-950">Welcome to Zuno</h1>
        <p className="text-xs text-gray-500">Sign in to your customer account or role dashboard</p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-luxury space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1 text-charcoal-800">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2.5 bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-charcoal-800">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Don’t have an account?{' '}
          <Link to="/register" className="text-brand-700 font-bold hover:underline">
            Create Customer Account
          </Link>
        </p>
      </div>

      {/* 1-Click Role-Based Quick Demo Access */}
      <div className="p-5 rounded-2xl bg-cream-200/80 border border-cream-300 space-y-3">
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700">
            Developer & Evaluator Demo Logins
          </span>
          <p className="text-[11px] text-gray-500 mt-0.5">Click any role to log in with pre-configured seed accounts:</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={() => handleQuickDemo('customer', '/')}
            className="p-2.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-300 font-bold text-charcoal-800 flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <User className="w-3.5 h-3.5 text-brand-700" />
            <span>Customer (Priya)</span>
          </button>

          <button
            onClick={() => handleQuickDemo('admin', '/admin')}
            className="p-2.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-300 font-bold text-charcoal-800 flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Shield className="w-3.5 h-3.5 text-brand-700" />
            <span>Admin (Rohan)</span>
          </button>

          <button
            onClick={() => handleQuickDemo('delivery', '/delivery')}
            className="p-2.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-300 font-bold text-charcoal-800 flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            <span>Delivery (Rajesh)</span>
          </button>

          <button
            onClick={() => handleQuickDemo('inventory', '/admin/inventory')}
            className="p-2.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-300 font-bold text-charcoal-800 flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Boxes className="w-3.5 h-3.5 text-purple-600" />
            <span>Inventory Mgr</span>
          </button>

          <button
            onClick={() => handleQuickDemo('production', '/admin/production')}
            className="p-2.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-300 font-bold text-charcoal-800 flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Factory className="w-3.5 h-3.5 text-blue-600" />
            <span>Production Mgr</span>
          </button>

          <button
            onClick={() => handleQuickDemo('superadmin', '/admin')}
            className="p-2.5 rounded-xl bg-white hover:bg-cream-100 border border-cream-300 font-bold text-charcoal-800 flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Shield className="w-3.5 h-3.5 text-gold-600" />
            <span>Super Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
