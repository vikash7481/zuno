import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../api/client';
import { User, MapPin, Plus, Trash2, CheckCircle2, Shield, Phone, Mail } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    landmark: '',
    isDefault: false
  });

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/addresses', newAddress);
      setUser({ ...user, addresses: res.data.addresses });
      success('Address saved successfully!');
      setShowAddressModal(false);
      setNewAddress({
        fullName: user?.name || '',
        phone: user?.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        landmark: '',
        isDefault: false
      });
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await api.delete(`/auth/addresses/${addrId}`);
      setUser({ ...user, addresses: res.data.addresses });
      success('Address deleted.');
    } catch (err) {
      notifyError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Account Portal</span>
        <h1 className="font-serif text-3xl font-bold text-brand-950">My Profile & Saved Addresses</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* User Details Card */}
        <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-4">
          <div className="flex items-center gap-3 border-b border-cream-200 pb-4">
            <div className="w-14 h-14 rounded-full bg-brand-700 text-gold-300 flex items-center justify-center font-bold text-xl shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-brand-950">{user.name}</h2>
              <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-charcoal-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-700" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-700" />
              <span>{user.phone || 'No phone number linked'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold-600" />
              <span>Zuno Club Member Since {new Date(user.createdAt || Date.now()).getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Addresses Manager */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-brand-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-700" />
              <span>Saved Shipping Addresses</span>
            </h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="px-3.5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          </div>

          <div className="space-y-3">
            {(!user.addresses || user.addresses.length === 0) ? (
              <div className="p-8 bg-white rounded-2xl border border-cream-300 text-center text-xs text-gray-500">
                No addresses saved yet. Add a default shipping destination for faster 1-click checkout.
              </div>
            ) : (
              user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="font-bold text-brand-950 text-sm">{addr.fullName}</strong>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-gray-500">{addr.addressLine2}</p>}
                    <p className="text-gray-600 font-medium">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-gray-500">Phone: {addr.phone}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-gray-400 hover:text-rose-600 p-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4">
            <h3 className="font-serif text-lg font-bold text-brand-950">Add Shipping Address</h3>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className="w-full p-2 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full p-2 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  className="w-full p-2 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full p-2 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full p-2 bg-cream-100 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defCheck"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                />
                <label htmlFor="defCheck" className="text-gray-600">Set as default shipping address</label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
