"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Sliders, Trash2, Edit3, Eye, EyeOff, Sparkles, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { HeroSlide } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

const DEFAULT_SLIDES: Omit<HeroSlide, 'id'>[] = [
  {
    image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    heading: 'Redefining Modern Luxury Essentials',
    subheading: 'Discover meticulously crafted garments and timeless accessories for contemporary living.',
    cta_text: 'Explore Collection',
    cta_link: '/products',
    sort_order: 1,
    is_active: true,
    badge: 'NEW SEASON 2026',
  },
  {
    image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
    heading: 'Autumn Winter Capsule 2026',
    subheading: 'Uncompromising quality meets architectural minimalism. Made from organic natural fibers.',
    cta_text: 'Shop New Arrivals',
    cta_link: '/products?sort=newest',
    sort_order: 2,
    is_active: true,
    badge: 'CAPSULE 2026',
  },
  {
    image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
    heading: 'The Art of Subtle Elegance',
    subheading: 'Tailored silhouettes engineered for effortless elegance every day.',
    cta_text: 'View Lookbook',
    cta_link: '/products',
    sort_order: 3,
    is_active: true,
    badge: 'LOOKBOOK',
  },
];

export default function AdminHeroPage() {
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  const [form, setForm] = useState({
    image_url: '',
    badge: 'NEW SEASON 2026',
    heading: '',
    subheading: '',
    cta_text: 'Shop Now',
    cta_link: '/products',
    sort_order: 1,
    is_active: true,
  });

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        setSlides(data as HeroSlide[]);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setForm({
      image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
      badge: 'NEW SEASON 2026',
      heading: 'The Art of Subtle Elegance',
      subheading: 'Tailored silhouettes engineered for effortless elegance every day.',
      cta_text: 'View Lookbook',
      cta_link: '/products',
      sort_order: slides.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setForm({
      image_url: slide.image_url,
      badge: slide.badge || 'NEW SEASON 2026',
      heading: slide.heading,
      subheading: slide.subheading || '',
      cta_text: slide.cta_text,
      cta_link: slide.cta_link,
      sort_order: slide.sort_order,
      is_active: slide.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.heading || !form.image_url) {
      toast('Heading and Image URL are required', 'error');
      return;
    }

    try {
      const payload: Record<string, any> = {
        image_url: form.image_url.trim(),
        heading: form.heading.trim(),
        subheading: form.subheading.trim() || null,
        cta_text: form.cta_text.trim(),
        cta_link: form.cta_link.trim(),
        sort_order: Number(form.sort_order),
        is_active: form.is_active,
      };

      if (form.badge?.trim()) {
        payload.badge = form.badge.trim();
      }

      if (editingSlide) {
        let { error } = await supabase
          .from('hero_slides')
          .update(payload)
          .eq('id', editingSlide.id);

        // Fallback retry without badge column if Supabase table lacks badge column
        if (error && (error.message?.includes('badge') || error.message?.includes('schema cache'))) {
          delete payload.badge;
          const retry = await supabase
            .from('hero_slides')
            .update(payload)
            .eq('id', editingSlide.id);
          error = retry.error;
        }

        if (error) throw error;
        toast('Hero slide updated successfully!', 'success');
      } else {
        let { error } = await supabase.from('hero_slides').insert(payload);

        // Fallback retry without badge column if Supabase table lacks badge column
        if (error && (error.message?.includes('badge') || error.message?.includes('schema cache'))) {
          delete payload.badge;
          const retry = await supabase.from('hero_slides').insert(payload);
          error = retry.error;
        }

        if (error) throw error;
        toast('New hero slide created successfully!', 'success');
      }

      setIsModalOpen(false);
      fetchSlides();
    } catch (err: any) {
      console.error('Error saving hero slide:', err);
      toast(
        err?.message ||
          'Failed to save hero slide. Please check if table hero_slides exists in Supabase.',
        'error'
      );
    }
  };

  const handleDelete = async (id: string, heading: string) => {
    if (!confirm(`Are you sure you want to delete slide "${heading}"?`)) return;
    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      toast('Hero slide deleted', 'success');
      fetchSlides();
    } catch (err: any) {
      toast(err?.message || 'Failed to delete slide', 'error');
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: !slide.is_active })
        .eq('id', slide.id);
      if (error) throw error;
      toast(`Slide ${!slide.is_active ? 'activated' : 'deactivated'}`, 'info');
      fetchSlides();
    } catch (err: any) {
      toast(err?.message || 'Failed to update status', 'error');
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('Seed database with 3 luxury default hero slides?')) return;
    try {
      const { error } = await supabase.from('hero_slides').insert(DEFAULT_SLIDES);
      if (error) throw error;
      toast('Default hero slides seeded successfully!', 'success');
      fetchSlides();
    } catch (err: any) {
      toast(
        err?.message ||
          'Failed to seed default slides. Please check if table hero_slides exists in Supabase.',
        'error'
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Hero Banner Management</h1>
          <p className="text-xs text-secondary-text mt-1">
            Customize homepage hero slides, background images, titles, subheadings, and action buttons dynamically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleSeedDefaults}>
            <Sparkles className="w-4 h-4 mr-2 text-accent" />
            <span>Seed Default Banners</span>
          </Button>
          <Button variant="primary" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            <span>Add New Banner</span>
          </Button>
        </div>
      </div>

      {/* Hero Slides Table / List */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-secondary-text animate-pulse">
            Loading hero banner slides...
          </div>
        ) : slides.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Sliders className="w-12 h-12 text-secondary-text mx-auto" />
            <div>
              <h3 className="font-serif text-xl font-bold text-primary-text">No Hero Banners Found</h3>
              <p className="text-xs text-secondary-text mt-1">
                Click "Seed Default Banners" or "Add New Banner" to add slides to the storefront.
              </p>
            </div>
            <Button variant="primary" onClick={handleSeedDefaults}>
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Seed Default Banners</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-background-secondary/50 text-secondary-text uppercase font-bold tracking-wider">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Badge & Heading</th>
                  <th className="p-4">Subheading</th>
                  <th className="p-4">CTA Link</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {slides.map((slide) => (
                  <tr key={slide.id} className="hover:bg-background-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="relative w-24 h-14 rounded-xl overflow-hidden border border-black/10 shadow-sm bg-black/5">
                        <Image
                          src={slide.image_url}
                          alt={slide.heading}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      {slide.badge && (
                        <span className="inline-block px-2 py-0.5 bg-black/5 rounded-full text-[10px] font-bold text-accent uppercase tracking-wider mb-1">
                          {slide.badge}
                        </span>
                      )}
                      <div className="font-bold text-sm text-primary-text">{slide.heading}</div>
                    </td>
                    <td className="p-4 max-w-xs text-secondary-text line-clamp-2">
                      {slide.subheading || '—'}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-primary-text">{slide.cta_text}</div>
                      <div className="text-[11px] text-secondary-text">{slide.cta_link}</div>
                    </td>
                    <td className="p-4 font-bold text-primary-text">#{slide.sort_order}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(slide)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors flex items-center gap-1.5 ${
                          slide.is_active
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-black/5 text-secondary-text border border-black/10'
                        }`}
                      >
                        {slide.is_active ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(slide)}
                          className="p-2 rounded-xl text-secondary-text hover:text-accent hover:bg-accent/10 transition-colors"
                          title="Edit Banner"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id, slide.heading)}
                          className="p-2 rounded-xl text-secondary-text hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlide ? 'Edit Hero Banner Slide' : 'Add New Hero Banner Slide'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ImageUploader
            label="Banner Background Image"
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Badge Text"
                type="text"
                placeholder="NEW SEASON 2026"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Sort Order"
                type="number"
                value={String(form.sort_order)}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div>
            <Input
              label="Main Heading"
              type="text"
              placeholder="The Art of Subtle Elegance"
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary-text mb-1">Subheading / Description</label>
            <textarea
              rows={2}
              placeholder="Tailored silhouettes engineered for effortless elegance every day."
              value={form.subheading}
              onChange={(e) => setForm({ ...form, subheading: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-black/15 rounded-xl text-xs text-primary-text outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Button CTA Text"
                type="text"
                placeholder="View Lookbook"
                value={form.cta_text}
                onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Button Target Link"
                type="text"
                placeholder="/products"
                value={form.cta_link}
                onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded border-black/20 text-accent focus:ring-accent"
            />
            <label htmlFor="is_active" className="text-xs font-semibold text-primary-text">
              Active & visible on storefront home page
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <span>{editingSlide ? 'Save Changes' : 'Create Hero Slide'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
