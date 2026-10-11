import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      // If staff user logs in from customer login, route them to their workspace
      if (['super_admin', 'admin', 'inventory_manager', 'production_manager', 'order_manager', 'delivery_manager'].includes(user.role)) {
        if (user.role === 'inventory_manager') navigate('/business/inventory');
        else if (user.role === 'production_manager') navigate('/business/production');
        else if (user.role === 'order_manager') navigate('/business/orders');
        else navigate('/business/dashboard');
      } else if (user.role === 'delivery_partner') {
        navigate('/delivery/dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch {
      // Notification handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-700 flex items-center justify-center text-gold-400 mx-auto shadow-md border border-gold-500/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-brand-950">Welcome to Zuno</h1>
        <p className="text-xs text-gray-500">Sign in to your customer account to manage your orders</p>
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
            className="w-full py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-cream-200">
          <span>Don't have an account?</span>
          <Link to="/register" className="text-brand-700 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>

      {/* Enterprise Staff Gateway Link */}
      <div className="text-center space-y-1.5 text-xs text-gray-500">
        <p>
          Zuno Business staff?{' '}
          <Link to="/business/login" className="text-brand-800 font-bold hover:underline">
            Log in to Business Suite
          </Link>
        </p>
        <p>
          Delivery fleet partner?{' '}
          <Link to="/delivery/login" className="text-amber-800 font-bold hover:underline">
            Log in to Delivery App
          </Link>
        </p>
      </div>
    </div>
  );
}
