"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Order, Product } from '@/types';

const MOCK_REVENUE_DATA = [
  { date: 'Sep 20', revenue: 1240 },
  { date: 'Sep 21', revenue: 1850 },
  { date: 'Sep 22', revenue: 2100 },
  { date: 'Sep 23', revenue: 1950 },
  { date: 'Sep 24', revenue: 2890 },
  { date: 'Sep 25', revenue: 3400 },
  { date: 'Sep 26', revenue: 3920 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 17350,
    totalOrders: 48,
    totalCustomers: 32,
    avgOrderValue: 361.45,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent orders
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        if (orderData && orderData.length > 0) setRecentOrders(orderData as Order[]);

        // Fetch low stock products
        const { data: stockData } = await supabase
          .from('products')
          .select('*')
          .lt('stock_quantity', 10)
          .order('stock_quantity', { ascending: true });
        if (stockData) setLowStockProducts(stockData as Product[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-text">Executive Dashboard</h1>
        <p className="text-xs text-secondary-text mt-1">Overview of store revenue, fulfillment, and inventory analytics.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-card space-y-2">
          <div className="flex justify-between items-center text-secondary-text">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-primary-text">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-success font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-card space-y-2">
          <div className="flex justify-between items-center text-secondary-text">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-primary-text">
            {stats.totalOrders}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-success font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.5% vs last month</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-card space-y-2">
          <div className="flex justify-between items-center text-secondary-text">
            <span className="text-xs font-bold uppercase tracking-wider">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-primary-text">
            {stats.totalCustomers}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-success font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.0% growth</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-card space-y-2">
          <div className="flex justify-between items-center text-secondary-text">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-primary-text">
            {formatCurrency(stats.avgOrderValue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-success font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.1% average</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-card space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-xl font-bold text-primary-text">Revenue Performance (30 Days)</h3>
            <p className="text-xs text-secondary-text">Daily gross sales tracking</p>
          </div>
          <span className="px-3 py-1 bg-background-secondary rounded-full text-xs font-bold text-primary-text">
            USD Currency
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_REVENUE_DATA}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} />
              <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-primary-text">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-wider text-accent hover:underline flex items-center gap-1">
              <span>All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/10 text-secondary-text uppercase font-bold tracking-wider">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {(recentOrders.length > 0 ? recentOrders : [
                  { id: '1', order_number: 'ORD-10048', email: 'elena@vogue.com', total: 495, payment_status: 'paid', fulfillment_status: 'pending' },
                  { id: '2', order_number: 'ORD-10047', email: 'marcus@design.io', total: 680, payment_status: 'paid', fulfillment_status: 'shipped' },
                  { id: '3', order_number: 'ORD-10046', email: 'sophia@aesop.com', total: 185, payment_status: 'pending', fulfillment_status: 'pending' },
                ]).map((order: any) => (
                  <tr key={order.id} className="hover:bg-background-secondary/40 transition-colors">
                    <td className="py-3.5 font-bold text-primary-text">#{order.order_number}</td>
                    <td className="py-3.5 text-secondary-text">{order.email}</td>
                    <td className="py-3.5 font-semibold text-primary-text">{formatCurrency(order.total)}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        order.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold uppercase text-[10px]">
                        {order.fulfillment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-serif text-xl font-bold text-primary-text">Low Stock Alerts</h3>
          </div>

          <div className="space-y-3">
            {(lowStockProducts.length > 0 ? lowStockProducts : [
              { id: '1', title: 'Italian Leather Weekender Bag', stock_quantity: 5, sku: 'BAG-003' },
              { id: '2', title: 'Architectural Ceramic Vessel', stock_quantity: 8, sku: 'HOME-002' },
            ]).map((prod: any) => (
              <div key={prod.id} className="p-3 bg-destructive/5 rounded-xl border border-destructive/20 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-primary-text line-clamp-1">{prod.title}</h5>
                  <span className="text-[10px] text-secondary-text">SKU: {prod.sku}</span>
                </div>
                <span className="px-2 py-1 bg-destructive text-white font-bold rounded-lg text-[10px]">
                  {prod.stock_quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
