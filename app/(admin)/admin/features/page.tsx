"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  ShieldCheck,
  Truck,
  RefreshCw,
  Award,
  Clock,
  Headphones,
  Lock,
  Gift,
  Sparkles,
  Package,
  Heart,
  Zap,
  CheckCircle,
  CreditCard,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StoreFeature } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Truck,
  RefreshCw,
  ShieldCheck,
  Award,
  Clock,
  Headphones,
  Lock,
  Gift,
  Sparkles,
  Package,
  Heart,
  Zap,
  CheckCircle,
  CreditCard,
};

const DEFAULT_FEATURES: Omit<StoreFeature, 'id'>[] = [
  {
    icon_name: 'Truck',
    title: 'Express Delivery',
    description: 'Complimentary shipping over $150',
    sort_order: 1,
    is_active: true,
  },
  {
    icon_name: 'RefreshCw',
    title: '30-Day Guarantee',
    description: 'Hassle-free returns & exchanges',
    sort_order: 2,
    is_active: true,
  },
  {
    icon_name: 'ShieldCheck',
    title: 'Encrypted Checkout',
    description: 'Secured with Razorpay 256-bit',
    sort_order: 3,
    is_active: true,
  },
  {
    icon_name: 'Award',
    title: 'Master Craftsmanship',
    description: 'Ethically sourced natural materials',
    sort_order: 4,
    is_active: true,
  },
];

