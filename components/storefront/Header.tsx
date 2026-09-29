"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, User, Heart, Menu, X, ShieldAlert } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { SearchModal } from '@/components/storefront/SearchModal';
import { SiteSettings } from '@/types';
import { supabase } from '@/lib/supabase';

export const Header = () => {
  const { itemCount, setCartDrawerOpen } = useCart();
  const { user, profile, isAdmin } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleBounce = () => {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 500);
    };
    window.addEventListener('cart-bounce', handleBounce);
    return () => window.removeEventListener('cart-bounce', handleBounce);
  }, []);

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

  const navLinks = [
    { name: 'Shop All', href: '/products' },
    { name: 'New Arrivals', href: '/products?sort=newest' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      {settings?.announcement_bar_active !== false && (
        <div
          className="text-white text-[11px] font-semibold tracking-wider uppercase py-2 px-4 text-center transition-colors relative z-40"
          style={{
            backgroundColor: settings?.announcement_bar_color || '#1A1A1A',
          }}
        >
          {settings?.announcement_bar_link ? (
            <Link href={settings.announcement_bar_link} className="hover:underline">
              {settings?.announcement_bar_text || 'Complimentary Express Shipping on Orders Over $150'}
            </Link>
          ) : (
            <span>
              {settings?.announcement_bar_text || 'Complimentary Express Shipping on Orders Over $150'}
            </span>
          )}
        </div>
      )}

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-black/5'
            : 'h-20 bg-white border-b border-black/5'
        }`}
      >
        <div className="relative max-w-[1440px] h-full mx-auto px-6 md:px-16 flex items-center justify-between">
          {/* Left Side: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-primary-text hover:text-accent"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              {settings?.logo_url ? (
                <Image
                  src={settings.logo_url}
                  alt={settings.site_name}
                  width={120}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="font-serif text-2xl font-black tracking-tight text-primary-text">
                  {settings?.site_name || 'LUXE'}
                </span>
              )}
            </Link>
          </div>

          {/* Middle: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-widest text-primary-text/80 hover:text-accent transition-colors relative group py-1"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-5">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-primary-text hover:text-accent transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account / Admin Link */}
            {user ? (
              <div className="relative group">
                <Link
                  href={isAdmin ? '/admin' : '/account'}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary-text hover:text-accent"
                >
                  <div className="w-8 h-8 rounded-full bg-background-secondary border border-black/10 flex items-center justify-center font-bold text-accent">
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                href="/account/auth"
                className="p-2 text-primary-text hover:text-accent transition-colors hidden sm:block"
                title="Account"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Admin Quick Switch Pill if admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[11px] font-bold text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* Wishlist Link */}
            <Link
              href="/account/wishlist"
              className="p-2 text-primary-text hover:text-accent transition-colors hidden sm:block"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Icon with Spring Bounce */}
            <motion.button
              id="header-cart-icon"
              onClick={() => setCartDrawerOpen(true)}
              animate={cartBounce ? { scale: [1, 1.3, 0.95, 1] } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="relative p-2 text-primary-text hover:text-accent transition-colors"
              title="Cart Drawer"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={itemCount}
                  className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-6"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <span className="font-serif text-2xl font-bold text-primary-text">
                {settings?.site_name || 'LUXE'}
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-primary-text"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 my-auto">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-serif text-3xl font-bold text-primary-text hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-6 border-t border-black/5 flex flex-col gap-4">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-primary-text flex items-center gap-2"
                >
                  <User className="w-5 h-5 text-accent" />
                  My Account
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-primary-text flex items-center gap-2"
                >
                  <Heart className="w-5 h-5 text-accent" />
                  Wishlist
                </Link>
              </div>
            </nav>

            <div className="text-center text-xs text-secondary-text border-t border-black/5 pt-4">
              © {new Date().getFullYear()} {settings?.site_name || 'LUXE'}. All rights reserved.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
