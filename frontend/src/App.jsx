import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Customer Layout Elements
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/customer/CartDrawer';
import FloatingCartBar from './components/customer/FloatingCartBar';
import BottomNav from './components/common/BottomNav';

// Customer Storefront Pages (Zuno)
import Home from './pages/customer/Home';
import Catalogue from './pages/customer/Catalogue';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import OrderDetail from './pages/customer/OrderDetail';
import OrdersHistory from './pages/customer/OrdersHistory';
import Profile from './pages/customer/Profile';
import Wishlist from './pages/customer/Wishlist';
import BrandStory from './pages/customer/BrandStory';
import Policies from './pages/customer/Policies';
import AppIntroSplash from './components/common/AppIntroSplash';

// Customer Authentication
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Zuno Business Suite (Admin & Operations)
import BusinessLogin from './pages/business/BusinessLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';
import AdminProduction from './pages/admin/AdminProduction';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminExpenses from './pages/admin/AdminExpenses';
import BusinessDelivery from './pages/business/BusinessDelivery';
import AdminReports from './pages/admin/AdminReports';
import BusinessStaff from './pages/business/BusinessStaff';
import AdminSettings from './pages/admin/AdminSettings';
import BusinessThemes from './pages/business/BusinessThemes';

// Zuno Delivery Suite (Driver Partner App)
import DeliveryLogin from './pages/delivery/DeliveryLogin';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrderDetail from './pages/delivery/DeliveryOrderDetail';

// Customer Route Protection
const RequireCustomerAuth = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Business Suite Role Protection
const RequireBusinessRole = ({ allowedRoles = [], children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/business/login" replace />;

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
    return <Navigate to="/business/login" replace />;
  }

  if (allowedRoles.length && user.role !== 'super_admin' && !allowedRoles.includes(user.role)) {
    // Redirect to permitted workspace
    if (user.role === 'inventory_manager') return <Navigate to="/business/inventory" replace />;
    if (user.role === 'production_manager') return <Navigate to="/business/production" replace />;
    if (user.role === 'order_manager') return <Navigate to="/business/orders" replace />;
    if (user.role === 'delivery_manager') return <Navigate to="/business/delivery" replace />;
    return <Navigate to="/business/dashboard" replace />;
  }

  return children;
};

// Delivery Partner Route Protection
const RequireDeliveryRole = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/delivery/login" replace />;
  if (user.role !== 'delivery_partner' && user.role !== 'super_admin' && user.role !== 'delivery_manager') {
    return <Navigate to="/delivery/login" replace />;
  }
  return children;
};

// Customer Layout Wrapper
function CustomerLayout({ children }) {
  const location = useLocation();
  const isBusiness =
    location.pathname.startsWith('/business') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/inventory') ||
    location.pathname.startsWith('/production');
  const isDelivery = location.pathname.startsWith('/delivery');

  if (isBusiness || isDelivery) {
    return children;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 md:pb-16">
      <AppIntroSplash />
      <Navbar />
      <CartDrawer />
      <FloatingCartBar />
      <main className="flex-1">{children}</main>
      <BottomNav />
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
            <CustomerLayout>
              <Routes>
                {/* ========================================= */}
                {/* 1. ZUNO — CUSTOMER SHOPPING APPLICATION   */}
                {/* ========================================= */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Catalogue />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                <Route
                  path="/account"
                  element={
                    <RequireCustomerAuth>
                      <Profile />
                    </RequireCustomerAuth>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <RequireCustomerAuth>
                      <OrdersHistory />
                    </RequireCustomerAuth>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <RequireCustomerAuth>
                      <OrderDetail />
                    </RequireCustomerAuth>
                  }
                />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/our-story" element={<BrandStory />} />
                <Route path="/policies" element={<Policies />} />

                {/* Customer Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Backward compatibility redirects for customer storefront */}
                <Route path="/catalogue" element={<Navigate to="/products" replace />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/profile" element={<Navigate to="/account" replace />} />

                {/* ========================================= */}
                {/* 2. ZUNO DELIVERY — DRIVER PARTNER APP     */}
                {/* ========================================= */}
                <Route path="/delivery/login" element={<DeliveryLogin />} />
                <Route
                  path="/delivery"
                  element={
                    <RequireDeliveryRole>
                      <DeliveryDashboard />
                    </RequireDeliveryRole>
                  }
                />
                <Route
                  path="/delivery/dashboard"
                  element={
                    <RequireDeliveryRole>
                      <DeliveryDashboard />
                    </RequireDeliveryRole>
                  }
                />
                <Route
                  path="/delivery/orders/:id"
                  element={
                    <RequireDeliveryRole>
                      <DeliveryOrderDetail />
                    </RequireDeliveryRole>
                  }
                />

                {/* ========================================= */}
                {/* 3. ZUNO BUSINESS — ENTERPRISE ADMIN SUITE */}
                {/* ========================================= */}
                <Route path="/business/login" element={<BusinessLogin />} />
                <Route
                  path="/business"
                  element={
                    <RequireBusinessRole>
                      <AdminLayout />
                    </RequireBusinessRole>
                  }
                >
                  <Route index element={<Navigate to="/business/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin']}>
                        <AdminDashboard />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="products"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin']}>
                        <AdminProducts />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin', 'order_manager', 'delivery_manager']}>
                        <AdminOrders />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="inventory"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin', 'inventory_manager', 'production_manager']}>
                        <AdminInventory />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="production"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin', 'production_manager']}>
                        <AdminProduction />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="suppliers"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin', 'inventory_manager']}>
                        <AdminSuppliers />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="purchases"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin', 'inventory_manager']}>
                        <AdminSuppliers />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="expenses"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin']}>
                        <AdminExpenses />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="delivery"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin', 'delivery_manager', 'order_manager']}>
                        <BusinessDelivery />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="reports"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin']}>
                        <AdminReports />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="staff"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin']}>
                        <BusinessStaff />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin']}>
                        <AdminSettings />
                      </RequireBusinessRole>
                    }
                  />
                  <Route
                    path="themes"
                    element={
                      <RequireBusinessRole allowedRoles={['super_admin', 'admin']}>
                        <BusinessThemes />
                      </RequireBusinessRole>
                    }
                  />
                </Route>

                {/* Legacy /admin and /inventory /production redirects to /business */}
                <Route path="/admin" element={<Navigate to="/business/dashboard" replace />} />
                <Route path="/admin/*" element={<Navigate to="/business/dashboard" replace />} />
                <Route path="/inventory" element={<Navigate to="/business/inventory" replace />} />
                <Route path="/inventory/*" element={<Navigate to="/business/inventory" replace />} />
                <Route path="/production" element={<Navigate to="/business/production" replace />} />
                <Route path="/production/*" element={<Navigate to="/business/production" replace />} />
                <Route path="/portals" element={<Navigate to="/business/login" replace />} />
                <Route path="/portal" element={<Navigate to="/business/login" replace />} />

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
