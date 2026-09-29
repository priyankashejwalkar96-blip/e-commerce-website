"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Product, Category } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Apparel & Outerwear', slug: 'apparel', description: 'Tailored coats and organic essentials', image_url: null, parent_id: null, sort_order: 1, created_at: new Date().toISOString() },
  { id: 'c2', name: 'Leather Goods', slug: 'leather-goods', description: 'Handcrafted calfskin weekender bags and totes', image_url: null, parent_id: null, sort_order: 2, created_at: new Date().toISOString() },
  { id: 'c3', name: 'Timepieces & Jewelry', slug: 'jewelry', description: 'Swiss movement watches and silver jewelry', image_url: null, parent_id: null, sort_order: 3, created_at: new Date().toISOString() },
  { id: 'c4', name: 'Home & Living', slug: 'home-living', description: 'Stoneware vessels and French linen throws', image_url: null, parent_id: null, sort_order: 4, created_at: new Date().toISOString() },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Monochrome Tailored Wool Trench Coat',
    slug: 'monochrome-tailored-coat',
    description: 'Double-breasted coat in pure merino wool with horn buttons and belted waist.',
    category_id: 'c1',
    category: FALLBACK_CATEGORIES[0],
    price: 495,
    sale_price: 395,
    sale_start: null,
    sale_end: null,
    sku: 'COAT-001',
    stock_quantity: 12,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    meta_title: null,
    meta_description: null,
    og_image_url: null,
    tags: ['new', 'outerwear'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: 'img1', product_id: 'p1', image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop', sort_order: 0, alt_text: 'Trench Coat' }],
  },
  {
    id: 'p2',
    title: 'Architectural Ceramic Table Vessel',
    slug: 'ceramic-vessel',
    description: 'Hand-thrown stoneware vessel with matte reactive glaze texture.',
    category_id: 'c4',
    category: FALLBACK_CATEGORIES[3],
    price: 185,
    sale_price: null,
    sale_start: null,
    sale_end: null,
    sku: 'HOME-002',
    stock_quantity: 8,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    meta_title: null,
    meta_description: null,
    og_image_url: null,
    tags: ['featured'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: 'img2', product_id: 'p2', image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop', sort_order: 0, alt_text: 'Vessel' }],
  },
  {
    id: 'p3',
    title: 'Italian Full-Grain Leather Weekender Bag',
    slug: 'leather-weekender-bag',
    description: 'Handcrafted in Florence from vegetable-tanned calfskin with brass hardware.',
    category_id: 'c2',
    category: FALLBACK_CATEGORIES[1],
    price: 680,
    sale_price: 590,
    sale_start: null,
    sale_end: null,
    sku: 'BAG-003',
    stock_quantity: 5,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    meta_title: null,
    meta_description: null,
    og_image_url: null,
    tags: ['best_seller'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: 'img3', product_id: 'p3', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop', sort_order: 0, alt_text: 'Weekender Bag' }],
  },
  {
    id: 'p4',
    title: 'Minimal Swiss Movement Sapphire Watch',
    slug: 'swiss-movement-watch',
    description: '38mm brushed stainless steel case with domed sapphire crystal and Italian leather strap.',
    category_id: 'c3',
    category: FALLBACK_CATEGORIES[2],
    price: 340,
    sale_price: null,
    sale_start: null,
    sale_end: null,
    sku: 'WATCH-004',
    stock_quantity: 15,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    meta_title: null,
    meta_description: null,
    og_image_url: null,
    tags: ['new', 'accessory'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: 'img4', product_id: 'p4', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop', sort_order: 0, alt_text: 'Watch' }],
  },
  {
    id: 'p5',
    title: 'Oversized Organic Cashmere Sweater',
    slug: 'organic-cashmere-sweater',
    description: 'Ultra-soft Mongolian cashmere ribbed knit sweater designed with dropped shoulders.',
    category_id: 'c1',
    category: FALLBACK_CATEGORIES[0],
    price: 320,
    sale_price: null,
    sale_start: null,
    sale_end: null,
    sku: 'KNIT-002',
    stock_quantity: 20,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    meta_title: null,
    meta_description: null,
    og_image_url: null,
    tags: ['knitwear'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: 'img5', product_id: 'p5', image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop', sort_order: 0, alt_text: 'Sweater' }],
  },
  {
    id: 'p6',
    title: 'Solid Sterling Silver Signet Ring',
    slug: 'sterling-silver-signet-ring',
    description: 'Hand-carved 925 sterling silver ring with brushed face and polished bevel edges.',
    category_id: 'c3',
    category: FALLBACK_CATEGORIES[2],
    price: 165,
    sale_price: 135,
    sale_start: null,
    sale_end: null,
    sku: 'RING-002',
    stock_quantity: 30,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    meta_title: null,
    meta_description: null,
    og_image_url: null,
    tags: ['jewelry'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: 'img6', product_id: 'p6', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop', sort_order: 0, alt_text: 'Signet Ring' }],
  },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = Number(searchParams.get('minPrice')) || 0;
  const maxPriceParam = Number(searchParams.get('maxPrice')) || 2000;
  const saleParam = searchParams.get('sale') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [onlySale, setOnlySale] = useState(saleParam);

  // Synchronize state with URL search params when they change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedSort(searchParams.get('sort') || 'newest');
    setOnlySale(searchParams.get('sale') === 'true');
    if (searchParams.get('maxPrice')) {
      setMaxPrice(Number(searchParams.get('maxPrice')));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data && data.length > 0) setCategories(data);
      } catch {
        // Keep fallback categories
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*, category:categories(*), images:product_images(*)')
          .eq('status', 'active');

        if (selectedCategory !== 'all') {
          const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', selectedCategory)
            .single();
          if (catData) {
            query = query.eq('category_id', catData.id);
          }
        }

        if (onlySale) {
          query = query.not('sale_price', 'is', null);
        }

        query = query.lte('price', maxPrice);

        if (selectedSort === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (selectedSort === 'price_desc') {
          query = query.order('price', { ascending: false });
        } else if (selectedSort === 'newest') {
          query = query.order('created_at', { ascending: false });
        }

        const { data } = await query;
        if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          // Filter fallback products locally
          let filtered = [...FALLBACK_PRODUCTS];
          if (selectedCategory !== 'all') {
            filtered = filtered.filter((p) => p.category?.slug === selectedCategory);
          }
          if (onlySale) {
            filtered = filtered.filter((p) => p.sale_price !== null);
          }
          filtered = filtered.filter((p) => p.price <= maxPrice);
          if (selectedSort === 'price_asc') {
            filtered.sort((a, b) => a.price - b.price);
          } else if (selectedSort === 'price_desc') {
            filtered.sort((a, b) => b.price - a.price);
          }
          setProducts(filtered);
        }
      } catch {
        let filtered = [...FALLBACK_PRODUCTS];
        if (selectedCategory !== 'all') {
          filtered = filtered.filter((p) => p.category?.slug === selectedCategory);
        }
        if (onlySale) {
          filtered = filtered.filter((p) => p.sale_price !== null);
        }
        filtered = filtered.filter((p) => p.price <= maxPrice);
        setProducts(filtered);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSort, maxPrice, onlySale]);

  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    updateUrlParams('category', slug);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    updateUrlParams('sort', sort);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSort('newest');
    setMaxPrice(2000);
    setOnlySale(false);
    router.push('/products');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Catalog</span>
          <h1 className="font-serif text-4xl font-bold text-primary-text mt-1">
            {selectedCategory === 'all'
              ? 'All Products'
              : categories.find((c) => c.slug === selectedCategory)?.name || 'Products'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-background-secondary rounded-xl text-xs font-bold text-primary-text border border-black/5"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary-text font-medium hidden sm:inline">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 bg-white border border-black/10 rounded-xl text-xs font-semibold text-primary-text outline-none focus:border-accent cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-8 pr-4 border-r border-black/5">
          {/* Categories Filter */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-widest text-primary-text">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-text text-white font-semibold'
                    : 'text-secondary-text hover:bg-black/5 hover:text-primary-text'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-primary-text text-white font-semibold'
                      : 'text-secondary-text hover:bg-black/5 hover:text-primary-text'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-widest text-primary-text">Max Price</h3>
              <span className="text-xs font-bold text-accent">{formatCurrency(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </div>

          {/* On Sale Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-black/5">
            <span className="font-bold text-xs uppercase tracking-widest text-primary-text">On Sale Only</span>
            <input
              type="checkbox"
              checked={onlySale}
              onChange={(e) => setOnlySale(e.target.checked)}
              className="w-4 h-4 accent-accent rounded cursor-pointer"
            />
          </div>

          {/* Clear Filters Button */}
          <Button variant="outline" size="sm" className="w-full" onClick={clearAllFilters}>
            Reset Filters
          </Button>
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-3 space-y-6">
          {/* Active Filter Chips */}
          {(selectedCategory !== 'all' || onlySale || maxPrice < 2000) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-secondary-text font-medium mr-1">Active filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-background-secondary rounded-full text-xs font-medium text-primary-text border border-black/5">
                  Category: {selectedCategory}
                  <button onClick={() => handleCategoryChange('all')} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {onlySale && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-destructive/10 rounded-full text-xs font-medium text-destructive border border-destructive/20">
                  On Sale
                  <button onClick={() => setOnlySale(false)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {maxPrice < 2000 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-background-secondary rounded-full text-xs font-medium text-primary-text border border-black/5">
                  Max: {formatCurrency(maxPrice)}
                  <button onClick={() => setMaxPrice(2000)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-accent hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid View */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-black/5 shadow-card p-8">
              <h3 className="font-serif text-2xl font-bold text-primary-text">No products match your criteria</h3>
              <p className="text-xs text-secondary-text mt-2 max-w-sm mx-auto">
                Try adjusting your price range, clearing filters, or exploring other categories.
              </p>
              <Button variant="primary" className="mt-6" onClick={clearAllFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <Modal
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        maxWidth="lg"
      >
        {quickViewProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-background-secondary">
              <Image
                src={quickViewProduct.images?.[0]?.image_url || '/placeholder.jpg'}
                alt={quickViewProduct.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                  {quickViewProduct.category?.name || 'Collection'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-primary-text mt-1">
                  {quickViewProduct.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-xl text-primary-text">
                    {formatCurrency(quickViewProduct.sale_price ?? quickViewProduct.price)}
                  </span>
                  {quickViewProduct.sale_price && (
                    <span className="text-sm text-secondary-text line-through">
                      {formatCurrency(quickViewProduct.price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-secondary-text mt-3 leading-relaxed">
                  {quickViewProduct.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-black/5">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    addItem(quickViewProduct, 1);
                    toast(`Added "${quickViewProduct.title}" to bag`, 'success');
                    setQuickViewProduct(null);
                  }}
                >
                  Add to Cart ({formatCurrency(quickViewProduct.sale_price ?? quickViewProduct.price)})
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-secondary-text">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
