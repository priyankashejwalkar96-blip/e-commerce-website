"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award, ChevronLeft, ChevronRight, Star, Clock, Headphones, Lock, Gift, Sparkles, Package, Heart, Zap, CheckCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Modal } from '@/components/ui/Modal';
import { Product, Category, HeroSlide, StoreFeature, SiteSettings } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

const FEATURE_ICONS: Record<string, React.ElementType> = {
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

const DEFAULT_STORE_FEATURES: StoreFeature[] = [
  { id: '1', icon_name: 'Truck', title: 'Express Delivery', description: 'Complimentary shipping over $150', sort_order: 1, is_active: true },
  { id: '2', icon_name: 'RefreshCw', title: '30-Day Guarantee', description: 'Hassle-free returns & exchanges', sort_order: 2, is_active: true },
  { id: '3', icon_name: 'ShieldCheck', title: 'Encrypted Checkout', description: 'Secured with Razorpay 256-bit', sort_order: 3, is_active: true },
  { id: '4', icon_name: 'Award', title: 'Master Craftsmanship', description: 'Ethically sourced natural materials', sort_order: 4, is_active: true },
];

// Default mock slides for instant wow factor before Supabase seed
const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: '1',
    image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    heading: 'Redefining Modern Luxury Essentials',
    subheading: 'Discover meticulously crafted garments and timeless accessories for contemporary living.',
    cta_text: 'Explore Collection',
    cta_link: '/products',
    sort_order: 1,
    is_active: true,
  },
  {
    id: '2',
    image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
    heading: 'Autumn Winter Capsule 2026',
    subheading: 'Uncompromising quality meets architectural minimalism. Made from organic natural fibers.',
    cta_text: 'Shop New Arrivals',
    cta_link: '/products?sort=newest',
    sort_order: 2,
    is_active: true,
  },
  {
    id: '3',
    image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
    heading: 'The Art of Subtle Elegance',
    subheading: 'Tailored silhouettes engineered for effortless elegance every day.',
    cta_text: 'View Lookbook',
    cta_link: '/products',
    sort_order: 3,
    is_active: true,
  },
];

// Fallback products for rich first load
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Monochrome Tailored Wool Trench Coat',
    slug: 'monochrome-tailored-coat',
    description: 'Double-breasted coat in pure merino wool with horn buttons and belted waist.',
    category_id: 'c1',
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
    category_id: 'c2',
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
    category_id: 'c3',
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
    category_id: 'c4',
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
];

