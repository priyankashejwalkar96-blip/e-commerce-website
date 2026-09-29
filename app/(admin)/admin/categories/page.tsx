"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Category } from '@/types';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      if (data) setCategories(data as Category[]);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id);
      setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', imageUrl: cat.image_url || '' });
    } else {
      setEditingId(null);
      setForm({ name: '', slug: '', description: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        image_url: form.imageUrl,
      };

      if (editingId) {
        await supabase.from('categories').update(payload).eq('id', editingId);
      } else {
        await supabase.from('categories').insert(payload);
      }
      toast('Category saved successfully!', 'success');
      setIsModalOpen(false);
      fetchCategories();
    } catch {
      toast('Failed to save category', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await supabase.from('categories').delete().eq('id', id);
      toast('Category deleted', 'success');
      fetchCategories();
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Category Management</h1>
          <p className="text-xs text-secondary-text mt-1">Organize storefront collections and navigation hierarchies.</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          <span>Add New Category</span>
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-secondary-text animate-pulse">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FolderTree className="w-12 h-12 text-secondary-text mx-auto" />
            <h3 className="font-serif text-xl font-bold text-primary-text">No Categories Found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-background-secondary/50 text-secondary-text uppercase font-bold tracking-wider">
                  <th className="p-4">Category</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {categories.map((cat) => {
                  const img = cat.image_url || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop';
                  return (
                    <tr key={cat.id} className="hover:bg-background-secondary/30 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-background-secondary shrink-0 border border-black/5">
                          <Image src={img} alt={cat.name} fill unoptimized={img.startsWith('data:')} className="object-cover" />
                        </div>
                        <span className="font-bold text-primary-text">{cat.name}</span>
                      </td>
                      <td className="p-4 text-secondary-text font-mono">{cat.slug}</td>
                      <td className="p-4 text-secondary-text truncate max-w-xs">{cat.description || '—'}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(cat)} className="p-1.5 hover:bg-black/5 text-secondary-text hover:text-accent rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 hover:bg-destructive/10 text-secondary-text hover:text-destructive rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Category Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} />
          <Input label="Slug *" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <ImageUploader label="Category Cover Image" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
          <div>
            <label className="block text-xs font-semibold text-secondary-text mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-4 text-xs bg-white border border-black/15 rounded-xl outline-none focus:border-accent resize-none" />
          </div>
          <Button type="submit" variant="primary" className="w-full">Save Category</Button>
        </form>
      </Modal>
    </div>
  );
}
