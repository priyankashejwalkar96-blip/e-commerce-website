"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export const FlyingCartImage = () => {
  const { flyingAnim, clearFlyingAnim } = useCart();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (flyingAnim) {
      const cartIconEl = document.getElementById('header-cart-icon');
      if (cartIconEl) {
        setTargetRect(cartIconEl.getBoundingClientRect());
      } else {
        // Fallback target (top right)
        setTargetRect(new DOMRect(window.innerWidth - 60, 20, 40, 40));
      }
    }
  }, [flyingAnim]);

  if (!flyingAnim || !targetRect) return null;

  const { startRect, imageUrl } = flyingAnim;

  return (
    <AnimatePresence onExitComplete={clearFlyingAnim}>
      <motion.div
        key="flying-cart-item"
        initial={{
          top: startRect.top,
          left: startRect.left,
          width: startRect.width,
          height: startRect.height,
          opacity: 1,
          scale: 1,
          rotate: 0,
        }}
        animate={{
          top: targetRect.top + 8,
          left: targetRect.left + 8,
          width: 32,
          height: 32,
          opacity: 0.2,
          scale: 0.3,
          rotate: 15,
        }}
        transition={{
          duration: 0.75,
          ease: [0.4, 0, 0.2, 1],
        }}
        onAnimationComplete={() => {
          clearFlyingAnim();
          // Dispatch cart bounce event
          window.dispatchEvent(new CustomEvent('cart-bounce'));
        }}
        className="fixed z-50 pointer-events-none rounded-xl overflow-hidden shadow-2xl border-2 border-accent"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </AnimatePresence>
  );
};
