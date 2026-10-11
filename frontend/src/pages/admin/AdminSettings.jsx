import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Settings, Save, MapPin, Truck, Mail, Phone, Clock } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    brand_name: 'Zuno',
    free_delivery_threshold: 499,
    standard_delivery_fee: 49,
    delivery_eta_time: '12 Mins',
    delivery_eta_badge: 'Diwali Rush Express',
    support_email: 'support@zuno.com',
    support_phone: '+919876543210',
    serviceable_pincodes: ['110001', '110020', '110048', '560001', '560034', '400001'],
    auto_dispatch_enabled: true
  });

  const [pincodeString, setPincodeString] = useState('');
  const [saving, setSaving] = useState(false);
  const { success, error: notifyError } = useNotification();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.settings) {
          setSettings(res.data.settings);
          setPincodeString(
            Array.isArray(res.data.settings.serviceable_pincodes)
              ? res.data.settings.serviceable_pincodes.join(', ')
              : ''
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedPincodes = pincodeString
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        ...settings,
        serviceable_pincodes: parsedPincodes
      };

      await api.put('/settings', payload);
      localStorage.setItem('zuno_delivery_eta_sync', Date.now().toString());
      window.dispatchEvent(new Event('zuno_delivery_eta_sync'));
      success('Platform business settings saved successfully!');
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Platform Configuration</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-950">Store & Delivery Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">Control live storefront header delivery time, shipping fee rules, and service zones</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-card space-y-6 text-xs">
        {/* Quick-Commerce Storefront Header Delivery Promise */}
        <div className="space-y-4 p-4.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-brand-900 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-amber-600" /> Storefront Header Delivery Promise
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Live in Navbar
            </span>
          </div>
          <p className="text-[11px] text-gray-600">
            Customize the big bold delivery time (e.g. <strong>12 Mins</strong>) and dynamic tag shown in the top navigation header on the storefront.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Header Delivery Time (e.g. "12 Mins", "10 Mins")</label>
              <input
                type="text"
                required
                value={settings.delivery_eta_time || ''}
                onChange={(e) => setSettings({ ...settings, delivery_eta_time: e.target.value })}
                placeholder="12 Mins"
                className="w-full p-2.5 bg-white border border-cream-300 rounded-xl font-bold text-brand-950 text-sm"
              />
              <span className="text-[10px] text-gray-400">Shown in bold "Zuno in [12 Mins]" in header</span>
            </div>

            <div>
              <label className="font-bold block mb-1">Header Dispatch Tag / Badge</label>
              <input
                type="text"
                required
                value={settings.delivery_eta_badge || ''}
                onChange={(e) => setSettings({ ...settings, delivery_eta_badge: e.target.value })}
                placeholder="Diwali Rush Express"
                className="w-full p-2.5 bg-white border border-cream-300 rounded-xl font-bold text-brand-950 text-sm"
              />
              <span className="text-[10px] text-gray-400">Pill badge shown next to the delivery time (e.g. Express, Rain)</span>
            </div>
          </div>
        </div>

        {/* Shipping Fee Rules */}
        <div className="space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-900 flex items-center gap-2 border-b border-cream-200 pb-2">
            <Truck className="w-4 h-4 text-brand-700" /> Shipping & Delivery Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Free Delivery Cart Threshold (₹)</label>
              <input
                type="number"
                required
                value={settings.free_delivery_threshold}
                onChange={(e) => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
                className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
              />
              <span className="text-[10px] text-gray-400">Cart subtotal required to qualify for 0 delivery charge</span>
            </div>

            <div>
              <label className="font-bold block mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                required
                value={settings.standard_delivery_fee}
                onChange={(e) => setSettings({ ...settings, standard_delivery_fee: Number(e.target.value) })}
                className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
              />
              <span className="text-[10px] text-gray-400">Charged on orders below free shipping threshold</span>
            </div>
          </div>
        </div>

        {/* Serviceable Pincodes */}
        <div className="space-y-3 pt-2">
          <h2 className="font-serif text-base font-bold text-brand-900 flex items-center gap-2 border-b border-cream-200 pb-2">
            <MapPin className="w-4 h-4 text-brand-700" /> Local Delivery PIN Codes
          </h2>

          <div>
            <label className="font-bold block mb-1">Serviceable PIN Codes (Comma separated)</label>
            <textarea
              rows={3}
              value={pincodeString}
              onChange={(e) => setPincodeString(e.target.value)}
              placeholder="110001, 110020, 560001, 400001"
              className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl font-mono"
            />
            <span className="text-[10px] text-gray-400">Customer checkout verifies destination against this list</span>
          </div>
        </div>

        {/* Support Contact */}
        <div className="space-y-4 pt-2">
          <h2 className="font-serif text-base font-bold text-brand-900 flex items-center gap-2 border-b border-cream-200 pb-2">
            <Mail className="w-4 h-4 text-brand-700" /> Customer Support Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Support Email</label>
              <input
                type="email"
                required
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Support Phone Helpline</label>
              <input
                type="text"
                required
                value={settings.support_phone}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                className="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-cream-200">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition"
          >
            <Save className="w-4 h-4 text-gold-300" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
