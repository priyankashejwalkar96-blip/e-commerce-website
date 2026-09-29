"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Coupon } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '15',
    minOrderAmount: '100',
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (data) setCoupons(data as Coupon[]);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) return;

    try {
      await supabase.from('coupons').insert({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        min_order_amount: parseFloat(form.minOrderAmount) || 0,
        is_active: form.isActive,
      });
      toast('Coupon created successfully!', 'success');
      setIsModalOpen(false);
      fetchCoupons();
    } catch {
      toast('Failed to create coupon', 'error');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await supabase.from('coupons').delete().eq('id', id);
      toast('Coupon deleted', 'success');
      fetchCoupons();
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Coupon & Discount Management</h1>
          <p className="text-xs text-secondary-text mt-1">Configure promotional codes, percentage discounts, and order thresholds.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          <span>Create New Coupon</span>
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-secondary-text animate-pulse">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Tag className="w-12 h-12 text-secondary-text mx-auto" />
            <h3 className="font-serif text-xl font-bold text-primary-text">No Active Coupons</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-background-secondary/50 text-secondary-text uppercase font-bold tracking-wider">
                  <th className="p-4">Code</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Discount Value</th>
                  <th className="p-4">Min Spend</th>
                  <th className="p-4">Times Used</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-background-secondary/30 transition-colors">
                    <td className="p-4 font-bold text-primary-text uppercase tracking-wider font-mono">{c.code}</td>
                    <td className="p-4 text-secondary-text capitalize font-semibold">{c.type}</td>
                    <td className="p-4 font-bold text-primary-text">
                      {c.type === 'percentage' ? `${c.value}% OFF` : formatCurrency(c.value)}
                    </td>
                    <td className="p-4 text-secondary-text">{formatCurrency(c.min_order_amount)}</td>
                    <td className="p-4 font-semibold text-primary-text">{c.times_used}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                        c.is_active ? 'bg-success/10 text-success' : 'bg-black/10 text-secondary-text'
                      }`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(c.id, c.code)} className="p-1.5 hover:bg-destructive/10 text-secondary-text hover:text-destructive rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Coupon Code">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Promo Code (e.g. LUXE15) *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary-text">Discount Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="h-13 px-4 bg-white border border-black/15 rounded-xl text-sm font-medium outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <Input label="Value *" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </div>
          <Input label="Minimum Order Spend ($)" type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
          <Button type="submit" variant="primary" className="w-full">Create Coupon</Button>
        </form>
      </Modal>
    </div>
  );
}
