"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search, Package, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Product, Category } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatCurrency, slugify } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    categoryId: '',
    price: '',
    salePrice: '',
    sku: '',
    stockQuantity: '10',
    status: 'active' as 'active' | 'draft',
    imageUrl: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*)')
        .order('created_at', { ascending: false });
      if (data) setProducts(data as Product[]);

      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData as Category[]);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTitleChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: editingId ? prev.slug : slugify(val),
    }));
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setForm({
      title: '',
      slug: '',
      description: '',
      categoryId: categories[0]?.id || '',
      price: '',
      salePrice: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stockQuantity: '10',
      status: 'active',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingId(product.id);
    const existingImg = product.images?.[0]?.image_url || product.og_image_url || '';
    setForm({
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      categoryId: product.category_id || '',
      price: String(product.price),
      salePrice: product.sale_price ? String(product.sale_price) : '',
      sku: product.sku,
      stockQuantity: String(product.stock_quantity),
      status: product.status,
      imageUrl: existingImg,
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        toast('Failed to delete product', 'error');
      } else {
        toast(`Product "${title}" deleted`, 'success');
        fetchProducts();
      }
    } catch {
      toast('Failed to delete product', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.sku) {
      toast('Please fill in required fields (title, price, SKU)', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description,
        category_id: form.categoryId || null,
        price: parseFloat(form.price),
        sale_price: form.salePrice ? parseFloat(form.salePrice) : null,
        sku: form.sku,
        stock_quantity: parseInt(form.stockQuantity) || 0,
        status: form.status,
        og_image_url: form.imageUrl || null,
      };

      let productId = editingId;

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: newProd, error } = await supabase.from('products').insert(payload).select().single();
        if (error) throw error;
        productId = newProd.id;
      }

      // Handle product_images record
      if (productId && form.imageUrl) {
        try {
          await supabase.from('product_images').delete().eq('product_id', productId);
          await supabase.from('product_images').insert({
            product_id: productId,
            image_url: form.imageUrl,
            sort_order: 0,
          });
        } catch {
          // Failure ignored if og_image_url already persisted
        }
      }

      toast(`Product ${editingId ? 'updated' : 'created'} successfully!`, 'success');
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Product Management</h1>
          <p className="text-xs text-secondary-text mt-1">Manage catalog inventory, pricing, media, and status.</p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          <span>Add New Product</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center bg-white px-4 py-3 rounded-2xl border border-black/5 shadow-card max-w-md">
        <Search className="w-4 h-4 text-secondary-text mr-3 shrink-0" />
        <input
          type="text"
          placeholder="Search by title or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs font-medium bg-transparent outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-secondary-text animate-pulse">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Package className="w-12 h-12 text-secondary-text mx-auto" />
            <h3 className="font-serif text-xl font-bold text-primary-text">No Products Found</h3>
            <p className="text-xs text-secondary-text">Click "Add New Product" to populate your catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-background-secondary/50 text-secondary-text uppercase font-bold tracking-wider">
                  <th className="p-4">Item</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredProducts.map((product) => {
                  const img = product.images?.[0]?.image_url || product.og_image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
                  return (
                    <tr key={product.id} className="hover:bg-background-secondary/30 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-background-secondary shrink-0 border border-black/5">
                          <Image
                            src={img}
                            alt={product.title}
                            fill
                            unoptimized={img.startsWith('data:')}
                            className="object-cover"
                          />
                        </div>
                        <span className="font-bold text-primary-text line-clamp-1">{product.title}</span>
                      </td>
                      <td className="p-4 text-secondary-text font-mono">{product.sku}</td>
                      <td className="p-4 text-secondary-text font-medium">{product.category?.name || 'Uncategorized'}</td>
                      <td className="p-4 font-bold text-primary-text">
                        {formatCurrency(product.sale_price ?? product.price)}
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={product.stock_quantity < 10 ? 'text-destructive font-bold' : 'text-primary-text'}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full font-bold uppercase text-[10px] ${
                          product.status === 'active' ? 'bg-success/10 text-success' : 'bg-black/10 text-secondary-text'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 rounded-lg hover:bg-black/5 text-secondary-text hover:text-accent transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.title)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-secondary-text hover:text-destructive transition-colors"
                          >
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

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Product' : 'Add New Product'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Product Title *"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU Code *"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary-text">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="h-13 px-4 bg-white border border-black/15 rounded-xl text-sm font-medium outline-none focus:border-accent"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Regular Price ($) *"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Sale Price ($)"
              type="number"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            />
            <Input
              label="Stock Quantity *"
              type="number"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            />
          </div>

          {/* Interactive Image Uploader with File Select, URL Input, and Live Preview */}
          <ImageUploader
            label="Product Image"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />

          <div>
            <label className="block text-xs font-semibold text-secondary-text mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-4 text-xs bg-white border border-black/15 rounded-xl outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-text">Status</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, status: form.status === 'active' ? 'draft' : 'active' })}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-colors ${
                form.status === 'active' ? 'bg-success text-white' : 'bg-black/10 text-secondary-text'
              }`}
            >
              {form.status}
            </button>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-black/5">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingId ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
