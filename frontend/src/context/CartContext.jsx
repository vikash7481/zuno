import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('zuno_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { info } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem('zuno_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  const addToCart = (product, variant, quantity = 1, openDrawer = false) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.variant.sku === variant.sku);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images?.[0] || '',
            category: product.category
          },
          variant: {
            sku: variant.sku,
            packSize: variant.packSize,
            flavor: variant.flavor,
            weightGrams: variant.weightGrams,
            mrp: variant.mrp,
            sellingPrice: variant.sellingPrice,
            availableStock: variant.availableStock
          },
          quantity
        }
      ];
    });

    info(`Added ${variant.flavor} (${variant.packSize})`);
    if (openDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const updateQuantity = (variantSku, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(variantSku);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.variant.sku === variantSku ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (variantSku) => {
    setCartItems((prev) => prev.filter((item) => item.variant.sku !== variantSku));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.variant.sellingPrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
