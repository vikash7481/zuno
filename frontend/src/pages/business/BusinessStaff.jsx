import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  Plus,
  Shield,
  ShieldCheck,
  Boxes,
  Factory,
  Truck,
  ShoppingBag,
  CheckCircle2,
  X,
  Lock,
  Mail,
  Phone,
  UserCheck,
  UserX,
  FileText
} from 'lucide-react';

export default function BusinessStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'matrix'
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'inventory_manager'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/staff');
      setStaff(res.data.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/staff', formData);
      success(`Staff account for ${formData.name} created successfully!`);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'inventory_manager' });
      fetchStaff();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (staffMember) => {
    if (staffMember._id === user._id) {
      notifyError('Cannot modify your own active account status');
      return;
    }
    try {
      await api.put(`/auth/staff/${staffMember._id}`, { isActive: !staffMember.isActive });
      success(`Account ${staffMember.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchStaff();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const roleBadges = {
    super_admin: { label: 'Super Admin', bg: 'bg-gold-500/10 text-gold-700 border-gold-300', icon: ShieldCheck },
    admin: { label: 'Operations Admin', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: Shield },
    inventory_manager: { label: 'Inventory Manager', bg: 'bg-purple-50 text-purple-800 border-purple-300', icon: Boxes },
    production_manager: { label: 'Production Manager', bg: 'bg-blue-50 text-blue-800 border-blue-300', icon: Factory },
    order_manager: { label: 'Order Manager', bg: 'bg-cyan-50 text-cyan-800 border-cyan-300', icon: ShoppingBag },
    delivery_manager: { label: 'Delivery Manager', bg: 'bg-amber-50 text-amber-800 border-amber-300', icon: Truck },
    delivery_partner: { label: 'Delivery Fleet Partner', bg: 'bg-orange-50 text-orange-800 border-orange-300', icon: Truck },
    support_staff: { label: 'Customer Support', bg: 'bg-gray-100 text-gray-800 border-gray-300', icon: Users }
  };

  const permissionsMatrix = [
    { module: 'Overview & Financial KPIs', super_admin: true, admin: true, inventory_manager: false, production_manager: false, order_manager: false, delivery_partner: false },
    { module: 'Product & SKU Catalog', super_admin: true, admin: true, inventory_manager: false, production_manager: false, order_manager: false, delivery_partner: false },
    { module: 'Orders & Dispatch Assignment', super_admin: true, admin: true, inventory_manager: false, production_manager: false, order_manager: true, delivery_partner: false },
    { module: 'Inventory Balances & Stock Adjust', super_admin: true, admin: true, inventory_manager: true, production_manager: true, order_manager: false, delivery_partner: false },
    { module: 'FEFO Batches & Shelf Life', super_admin: true, admin: true, inventory_manager: true, production_manager: true, order_manager: false, delivery_partner: false },
    { module: 'Production Recipes & Batches BOM', super_admin: true, admin: true, inventory_manager: false, production_manager: true, order_manager: false, delivery_partner: false },
    { module: 'Suppliers & Purchase Orders', super_admin: true, admin: true, inventory_manager: true, production_manager: false, order_manager: false, delivery_partner: false },
    { module: 'Operating Expenses & Accounting', super_admin: true, admin: true, inventory_manager: false, production_manager: false, order_manager: false, delivery_partner: false },
    { module: 'Financial Statements & CSV Exports', super_admin: true, admin: true, inventory_manager: false, production_manager: false, order_manager: false, delivery_partner: false },
    { module: 'Staff Accounts & RBAC Creation', super_admin: true, admin: false, inventory_manager: false, production_manager: false, order_manager: false, delivery_partner: false },
    { module: 'Delivery Partner Trip Queue & OTP', super_admin: true, admin: true, inventory_manager: false, production_manager: false, order_manager: false, delivery_partner: true }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Staff & Role Permissions Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Authoritative enterprise access control and supply chain staff accounts
          </p>
        </div>

        {user?.role === 'super_admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Staff User</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-300 gap-2">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'border-brand-700 text-brand-800'
              : 'border-transparent text-gray-500 hover:text-charcoal-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Staff Accounts ({staff.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-brand-700 text-brand-800'
              : 'border-transparent text-gray-500 hover:text-charcoal-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Permission Matrix</span>
        </button>
      </div>

      {/* Tab: Staff Accounts */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 text-charcoal-800 border-b border-cream-200">
                  <th className="p-4 font-bold">Staff Member</th>
                  <th className="p-4 font-bold">Role & Department</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      Loading staff accounts...
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No staff accounts found.
                    </td>
                  </tr>
                ) : (
                  staff.map((member) => {
                    const badgeInfo = roleBadges[member.role] || { label: member.role, bg: 'bg-gray-100 text-gray-800', icon: Shield };
                    const RoleIcon = badgeInfo.icon;

                    return (
                      <tr key={member._id} className="hover:bg-cream-50/50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-700/10 text-brand-800 flex items-center justify-center font-black">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-charcoal-900">{member.name}</p>
                              <p className="text-[11px] text-gray-400 font-mono">{member.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeInfo.bg}`}>
                            <RoleIcon className="w-3 h-3" />
                            <span>{badgeInfo.label}</span>
                          </span>
                        </td>

                        <td className="p-4 text-gray-600">
                          <p>{member.phone || '—'}</p>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            member.isActive ? 'text-emerald-700' : 'text-rose-600'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {member.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          {user?.role === 'super_admin' && member._id !== user._id && (
                            <button
                              onClick={() => handleToggleStatus(member)}
                              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                                member.isActive
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {member.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Permission Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal-900">
              Role Permission Access Matrix
            </h3>
            <p className="text-xs text-gray-500">
              Every sensitive endpoint is strictly verified independently on the backend server.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 text-charcoal-800 border-b border-cream-200">
                  <th className="p-3 font-bold">Module / Feature</th>
                  <th className="p-3 font-bold text-center">Super Admin</th>
                  <th className="p-3 font-bold text-center">Admin</th>
                  <th className="p-3 font-bold text-center">Inventory Mgr</th>
                  <th className="p-3 font-bold text-center">Production Mgr</th>
                  <th className="p-3 font-bold text-center">Order Mgr</th>
                  <th className="p-3 font-bold text-center">Delivery Fleet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {permissionsMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-cream-50/50">
                    <td className="p-3 font-bold text-charcoal-800">{row.module}</td>
                    <td className="p-3 text-center">{row.super_admin ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{row.admin ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{row.inventory_manager ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{row.production_manager ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{row.order_manager ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{row.delivery_partner ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-cream-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="font-serif font-bold text-xl text-charcoal-900">Create Staff User</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-charcoal-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vikram Singh"
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vikram@zuno.com"
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Assigned Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl font-bold"
                >
                  <option value="inventory_manager">Inventory Manager (Stock & FEFO)</option>
                  <option value="production_manager">Production Manager (BOM & Batches)</option>
                  <option value="order_manager">Order Manager (Dispatch & Fulfilment)</option>
                  <option value="delivery_manager">Delivery Manager (Fleet Operations)</option>
                  <option value="delivery_partner">Delivery Fleet Partner (Driver App)</option>
                  <option value="admin">Operations Admin</option>
                  <option value="support_staff">Customer Support Staff</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-cream-300 font-bold hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
