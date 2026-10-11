import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Truck, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function DeliveryLogin() {
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

      if (user.role !== 'delivery_partner' && user.role !== 'super_admin' && user.role !== 'delivery_manager') {
        logout();
        notifyError('Access Denied: This account is not an authorized delivery partner.');
        return;
      }

      navigate('/delivery/dashboard');
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
          <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-charcoal-950 mx-auto shadow-xl">
            <Truck className="w-7 h-7 text-charcoal-950" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            Zuno Delivery Fleet
          </h1>
          <p className="text-xs text-gray-400">
            Driver Partner Logistics & Trip Fulfillment App
          </p>
        </div>

        {/* Card */}
        <div className="bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold block mb-1 text-gray-300">Partner Registered Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rider@zuno.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-charcoal-800 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white placeholder-gray-500"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-charcoal-800 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white placeholder-gray-500"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Driver App'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <Link to="/" className="hover:text-gold-400 transition">
              ← Return to Storefront
            </Link>
            <Link to="/business/login" className="hover:text-brand-400 transition">
              Business Suite Login →
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-500">
          Zuno Last-Mile Logistics. Delivery requires customer OTP verification.
        </p>
      </div>
    </div>
  );
}
