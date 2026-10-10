import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Common
import RoleSwitcherBanner from './components/common/RoleSwitcherBanner';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/customer/CartDrawer';

// Customer Pages
import Home from './pages/customer/Home';
import Catalogue from './pages/customer/Catalogue';
import ProductDetail from './pages/customer/ProductDetail';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import OrderDetail from './pages/customer/OrderDetail';
import OrdersHistory from './pages/customer/OrdersHistory';
import Profile from './pages/customer/Profile';
import Wishlist from './pages/customer/Wishlist';
import BrandStory from './pages/customer/BrandStory';
import Policies from './pages/customer/Policies';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Suite (Zuno Business)
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';
import AdminBatches from './pages/admin/AdminBatches';
import AdminProduction from './pages/admin/AdminProduction';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminExpenses from './pages/admin/AdminExpenses';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// Delivery Suite (Zuno Delivery)
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Route Protection wrapper
const RequireRole = ({ roles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return children;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Customer Layout Wrapper
function CustomerLayout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isDelivery = location.pathname.startsWith('/delivery');

  if (isAdmin || isDelivery) {
    return children;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            {/* Top Demo Switcher across all interfaces */}
            <RoleSwitcherBanner />

            <CustomerLayout>
              <Routes>
                {/* Customer Storefront */}
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                <Route path="/orders" element={<OrdersHistory />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/our-story" element={<BrandStory />} />
                <Route path="/policies" element={<Policies />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Zuno Delivery (Partner) */}
                <Route
                  path="/delivery"
                  element={
                    <RequireRole roles={['delivery_partner', 'admin', 'super_admin']}>
                      <DeliveryDashboard />
                    </RequireRole>
                  }
                />

                {/* Zuno Business (Admin) */}
                <Route
                  path="/admin"
                  element={
                    <RequireRole roles={['admin', 'super_admin', 'inventory_manager', 'production_manager', 'order_manager']}>
                      <AdminLayout />
                    </RequireRole>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="batches" element={<AdminBatches />} />
                  <Route path="production" element={<AdminProduction />} />
                  <Route path="suppliers" element={<AdminSuppliers />} />
                  <Route path="expenses" element={<AdminExpenses />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CustomerLayout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
