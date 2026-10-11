import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Factory,
  Users,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Shield,
  Menu,
  X,
  Sparkles,
  Lock,
  ArrowRight,
  Truck,
  CheckCircle2
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = user?.role || 'admin';

  // Navigation catalog based on RBAC permissions
  const getAllNavItems = () => {
    const items = [
      { name: 'Dashboard Overview', path: '/business/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin'] },
      { name: 'Products & Variants', path: '/business/products', icon: Package, roles: ['super_admin', 'admin'] },
      { name: 'Orders Management', path: '/business/orders', icon: ShoppingBag, roles: ['super_admin', 'admin', 'order_manager', 'delivery_manager'] },
      { name: 'Inventory & Stock', path: '/business/inventory', icon: Boxes, roles: ['super_admin', 'admin', 'inventory_manager', 'production_manager'] },
      { name: 'Production & Recipes', path: '/business/production', icon: Factory, roles: ['super_admin', 'admin', 'production_manager'] },
      { name: 'Suppliers & Purchases', path: '/business/suppliers', icon: Users, roles: ['super_admin', 'admin', 'inventory_manager'] },
      { name: 'Operating Expenses', path: '/business/expenses', icon: Receipt, roles: ['super_admin', 'admin'] },
      { name: 'Delivery Operations', path: '/business/delivery', icon: Truck, roles: ['super_admin', 'admin', 'delivery_manager', 'order_manager'] },
      { name: 'Financial Reports', path: '/business/reports', icon: BarChart3, roles: ['super_admin', 'admin'] },
      { name: 'Staff & Permissions', path: '/business/staff', icon: Users, roles: ['super_admin'] },
      { name: 'Business Settings', path: '/business/settings', icon: Settings, roles: ['super_admin', 'admin'] }
    ];

    return items.filter(item => item.roles.includes(role));
  };

  const navItems = getAllNavItems();

  const getRoleBranding = () => {
    switch (role) {
      case 'inventory_manager':
        return { title: 'Zuno Inventory', badge: 'Stock & Warehouse', bg: 'bg-purple-700', text: 'text-purple-400' };
      case 'production_manager':
        return { title: 'Zuno Production', badge: 'Makhana Roasting & BOM', bg: 'bg-blue-700', text: 'text-blue-400' };
      case 'order_manager':
        return { title: 'Zuno Dispatch', badge: 'Order Fulfillment', bg: 'bg-cyan-700', text: 'text-cyan-400' };
      case 'delivery_manager':
        return { title: 'Zuno Logistics', badge: 'Fleet Operations', bg: 'bg-amber-700', text: 'text-amber-400' };
      case 'super_admin':
        return { title: 'Zuno Business', badge: 'Super Admin Suite', bg: 'bg-brand-700', text: 'text-gold-400' };
      default:
        return { title: 'Zuno Business', badge: 'Enterprise Operations', bg: 'bg-brand-700', text: 'text-gold-400' };
    }
  };

  const branding = getRoleBranding();

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-charcoal-900 text-white p-4 flex items-center justify-between border-b border-gold-600/30">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${branding.bg} flex items-center justify-center text-white shadow-sm`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-base">{branding.title}</span>
            <span className={`text-[10px] block ${branding.text} uppercase font-bold tracking-wider`}>
              {branding.badge}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 text-gray-300 hover:text-white"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-charcoal-900 text-cream-200 border-r border-gold-600/20 flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo / Header */}
          <div className="hidden md:flex items-center gap-2.5 pb-4 border-b border-white/10">
            <div className={`w-10 h-10 rounded-xl ${branding.bg} flex items-center justify-center text-white shadow-sm border border-white/15`}>
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-white tracking-tight leading-none block">
                {branding.title}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${branding.text} mt-1 block`}>
                {branding.badge}
              </span>
            </div>
          </div>

          {/* Active User Persona */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${branding.bg} flex items-center justify-center font-black text-sm text-white shadow-xs`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Staff User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-300">
                  {role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3 block mb-1">
              Authorized Modules
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? `${branding.bg} text-white shadow-sm ring-1 ring-white/20`
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sync Status Note */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-gold-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Database Live
              </span>
              <span className="text-emerald-400 font-mono">CONNECTED</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Shared real-time supply chain database. All actions are logged.
            </p>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-white/10 space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gold-400 group-hover:scale-110 transition" />
              <span>Customer Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/business/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
