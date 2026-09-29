"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-10001';

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-8">
      {/* Animated Checkmark */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full bg-success/10 border-2 border-success flex items-center justify-center text-success shadow-card"
        >
          <motion.svg
            className="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-success">Payment Confirmed</span>
        <h1 className="font-serif text-4xl font-bold text-primary-text">Thank You for Your Order</h1>
        <p className="text-xs text-secondary-text max-w-sm mx-auto">
          We have received your order <strong>#{orderId}</strong> and are preparing your items with precision.
        </p>
      </div>

      <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-card text-left space-y-4 max-w-md mx-auto">
        <h3 className="font-serif text-lg font-bold text-primary-text border-b border-black/5 pb-2">Order Status</h3>
        <div className="space-y-2 text-xs text-secondary-text">
          <div className="flex justify-between">
            <span>Order Reference:</span>
            <span className="font-bold text-primary-text">#{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Delivery:</span>
            <span className="font-semibold text-primary-text">3–5 Business Days</span>
          </div>
          <div className="flex justify-between">
            <span>Confirmation Sent To:</span>
            <span className="font-semibold text-primary-text">Your Email</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href="/products">
          <Button variant="primary" size="lg" className="w-full sm:w-auto">
            <ShoppingBag className="w-4 h-4 mr-2" />
            <span>Continue Shopping</span>
          </Button>
        </Link>
        <Link href="/account">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <span>View Order History</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-secondary-text">Loading order confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
