"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Lock, CreditCard, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const shippingCost = subtotal > 150 ? 0 : 15;
  const taxAmount = (subtotal - discountAmount) * 0.085;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost + taxAmount);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-primary-text">Your Cart is Empty</h1>
        <p className="text-xs text-secondary-text">Add items to your cart before proceeding to checkout.</p>
        <Button variant="primary" onClick={() => router.push('/products')}>
          Explore Products
        </Button>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.addressLine1 || !formData.city || !formData.zip) {
      toast('Please complete all required shipping fields', 'error');
      return;
    }
    setStep('payment');
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // 1. Call server API to create Razorpay Order
      const res = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create payment intent');

      // 2. Open Razorpay Checkout modal
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'LUXE Commerce',
        description: 'Luxury Order Payment',
        order_id: data.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#1A1A1A' },
        handler: async function (response: any) {
          // Payment Success Handler -> Save order to Supabase
          try {
            const { data: orderRes, error: orderErr } = await supabase
              .from('orders')
              .insert({
                user_id: user?.id || null,
                email: formData.email,
                shipping_address: formData,
                shipping_method: 'Standard Express',
                shipping_cost: shippingCost,
                subtotal: subtotal,
                discount_amount: discountAmount,
                tax_amount: taxAmount,
                total: finalTotal,
                payment_status: 'paid',
                fulfillment_status: 'pending',
                razorpay_payment_id: response.razorpay_payment_id,
              })
              .select()
              .single();

            if (orderErr) throw orderErr;

            // Insert order items
            if (orderRes) {
              const orderItemsData = items.map((item) => ({
                order_id: orderRes.id,
                product_id: item.product.id,
                variant_id: item.variant?.id || null,
                title: item.product.title,
                quantity: item.quantity,
                unit_price: item.variant?.price ?? item.product.sale_price ?? item.product.price,
                line_total: (item.variant?.price ?? item.product.sale_price ?? item.product.price) * item.quantity,
              }));
              await supabase.from('order_items').insert(orderItemsData);

              clearCart();
              toast('Order placed successfully!', 'success');
              router.push(`/checkout/confirmation?orderId=${orderRes.order_number}`);
            }
          } catch (err: any) {
            toast('Failed to record order. Please contact support.', 'error');
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      toast(err.message || 'Payment processing failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 space-y-8">
      {/* Checkout Progress Indicator */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto text-xs font-semibold uppercase tracking-widest">
        <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-accent font-bold' : 'text-primary-text'}`}>
          <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">1</div>
          <span>Shipping</span>
        </div>
        <div className="w-12 h-0.5 bg-black/10" />
        <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-accent font-bold' : 'text-secondary-text'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-accent text-white' : 'bg-black/10 text-secondary-text'}`}>2</div>
          <span>Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form Panel */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-6">
          {step === 'shipping' ? (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary-text flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                Shipping Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
                <Input
                  label="Email Address *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <Input
                label="Phone Number *"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />

              <Input
                label="Address Line 1 *"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              />

              <Input
                label="Address Line 2 (Apartment, Suite, etc.)"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City *"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
                <Input
                  label="State / Province *"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
                <Input
                  label="Zip Code *"
                  value={formData.zip}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full mt-4">
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-primary-text flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                Payment Method
              </h2>

              <div className="p-4 bg-background-secondary rounded-2xl border border-black/5 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-primary-text">
                  <span>Ship To:</span>
                  <button onClick={() => setStep('shipping')} className="text-accent hover:underline">Edit</button>
                </div>
                <p className="text-secondary-text">{formData.fullName}, {formData.addressLine1}, {formData.city}, {formData.zip}</p>
              </div>

              <div className="p-6 border-2 border-accent/40 bg-accent/5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-primary-text flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    Razorpay Encrypted Payment
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent text-white px-2 py-0.5 rounded">
                    Secure
                  </span>
                </div>
                <p className="text-xs text-secondary-text">
                  Supports Cards, UPI, NetBanking, and Digital Wallets. You will complete payment via Razorpay's secure dialog.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full text-base h-14"
                isLoading={loading}
                onClick={handleRazorpayPayment}
              >
                <Lock className="w-4 h-4 mr-2" />
                <span>Pay {formatCurrency(finalTotal)} with Razorpay</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-6">
          <h3 className="font-serif text-xl font-bold text-primary-text border-b border-black/5 pb-4">
            Order Summary ({items.length} items)
          </h3>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {items.map((item) => {
              const price = item.variant?.price ?? item.product.sale_price ?? item.product.price;
              const img = item.product.images?.[0]?.image_url || '/placeholder.jpg';
              return (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-background-secondary shrink-0 border border-black/5">
                    <Image src={img} alt={item.product.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-medium text-xs text-primary-text truncate">{item.product.title}</h4>
                    <p className="text-[11px] text-secondary-text">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-xs text-primary-text">{formatCurrency(price * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 pt-4 border-t border-black/5 text-xs text-secondary-text">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-primary-text">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-success font-medium">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="text-primary-text font-medium">{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="text-primary-text font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-black/5 text-base font-bold text-primary-text">
              <span>Total</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
