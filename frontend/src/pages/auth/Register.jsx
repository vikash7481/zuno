import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, User, Mail, Lock, Phone } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-gold-400 mx-auto shadow-md border border-gold-500/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-brand-950">Join the Zuno Club</h1>
        <p className="text-xs text-gray-500">Create an account to track orders and earn snacking perks</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-luxury space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1 text-charcoal-800">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Priya Sharma"
                className="w-full pl-9 pr-3 py-2.5 bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-charcoal-800">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="priya@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-charcoal-800">Phone Number *</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2.5 bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-brand-600"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-charcoal-800">Create Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
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
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="text-brand-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
