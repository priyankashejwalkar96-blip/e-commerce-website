"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Package, User as UserIcon, Heart, LogOut, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Order } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountDashboardPage() {
  const router = useRouter();
  const { user, profile, isAdmin, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setOrders(data as Order[]);
      } catch {
        // Handle error
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (authLoading || !user) {
    return <div className="py-20 text-center text-secondary-text">Loading account...</div>;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-white rounded-3xl border border-black/5 shadow-card gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent font-bold text-2xl flex items-center justify-center border border-accent/20">
            {profile?.full_name ? profile.full_name[0].toUpperCase() : user.email?.[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary-text">
              Welcome back, {profile?.full_name || user.email}
            </h1>
            <p className="text-xs text-secondary-text mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="secondary" className="border-accent/30 text-accent hover:bg-accent hover:text-white">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Account Tabs / Orders List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <h2 className="font-serif text-2xl font-bold text-primary-text flex items-center gap-2">
            <Package className="w-5 h-5 text-accent" />
            Order History ({orders.length})
          </h2>
          <Link href="/account/wishlist" className="text-xs font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-1">
            <Heart className="w-4 h-4" />
            Saved Wishlist
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-xs text-secondary-text animate-pulse">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-black/5 shadow-card p-8 space-y-3">
            <ShoppingBag className="w-12 h-12 text-secondary-text mx-auto" />
            <h3 className="font-serif text-xl font-bold text-primary-text">No Orders Found</h3>
            <p className="text-xs text-secondary-text max-w-sm mx-auto">You have not placed any orders yet.</p>
            <Link href="/products">
              <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="p-6 bg-white rounded-2xl border border-black/5 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/5 text-xs">
                  <div>
                    <span className="font-bold text-sm text-primary-text">#{order.order_number}</span>
                    <span className="text-secondary-text ml-3">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                      order.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      Payment: {order.payment_status}
                    </span>
                    <span className="font-bold text-primary-text">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-primary-text">
                      <span>{item.title} x {item.quantity}</span>
                      <span className="font-semibold">{formatCurrency(item.line_total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
