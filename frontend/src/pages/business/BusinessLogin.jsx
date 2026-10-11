import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function BusinessLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const { error: notifyError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);

      const staffRoles = [
        'super_admin',
        'admin',
        'inventory_manager',
        'production_manager',
        'order_manager',
        'delivery_manager',
        'support_staff'
      ];

      if (!staffRoles.includes(user.role)) {
        logout();
        notifyError('Access Denied: This account is not authorized for Zuno Business.');
        return;
      }

      // Route to role-specific workspace
      if (user.role === 'inventory_manager') {
        navigate('/business/inventory');
      } else if (user.role === 'production_manager') {
        navigate('/business/production');
      } else if (user.role === 'order_manager') {
        navigate('/business/orders');
      } else if (user.role === 'delivery_manager') {
        navigate('/business/delivery');
      } else {
        navigate('/business/dashboard');
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 flex items-center justify-center text-gold-400 mx-auto shadow-xl border border-gold-500/30">
            <Building2 className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            Zuno Business Suite
          </h1>
          <p className="text-xs text-gray-400">
            Enterprise Operations, Inventory, Production & Admin Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold block mb-1 text-gray-300">Staff Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@zuno.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-charcoal-800 border border-white/10 rounded-xl focus:outline-none focus:border-brand-500 text-white placeholder-gray-500"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1 text-gray-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-charcoal-800 border border-white/10 rounded-xl focus:outline-none focus:border-brand-500 text-white placeholder-gray-500"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Business Suite'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <Link to="/" className="hover:text-gold-400 transition">
              ← Return to Storefront
            </Link>
            <Link to="/delivery/login" className="hover:text-amber-400 transition">
              Delivery Partner Login →
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-500">
          Zuno Enterprise Supply Chain Management. Unauthorized access is strictly logged and audited.
        </p>
      </div>
    </div>
  );
}
