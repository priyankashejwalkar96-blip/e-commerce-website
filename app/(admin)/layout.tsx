"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Globe,
  FolderTree,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/account/auth');
      } else if (!isAdmin) {
        // If logged in as customer, redirect to storefront home
        router.push('/');
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center text-sm font-semibold text-secondary-text">
        <ShieldCheck className="w-8 h-8 text-accent animate-bounce mb-2" />
        Authenticating Admin Privileges...
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Hero Banners', href: '/admin/hero', icon: Sliders },
    { name: 'Trust Badges', href: '/admin/features', icon: ShieldCheck },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    { name: 'Site Settings', href: '/admin/settings', icon: Settings },
    { name: 'SEO Settings', href: '/admin/seo', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-primary-text font-sans antialiased">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-white border-r border-black/10 flex flex-col justify-between transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="p-4 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-black text-white font-serif font-black flex items-center justify-center text-sm">
                  L
                </div>
                <span className="font-serif font-bold text-lg text-primary-text">LUXE Admin</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-black/5 text-secondary-text transition-colors mx-auto"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-secondary-text hover:bg-black/5 hover:text-primary-text'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Actions */}
        <div className="p-4 border-t border-black/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-secondary-text hover:text-accent hover:bg-accent/10 transition-all'
            )}
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!collapsed && <span>View Storefront</span>}
          </Link>

          <button
            onClick={signOut}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all'
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn('flex-1 min-h-screen transition-all duration-300 p-8', collapsed ? 'ml-20' : 'ml-64')}>
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
