"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Coupon } from '@/types';

export const CartDrawer = () => {
  const {
    items,
    cartDrawerOpen,
    setCartDrawerOpen,
    removeItem,
    updateQuantity,
    subtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
  } = useCart();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast('Invalid or expired coupon code', 'error');
      } else {
        const coupon = data as Coupon;
        if (subtotal < coupon.min_order_amount) {
          toast(
            `Minimum order of ${formatCurrency(coupon.min_order_amount)} required for this coupon`,
            'error'
          );
        } else {
          applyCoupon(coupon);
          toast(`Coupon "${coupon.code}" applied successfully!`, 'success');
          setCouponCode('');
        }
      }
    } catch {
      toast('Failed to apply coupon', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-screen max-w-md bg-white shadow-drawer border-l border-black/5 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary-text" />
                  <h2 className="font-serif text-xl font-bold text-primary-text">
                    Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
                  </h2>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-1.5 rounded-full text-secondary-text hover:text-primary-text hover:bg-black/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center mb-4 text-secondary-text">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary-text mb-1">
                      Your bag is empty
                    </h3>
                    <p className="text-xs text-secondary-text max-w-xs mb-6">
                      Explore our refined collections and find your next elevated style staple.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setCartDrawerOpen(false)}
                    >
                      Explore Products
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                    className="space-y-4"
                  >
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => {
                        const price =
                          item.variant?.price ??
                          item.product.sale_price ??
                          item.product.price;
                        const imageUrl =
                          item.product.images?.[0]?.image_url || '/placeholder.jpg';

                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex gap-4 p-3 bg-background-secondary/50 rounded-xl border border-black/5 relative group"
                          >
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0">
                              <Image
                                src={imageUrl}
                                alt={item.product.title}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-medium text-sm text-primary-text line-clamp-1">
                                    {item.product.title}
                                  </h4>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-secondary-text hover:text-destructive p-1 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                {item.variant && (
                                  <p className="text-xs text-secondary-text mt-0.5">
                                    {item.variant.option_values
                                      .map((ov) => `${ov.option_name}: ${ov.value}`)
                                      .join(' / ')}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <span className="font-semibold text-sm text-primary-text">
                                  {formatCurrency(price * item.quantity)}
                                </span>

                                <div className="flex items-center border border-black/10 rounded-lg bg-white overflow-hidden">
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                    className="p-1 hover:bg-black/5 text-secondary-text transition-colors"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-2.5 text-xs font-semibold text-primary-text">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                    className="p-1 hover:bg-black/5 text-secondary-text transition-colors"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* Footer / Summary */}
              {items.length > 0 && (
                <div className="p-6 border-t border-black/5 bg-white space-y-4">
                  {/* Coupon */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-success/10 border border-success/20 rounded-xl text-xs text-success font-medium">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>
                          Coupon <strong>{appliedCoupon.code}</strong> applied (-
                          {formatCurrency(discountAmount)})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-secondary-text hover:text-destructive text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="PROMO CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-background-secondary border border-black/10 rounded-xl outline-none focus:border-accent"
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        isLoading={validatingCoupon}
                      >
                        Apply
                      </Button>
                    </form>
                  )}

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-secondary-text">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-primary-text">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-success font-medium">
                        <span>Discount</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-primary-text font-medium">
                        Calculated at checkout
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-black/5 text-base font-bold text-primary-text">
                      <span>Total</span>
                      <span>{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>

                  <Link href="/checkout" onClick={() => setCartDrawerOpen(false)}>
                    <Button variant="primary" className="w-full mt-2 group">
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
