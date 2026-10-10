import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  CalendarDays,
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
  Sparkles
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, isRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products & Variants', path: '/admin/products', icon: Package },
    { name: 'Inventory & Stock', path: '/admin/inventory', icon: Boxes },
    { name: 'FEFO Batches & Expiry', path: '/admin/batches', icon: CalendarDays },
    { name: 'Production & Recipes', path: '/admin/production', icon: Factory },
    { name: 'Suppliers & Purchases', path: '/admin/suppliers', icon: Users },
    { name: 'Operating Expenses', path: '/admin/expenses', icon: Receipt },
    { name: 'Financial Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-charcoal-900 text-white p-4 flex items-center justify-between border-b border-gold-600/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-gold-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-base">Zuno Business</span>
            <span className="text-[10px] block text-gold-400 uppercase font-bold">Admin Operations</span>
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
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2.5 pb-4 border-b border-white/10">
            <div className="w-9 h-9 rounded-full bg-brand-700 flex items-center justify-center text-gold-400 border border-gold-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">Zuno Business</span>
              <span className="text-[10px] block uppercase font-bold tracking-wider text-gold-400">
                Enterprise Suite
              </span>
            </div>
          </div>

          {/* Active User Card */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-700 flex items-center justify-center font-bold text-sm text-gold-300">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-800 text-brand-200 inline-block border border-brand-500/30">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Nav Links */}
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
                      ? 'bg-brand-700 text-white shadow-sm ring-1 ring-gold-400/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
              <span>Customer Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
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
