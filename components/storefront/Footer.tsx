"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Instagram, Facebook, Twitter, Youtube, Check } from 'lucide-react';
import { SiteSettings } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export const Footer = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) setSettings(data as SiteSettings);
      } catch {
        // Fallback
      }
    };
    fetchSettings();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast('Please enter a valid email address', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('subscribers').insert({ email: email.trim() });
      if (error && error.code === '23505') {
        toast('You are already subscribed to our newsletter!', 'info');
      } else if (error) {
        toast('Failed to subscribe. Please try again.', 'error');
      } else {
        setSubscribed(true);
        toast('Thank you for subscribing to LUXE!', 'success');
        setEmail('');
      }
    } catch {
      toast('Failed to subscribe', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#EAE0D5] text-[#2C241E] pt-20 pb-12 border-t border-[#D9CBBC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Top Section: Newsletter & Brand Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#D9CBBC]">
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-block">
              {settings?.logo_url ? (
                <Image
                  src={settings.logo_url}
                  alt={settings?.site_name || 'LUXE'}
                  width={140}
                  height={45}
                  className="object-contain"
                />
              ) : (
                <span className="font-serif text-3xl font-black tracking-tight text-[#2C241E]">
                  {settings?.site_name || 'LUXE'}
                </span>
              )}
            </Link>
            <p className="text-[#6B5C50] text-sm max-w-sm leading-relaxed">
              {settings?.tagline ||
                'Crafting timeless essentials and contemporary designs for the discerning individual.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-[#2C241E]/80">
              {settings?.social_instagram && (
                <a
                  href={settings.social_instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#DFCFC0] hover:bg-[#D4C0AD] text-[#2C241E] transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#DFCFC0] hover:bg-[#D4C0AD] text-[#2C241E] transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.social_twitter && (
                <a
                  href={settings.social_twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#DFCFC0] hover:bg-[#D4C0AD] text-[#2C241E] transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings?.social_youtube && (
                <a
                  href={settings.social_youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#DFCFC0] hover:bg-[#D4C0AD] text-[#2C241E] transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-[#F6F0E8] p-8 rounded-3xl border border-[#D9CBBC] shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-[#2C241E] mb-2">
              Join the Private Client List
            </h3>
            <p className="text-xs text-[#6B5C50] mb-6">
              Subscribe to receive exclusive collection drops, private sales, and seasonal lookbooks.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-success text-sm font-semibold p-3 bg-success/10 rounded-xl border border-success/20">
                <Check className="w-4 h-4" />
                <span>You are subscribed to exclusive updates!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3.5 bg-white border border-[#D9CBBC] rounded-xl text-sm text-[#2C241E] placeholder:text-[#9E8E80] outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{submitting ? 'Subscribing...' : 'Subscribe'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-b border-[#D9CBBC] text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-widest text-[#2C241E] mb-4">Shop Collections</h4>
            <ul className="space-y-3 text-[#6B5C50]">
              <li>
                <Link href="/products" className="hover:text-[#2C241E] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?sort=newest" className="hover:text-[#2C241E] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?sort=best_selling" className="hover:text-[#2C241E] transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/products?sale=true" className="hover:text-[#2C241E] transition-colors">
                  Seasonal Sale
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-[#2C241E] mb-4">Customer Care</h4>
            <ul className="space-y-3 text-[#6B5C50]">
              <li>
                <Link href="/faq" className="hover:text-[#2C241E] transition-colors">
                  FAQ & Assistance
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#2C241E] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#2C241E] transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#2C241E] transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-[#2C241E] mb-4">About Brand</h4>
            <ul className="space-y-3 text-[#6B5C50]">
              <li>
                <Link href="/about" className="hover:text-[#2C241E] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/about#sustainability" className="hover:text-[#2C241E] transition-colors">
                  Craftsmanship
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#2C241E] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#2C241E] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-[#2C241E] mb-4">Contact Info</h4>
            <ul className="space-y-3 text-[#6B5C50]">
              <li>{settings?.contact_email || 'support@luxecommerce.com'}</li>
              <li>{settings?.contact_phone || '+1 (800) 555-0199'}</li>
              <li>{settings?.business_address || '100 Fashion Ave, New York, NY'}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#7A6B5F] gap-4">
          <p>© {new Date().getFullYear()} {settings?.site_name || 'LUXE'}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#2C241E] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#2C241E] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