export default function HomePage() {
  const { addItem } = useCart();
  const { toast } = useToast();

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [storeFeatures, setStoreFeatures] = useState<StoreFeature[]>(DEFAULT_STORE_FEATURES);
  const [activeSlide, setActiveSlide] = useState(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [bestSellers, setBestSellers] = useState<Product[]>(FALLBACK_PRODUCTS);

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Auto slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Load data from Supabase with independent try/catch blocks
  useEffect(() => {
    const fetchData = async () => {
      // 1. Hero Slides
      try {
        const { data: slidesData } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (slidesData && slidesData.length > 0) setHeroSlides(slidesData);
      } catch {
        // Keep DEFAULT_HERO_SLIDES
      }

      // 2. Trust Badges / Store Features
      try {
        const { data: featuresData } = await supabase
          .from('store_features')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (featuresData && featuresData.length > 0) {
          setStoreFeatures(featuresData as StoreFeature[]);
        }
      } catch {
        // Keep DEFAULT_STORE_FEATURES
      }

      // 3. Categories
      try {
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (catData) setCategories(catData);
      } catch {
        // Keep empty array
      }

      // 4. Products
      try {
        const { data: productsData } = await supabase
          .from('products')
          .select('*, category:categories(*), images:product_images(*)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8);
        if (productsData && productsData.length > 0) {
          setNewArrivals(productsData as Product[]);
          setBestSellers([...productsData].reverse() as Product[]);
        }
      } catch {
        // Keep FALLBACK_PRODUCTS
      }

      // 5. Site Settings
      try {
        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('*')
          .maybeSingle();
        if (settingsData) setSiteSettings(settingsData as SiteSettings);
      } catch {
        // Keep null
      }
    };

    fetchData();
  }, []);

  const currentSlide = heroSlides[activeSlide] || DEFAULT_HERO_SLIDES[0];

  return (
    <div className="space-y-24 pb-24">
      {/* SECTION 1: HERO CAROUSEL */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-primary-text">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={currentSlide.image_url}
              alt={currentSlide.heading}
              fill
              priority
              unoptimized={currentSlide.image_url?.startsWith('data:')}
              className="object-cover object-center"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-[1440px] h-full mx-auto px-6 md:px-16 flex flex-col justify-center text-white">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-widest text-white border border-white/30">
              {currentSlide.badge || 'New Season 2026'}
            </span>

            <motion.h1
              key={currentSlide.heading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
            >
              {currentSlide.heading}
            </motion.h1>

            <motion.p
              key={currentSlide.subheading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-white/80 leading-relaxed font-normal"
            >
              {currentSlide.subheading}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 flex flex-wrap gap-4"
            >
              <Link href={currentSlide.cta_link}>
                <Button variant="primary" size="lg" className="bg-white text-primary-text hover:bg-white/90 group">
                  <span>{currentSlide.cta_text}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="absolute bottom-8 left-6 md:left-16 z-20 flex items-center gap-4">
          <div className="flex gap-2">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? 'w-10 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setActiveSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST BADGES */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-white rounded-3xl border border-black/5 shadow-card">
          {(storeFeatures.length > 0 ? storeFeatures : DEFAULT_STORE_FEATURES).map((feat) => {
            const IconComponent = FEATURE_ICONS[feat.icon_name] || Truck;
            return (
              <div key={feat.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background-secondary flex items-center justify-center text-accent shrink-0 overflow-hidden p-2">
                  {feat.image_url ? (
                    <img
                      src={feat.image_url}
                      alt={feat.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <IconComponent className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-primary-text">{feat.title}</h4>
                  <p className="text-xs text-secondary-text mt-0.5">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: FEATURED CATEGORIES */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Curated Selections</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-text mt-1">
              Explore by Category
            </h2>
          </div>
          <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-primary-text hover:text-accent flex items-center gap-1 group">
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(categories.length > 0 ? categories : [
            { id: '1', name: 'Apparel & Outerwear', slug: 'apparel', image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop' },
            { id: '2', name: 'Leather Goods', slug: 'leather-goods', image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop' },
            { id: '3', name: 'Timepieces & Jewelry', slug: 'jewelry', image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop' },
            { id: '4', name: 'Home & Living', slug: 'home-living', image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop' },
          ]).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative h-96 rounded-3xl overflow-hidden shadow-card border border-black/5"
            >
              <Image
                src={cat.image_url || '/placeholder.jpg'}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <h3 className="font-serif text-2xl font-bold">{cat.name}</h3>
                <p className="text-xs text-white/80 flex items-center gap-1 group-hover:text-white transition-colors">
                  <span>Explore Items</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: NEW ARRIVALS GRID */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Just Dropped</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-text mt-1">
              New Arrivals
            </h2>
          </div>
          <Link href="/products?sort=newest" className="text-xs font-bold uppercase tracking-widest text-primary-text hover:text-accent flex items-center gap-1 group">
            <span>Shop All New</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 5: PROMOTIONAL BANNER */}
      {siteSettings?.promo_banner_active !== false && (
        <section className="max-w-[1440px] mx-auto px-6 md:px-16">
          <div className="relative rounded-3xl overflow-hidden bg-primary-text text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-card">
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
              <Image
                src={siteSettings?.promo_banner_image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"}
                alt={siteSettings?.promo_banner_title || "Promo Banner"}
                fill
                unoptimized={(siteSettings?.promo_banner_image_url || '').startsWith('data:')}
                className="object-cover"
              />
            </div>

            <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
              {(siteSettings?.promo_banner_badge ?? 'LIMITED TIME EVENT') && (
                <span className="px-3 py-1 bg-destructive text-white rounded-full text-xs font-bold uppercase tracking-wider inline-block">
                  {siteSettings?.promo_banner_badge || 'LIMITED TIME EVENT'}
                </span>
              )}
              <h2 className="font-serif text-3xl md:text-5xl font-bold leading-tight">
                {siteSettings?.promo_banner_title || 'The Private Seasonal Sale: Up to 30% Off'}
              </h2>
              <p className="text-xs md:text-sm text-white/80">
                {siteSettings?.promo_banner_subtitle || 'Enjoy exclusive savings on selected archival outerwear, leather footwear, and minimalist timepieces.'}
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <Link href={siteSettings?.promo_banner_button_link || "/products?sale=true"}>
                <Button variant="primary" size="lg" className="bg-white text-primary-text hover:bg-white/90">
                  {siteSettings?.promo_banner_button_text || 'Shop Private Sale'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: BEST SELLERS */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Customer Favorites</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-text mt-1">
              Best Sellers
            </h2>
          </div>
          <Link href="/products?sort=best_selling" className="text-xs font-bold uppercase tracking-widest text-primary-text hover:text-accent flex items-center gap-1 group">
            <span>View All Best Sellers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

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

                <Link href={`/products/${quickViewProduct.slug}`} className="block text-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary-text hover:text-accent transition-colors">
                    View Full Product Details →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
