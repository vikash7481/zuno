import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Home, LayoutGrid, ShoppingBag, PackageCheck, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { cartCount, setIsDrawerOpen } = useCart();

  // Hide on admin/delivery portals
  if (
    location.pathname.startsWith('/business') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/delivery')
  ) {
    return null;
  }

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      isActive: location.pathname === '/'
    },
    {
      name: 'Categories',
      path: '/products',
      icon: LayoutGrid,
      isActive: location.pathname.startsWith('/products') || location.pathname.startsWith('/catalogue')
    },
    {
      name: 'Cart',
      isCart: true,
      icon: ShoppingBag,
      isActive: false
    },
    {
      name: 'Orders',
      path: isAuthenticated ? '/orders' : '/login',
      icon: PackageCheck,
      isActive: location.pathname.startsWith('/orders')
    },
    {
      name: 'Account',
      path: isAuthenticated ? '/account' : '/login',
      icon: User,
      isActive: location.pathname === '/account' || location.pathname === '/login'
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-cream-300 pb-safe shadow-luxury transition-all select-none"
    >
      <div className="flex items-center justify-around h-15 px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCart) {
            return (
              <button
                key={item.name}
                onClick={() => setIsDrawerOpen(true)}
                className="flex flex-col items-center justify-center flex-1 py-1 text-charcoal-700 relative active:scale-95 transition"
                aria-label={`Open Cart (${cartCount} items)`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 text-qcGreen-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold mt-1 text-qcGreen-800">
                  Cart
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition relative active:scale-95 ${
                item.isActive ? 'text-qcPurple-800 font-black' : 'text-gray-500 font-medium hover:text-charcoal-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? 'text-qcPurple-800 stroke-[2.5]' : 'text-gray-500'}`} />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-qcPurple-800" />
                )}
              </div>
              <span className="text-[10px] mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
