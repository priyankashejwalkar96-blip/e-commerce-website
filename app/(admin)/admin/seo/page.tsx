"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export default function AdminSeoPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    meta_title_template: '{Page Title} | LUXE Commerce',
    default_meta_description: 'Curated luxury apparel, leather goods, and minimalist lifestyle essentials.',
    ga_tracking_id: 'G-XXXXXXXXXX',
    fb_pixel_id: '',
    robots_txt: 'User-agent: *\nAllow: /\nDisallow: /admin/',
  });

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const { data } = await supabase.from('seo_settings').select('*').single();
        if (data) setForm(data as any);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchSeo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('seo_settings').upsert(form);
      if (error) throw error;
      toast('SEO settings updated!', 'success');
    } catch {
      toast('Failed to save SEO settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-secondary-text animate-pulse">Loading SEO settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Global SEO Management</h1>
          <p className="text-xs text-secondary-text mt-1">Configure metadata templates, Google Analytics IDs, and robots.txt rules.</p>
        </div>
        <Button type="submit" variant="primary" isLoading={saving}>
          <Save className="w-4 h-4 mr-2" />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-6">
        <h3 className="font-serif text-xl font-bold text-primary-text flex items-center gap-2 border-b border-black/5 pb-4">
          <Globe className="w-5 h-5 text-accent" />
          Meta & Analytics Configuration
        </h3>

        <Input
          label="Meta Title Template *"
          value={form.meta_title_template}
          onChange={(e) => setForm({ ...form, meta_title_template: e.target.value })}
        />

        <div>
          <label className="block text-xs font-semibold text-secondary-text mb-1">Default Meta Description</label>
          <textarea
            rows={3}
            value={form.default_meta_description}
            onChange={(e) => setForm({ ...form, default_meta_description: e.target.value })}
            className="w-full p-4 text-xs bg-white border border-black/15 rounded-xl outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Google Analytics GA4 Tracking ID"
            value={form.ga_tracking_id}
            onChange={(e) => setForm({ ...form, ga_tracking_id: e.target.value })}
          />
          <Input
            label="Facebook Pixel ID"
            value={form.fb_pixel_id}
            onChange={(e) => setForm({ ...form, fb_pixel_id: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary-text mb-1">Robots.txt Content</label>
          <textarea
            rows={5}
            value={form.robots_txt}
            onChange={(e) => setForm({ ...form, robots_txt: e.target.value })}
            className="w-full p-4 font-mono text-xs bg-background-secondary border border-black/15 rounded-xl outline-none focus:border-accent resize-none"
          />
        </div>
      </div>
    </form>
  );
}