export default function AdminFeaturesPage() {
  const { toast } = useToast();
  const [features, setFeatures] = useState<StoreFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<StoreFeature | null>(null);

  const [form, setForm] = useState({
    icon_name: 'Truck',
    image_url: '',
    title: '',
    description: '',
    sort_order: 1,
    is_active: true,
  });

  const sqlScript = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS store_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon_name TEXT DEFAULT 'Truck' NOT NULL,
  image_url TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

INSERT INTO store_features (icon_name, title, description, sort_order, is_active)
VALUES
  ('Truck', 'Express Delivery', 'Complimentary shipping over $150', 1, true),
  ('RefreshCw', '30-Day Guarantee', 'Hassle-free returns & exchanges', 2, true),
  ('ShieldCheck', 'Encrypted Checkout', 'Secured with Razorpay 256-bit', 3, true),
  ('Award', 'Master Craftsmanship', 'Ethically sourced natural materials', 4, true)
ON CONFLICT DO NOTHING;`;

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_features')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        if (error.message?.includes('schema cache') || error.message?.includes('does not exist') || error.code === '42P01') {
          setTableMissing(true);
        } else {
          toast(error.message, 'error');
        }
      } else if (data) {
        setFeatures(data as StoreFeature[]);
        setTableMissing(false);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFeature(null);
    setForm({
      icon_name: 'Truck',
      image_url: '',
      title: 'Express Delivery',
      description: 'Complimentary shipping over $150',
      sort_order: features.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (feature: StoreFeature) => {
    setEditingFeature(feature);
    setForm({
      icon_name: feature.icon_name || 'Truck',
      image_url: feature.image_url || '',
      title: feature.title,
      description: feature.description,
      sort_order: feature.sort_order,
      is_active: feature.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast('Title and Description are required', 'error');
      return;
    }

    try {
      if (editingFeature) {
        const { error } = await supabase
          .from('store_features')
          .update({
            icon_name: form.icon_name,
            image_url: form.image_url.trim() || null,
            title: form.title.trim(),
            description: form.description.trim(),
            sort_order: Number(form.sort_order),
            is_active: form.is_active,
          })
          .eq('id', editingFeature.id);

        if (error) throw error;
        toast('Trust badge updated successfully!', 'success');
      } else {
        const { error } = await supabase.from('store_features').insert({
          icon_name: form.icon_name,
          image_url: form.image_url.trim() || null,
          title: form.title.trim(),
          description: form.description.trim(),
          sort_order: Number(form.sort_order),
          is_active: form.is_active,
        });

        if (error) throw error;
        toast('Trust badge created successfully!', 'success');
      }

      setIsModalOpen(false);
      fetchFeatures();
    } catch (err: any) {
      console.error('Error saving trust badge:', err);
      toast(
        err?.message ||
          'Failed to save. If relation does not exist, run the SQL setup script in Supabase.',
        'error'
      );
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete trust badge "${title}"?`)) return;
    try {
      const { error } = await supabase.from('store_features').delete().eq('id', id);
      if (error) throw error;
      toast('Trust badge deleted', 'success');
      fetchFeatures();
    } catch (err: any) {
      toast(err?.message || 'Failed to delete badge', 'error');
    }
  };

  const handleToggleActive = async (feature: StoreFeature) => {
    try {
      const { error } = await supabase
        .from('store_features')
        .update({ is_active: !feature.is_active })
        .eq('id', feature.id);

      if (error) throw error;
      toast(`Trust badge ${!feature.is_active ? 'activated' : 'hidden'}`, 'info');
      fetchFeatures();
    } catch (err: any) {
      toast(err?.message || 'Failed to update status', 'error');
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('Seed database with 4 default storefront trust badges?')) return;
    try {
      const { error } = await supabase.from('store_features').insert(DEFAULT_FEATURES);
      if (error) throw error;
      toast('Default trust badges seeded successfully!', 'success');
      fetchFeatures();
    } catch (err: any) {
      toast(
        err?.message ||
          'Failed to seed default badges. Please check if table store_features exists in Supabase.',
        'error'
      );
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    toast('SQL Script copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Trust Badges & Store Features</h1>
          <p className="text-xs text-secondary-text mt-1">
            Configure the 4 feature cards displayed below the main hero section (Delivery, Guarantee, Security, Craftsmanship).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleSeedDefaults}>
            <Sparkles className="w-4 h-4 mr-2 text-accent" />
            <span>Seed Default Badges</span>
          </Button>
          <Button variant="primary" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            <span>Add New Badge</span>
          </Button>
        </div>
      </div>

      {/* Table Missing Warning Banner */}
      {tableMissing && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <span>⚡ Database Setup Required in Supabase</span>
              </h3>
              <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
                The table <code className="bg-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold">store_features</code> has not been created in your Supabase project yet. Copy the SQL script below and run it in your <strong>Supabase Dashboard &gt; SQL Editor</strong> to enable database persistence.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>
          </div>
          <pre className="p-4 bg-black/90 text-amber-200 text-[11px] font-mono rounded-2xl overflow-x-auto border border-black/20">
            {sqlScript}
          </pre>
        </div>
      )}

      {/* Feature Badges Cards Grid */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-card p-6">
        {loading ? (
          <div className="py-20 text-center text-xs text-secondary-text animate-pulse">
            Loading trust badges...
          </div>
        ) : features.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-secondary-text mx-auto" />
            <div>
              <h3 className="font-serif text-xl font-bold text-primary-text">No Trust Badges Configured</h3>
              <p className="text-xs text-secondary-text mt-1">
                Click "Seed Default Badges" to add default features to your storefront homepage.
              </p>
            </div>
            <Button variant="primary" onClick={handleSeedDefaults}>
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Seed Default Badges</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const IconComponent = ICON_MAP[feature.icon_name] || Truck;
              return (
                <div
                  key={feature.id}
                  className="p-5 rounded-2xl border border-black/10 bg-background-secondary/30 flex flex-col justify-between space-y-4 transition-all hover:border-black/20 hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-black/10 flex items-center justify-center text-accent shadow-sm overflow-hidden p-2">
                        {feature.image_url ? (
                          <img
                            src={feature.image_url}
                            alt={feature.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <IconComponent className="w-6 h-6" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-secondary-text">#{feature.sort_order}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-primary-text">{feature.title}</h4>
                      <p className="text-xs text-secondary-text mt-1 line-clamp-2">{feature.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-black/10">
                    <button
                      onClick={() => handleToggleActive(feature)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors flex items-center gap-1.5 ${
                        feature.is_active
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-black/5 text-secondary-text border border-black/10'
                      }`}
                    >
                      {feature.is_active ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(feature)}
                        className="p-1.5 rounded-lg text-secondary-text hover:text-accent hover:bg-accent/10 transition-colors"
                        title="Edit Badge"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(feature.id, feature.title)}
                        className="p-1.5 rounded-lg text-secondary-text hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete Badge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFeature ? 'Edit Trust Badge' : 'Add New Trust Badge'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-primary-text mb-2">Select Built-in Icon</label>
            <div className="grid grid-cols-7 gap-2">
              {Object.keys(ICON_MAP).map((iconKey) => {
                const IconComp = ICON_MAP[iconKey];
                const isSelected = form.icon_name === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setForm({ ...form, icon_name: iconKey })}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20'
                        : 'border-black/10 text-secondary-text hover:border-black/20 hover:text-primary-text'
                    }`}
                    title={iconKey}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Or Custom SVG / Image URL (Optional)"
            type="text"
            placeholder="https://example.com/icon.svg"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />

          <Input
            label="Badge Title"
            type="text"
            placeholder="Express Delivery"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <Input
            label="Description / Subtext"
            type="text"
            placeholder="Complimentary shipping over $150"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />

          <Input
            label="Sort Order"
            type="number"
            value={String(form.sort_order)}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 1 })}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="feature_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded border-black/20 text-accent focus:ring-accent"
            />
            <label htmlFor="feature_active" className="text-xs font-semibold text-primary-text">
              Visible on storefront home page
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <span>{editingFeature ? 'Save Changes' : 'Create Badge'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
