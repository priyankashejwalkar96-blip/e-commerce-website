"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '@/types';

interface FlyingAnimData {
  startRect: DOMRect;
  imageUrl: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: ProductVariant, selectedOptions?: Record<string, string>, imageRef?: HTMLElement | null) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  discountAmount: number;
  flyingAnim: FlyingAnimData | null;
  clearFlyingAnim: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'luxe_cart_items';
const COUPON_STORAGE_KEY = 'luxe_applied_coupon';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [flyingAnim, setFlyingAnim] = useState<FlyingAnimData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch {
      // Ignore JSON parse errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    }
  }, [appliedCoupon, isInitialized]);

  const addItem = (
    product: Product,
    quantity = 1,
    variant?: ProductVariant,
    selectedOptions: Record<string, string> = {},
    imageRef?: HTMLElement | null
  ) => {
    const variantId = variant?.id || 'default';
    const itemId = `${product.id}_${variantId}`;

    if (imageRef) {
      const rect = imageRef.getBoundingClientRect();
      const imageUrl = product.images?.[0]?.image_url || '/placeholder.jpg';
      setFlyingAnim({ startRect: rect, imageUrl });
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prevItems,
        {
          id: itemId,
          product,
          variant,
          quantity,
          selectedOptions,
        },
      ];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearFlyingAnim = () => {
    setFlyingAnim(null);
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.sale_price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.min_order_amount) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        cartDrawerOpen,
        setCartDrawerOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        flyingAnim,
        clearFlyingAnim,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
