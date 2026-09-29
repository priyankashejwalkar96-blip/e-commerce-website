"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Save, Image as ImageIcon, Bell, Globe, Mail, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { SiteSettings } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<SiteSettings>>({
    site_name: 'LUXE',
    tagline: 'Curated Luxury Essentials',
    logo_url: '',
    logo_inverted_url: '',
    contact_email: 'support@luxecommerce.com',
    contact_phone: '+1 (800) 555-0199',
    business_address: '100 Fashion Ave, New York, NY 10001',
    currency_code: 'USD',
    currency_symbol: '$',
    announcement_bar_active: true,
    announcement_bar_text: 'Complimentary Express Shipping on Orders Over $150',
    announcement_bar_link: '/products',
    announcement_bar_color: '#1A1A1A',
    social_instagram: 'https://instagram.com',
    social_facebook: 'https://facebook.com',
    social_twitter: 'https://twitter.com',
    promo_banner_active: true,
    promo_banner_badge: 'LIMITED TIME EVENT',
    promo_banner_title: 'The Private Seasonal Sale: Up to 30% Off',
    promo_banner_subtitle: 'Enjoy exclusive savings on selected archival outerwear, leather footwear, and minimalist timepieces.',
    promo_banner_button_text: 'Shop Private Sale',
    promo_banner_button_link: '/products?sale=true',
    promo_banner_image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) setForm(data as SiteSettings);
      } catch {
        // Keep default
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        const { error } = await supabase.from('site_settings').update(form).eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert(form);
        if (error) throw error;
      }
      toast('Brand & site settings saved successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-secondary-text animate-pulse">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Brand & Site Settings</h1>
          <p className="text-xs text-secondary-text mt-1">Customize global storefront branding, logo assets, and announcement bars.</p>
        </div>
        <Button type="submit" variant="primary" isLoading={saving}>
          <Save className="w-4 h-4 mr-2" />
          <span>Save Changes</span>
        </Button>
      </div>

      {/* Brand Identity Card */}
      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-6">
        <h3 className="font-serif text-xl font-bold text-primary-text flex items-center gap-2 border-b border-black/5 pb-4">
          <ImageIcon className="w-5 h-5 text-accent" />
          Brand Identity & Logos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Site Name *"
            value={form.site_name || ''}
            onChange={(e) => setForm({ ...form, site_name: e.target.value })}
          />
          <Input
            label="Tagline"
            value={form.tagline || ''}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary Logo URL (Light Background)"
            value={form.logo_url || ''}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
          />
          <Input
            label="Inverted Logo URL (Dark Footer)"
            value={form.logo_inverted_url || ''}
            onChange={(e) => setForm({ ...form, logo_inverted_url: e.target.value })}
          />
        </div>
      </div>

      {/* Announcement Bar Settings Card */}
      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-6">
        <div className="flex justify-between items-center border-b border-black/5 pb-4">
          <h3 className="font-serif text-xl font-bold text-primary-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Header Announcement Bar
          </h3>
          <button
            type="button"
            onClick={() => setForm({ ...form, announcement_bar_active: !form.announcement_bar_active })}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
              form.announcement_bar_active ? 'bg-success text-white' : 'bg-black/10 text-secondary-text'
            }`}
          >
            {form.announcement_bar_active ? 'Active' : 'Disabled'}
          </button>
        </div>

        <Input
          label="Announcement Bar Text"
          value={form.announcement_bar_text || ''}
          onChange={(e) => setForm({ ...form, announcement_bar_text: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Link URL"
            value={form.announcement_bar_link || ''}
            onChange={(e) => setForm({ ...form, announcement_bar_link: e.target.value })}
          />
          <Input
            label="Background Color Hex (e.g. #1A1A1A)"
            value={form.announcement_bar_color || ''}
            onChange={(e) => setForm({ ...form, announcement_bar_color: e.target.value })}
          />
        </div>
      </div>

      {/* Promotional Sale Banner Settings Card */}
      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-6">
        <div className="flex justify-between items-center border-b border-black/5 pb-4">
          <h3 className="font-serif text-xl font-bold text-primary-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Homepage Promotional Sale Banner
          </h3>
          <button
            type="button"
            onClick={() => setForm({ ...form, promo_banner_active: !form.promo_banner_active })}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
              form.promo_banner_active ? 'bg-success text-white' : 'bg-black/10 text-secondary-text'
            }`}
          >
            {form.promo_banner_active ? 'Active' : 'Disabled'}
          </button>
        </div>

        <ImageUploader
          label="Banner Background Image"
          value={form.promo_banner_image_url || ''}
          onChange={(url) => setForm({ ...form, promo_banner_image_url: url })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Badge Pill Text"
            placeholder="LIMITED TIME EVENT"
            value={form.promo_banner_badge || ''}
            onChange={(e) => setForm({ ...form, promo_banner_badge: e.target.value })}
          />
          <Input
            label="Button CTA Text"
            placeholder="Shop Private Sale"
            value={form.promo_banner_button_text || ''}
            onChange={(e) => setForm({ ...form, promo_banner_button_text: e.target.value })}
          />
        </div>

        <Input
          label="Main Banner Heading"
          placeholder="The Private Seasonal Sale: Up to 30% Off"
          value={form.promo_banner_title || ''}
          onChange={(e) => setForm({ ...form, promo_banner_title: e.target.value })}
        />

        <div>
          <label className="block text-xs font-semibold text-primary-text mb-1">Banner Description / Subtitle</label>
          <textarea
            rows={2}
            placeholder="Enjoy exclusive savings on selected archival outerwear, leather footwear, and minimalist timepieces."
            value={form.promo_banner_subtitle || ''}
            onChange={(e) => setForm({ ...form, promo_banner_subtitle: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-black/15 rounded-xl text-xs text-primary-text outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <Input
          label="Button Target Link URL"
          placeholder="/products?sale=true"
          value={form.promo_banner_button_link || ''}
          onChange={(e) => setForm({ ...form, promo_banner_button_link: e.target.value })}
        />
      </div>

      {/* Contact & Socials Card */}
      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-6">
        <h3 className="font-serif text-xl font-bold text-primary-text flex items-center gap-2 border-b border-black/5 pb-4">
          <Mail className="w-5 h-5 text-accent" />
          Business Contact & Social Media
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Email"
            type="email"
            value={form.contact_email || ''}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          />
          <Input
            label="Contact Phone"
            value={form.contact_phone || ''}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
          />
        </div>

        <Input
          label="Business Address"
          value={form.business_address || ''}
          onChange={(e) => setForm({ ...form, business_address: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Input
            label="Instagram URL"
            value={form.social_instagram || ''}
            onChange={(e) => setForm({ ...form, social_instagram: e.target.value })}
          />
          <Input
            label="Facebook URL"
            value={form.social_facebook || ''}
            onChange={(e) => setForm({ ...form, social_facebook: e.target.value })}
          />
          <Input
            label="Twitter / X URL"
            value={form.social_twitter || ''}
            onChange={(e) => setForm({ ...form, social_twitter: e.target.value })}
          />
        </div>
      </div>
    </form>
  );
}
