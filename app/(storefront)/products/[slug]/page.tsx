"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ShoppingBag, Plus, Minus, Check, Truck, ShieldCheck, ChevronDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Product, Review } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('description');

  // Review Submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const mainImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const { data: prodData } = await supabase
          .from('products')
          .select('*, category:categories(*), images:product_images(*), options:product_options(*, values:product_option_values(*)), variants:product_variants(*)')
          .eq('slug', params.slug)
          .single();

        if (prodData) {
          const fetchedProd = prodData as Product;
          setProduct(fetchedProd);

          // Set default option selections
          if (fetchedProd.options) {
            const defaults: Record<string, string> = {};
            fetchedProd.options.forEach((opt) => {
              if (opt.values && opt.values.length > 0) {
                defaults[opt.name] = opt.values[0].value;
              }
            });
            setSelectedOptions(defaults);
          }

          // Fetch related products in same category
          if (fetchedProd.category_id) {
            const { data: relData } = await supabase
              .from('products')
              .select('*, category:categories(*), images:product_images(*)')
              .eq('category_id', fetchedProd.category_id)
              .neq('id', fetchedProd.id)
              .limit(4);
            if (relData) setRelatedProducts(relData as Product[]);
          }

          // Fetch reviews
          const { data: revData } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', fetchedProd.id)
            .order('created_at', { ascending: false });
          if (revData) setReviews(revData as Review[]);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-20 text-center text-secondary-text animate-pulse">
        Loading product experience...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-primary-text">Product Not Found</h1>
        <p className="text-xs text-secondary-text">The requested product could not be located in our catalog.</p>
        <Link href="/products">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: '1', product_id: product.id, image_url: '/placeholder.jpg', sort_order: 0, alt_text: product.title }];

  const currentPrice = product.sale_price ?? product.price;

  const handleAddToCart = () => {
    addItem(product, quantity, undefined, selectedOptions, mainImgRef.current);
    toast(`Added ${quantity}x "${product.title}" to bag`, 'success');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please sign in to leave a review', 'info');
      return;
    }
    if (!reviewBody.trim()) {
      toast('Please enter review content', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: user.id,
        rating: reviewRating,
        title: reviewTitle.trim() || null,
        body: reviewBody.trim(),
        is_verified: true,
      });

      if (error) {
        toast('Failed to submit review', 'error');
      } else {
        toast('Thank you! Your review has been published.', 'success');
        setReviewTitle('');
        setReviewBody('');
        // Refresh reviews
        const { data: revData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false });
        if (revData) setReviews(revData as Review[]);
      }
    } catch {
      toast('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs font-semibold uppercase tracking-wider text-secondary-text flex items-center gap-2">
        <Link href="/" className="hover:text-primary-text">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-text">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary-text">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-primary-text">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
          {/* Large Main Image Container */}
          <div ref={mainImgRef} className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-background-secondary border border-black/5 shadow-card group">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[selectedImageIndex]?.image_url || '/placeholder.jpg'}
                  alt={product.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out cursor-zoom-in"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 pb-2 md:pb-0">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden bg-background-secondary shrink-0 border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-accent shadow-md scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.image_url} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Specs & CTAs */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-widest text-accent">
                {product.category?.name || 'Luxury Essential'}
              </span>
              <div className="flex items-center gap-1 font-semibold text-primary-text">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{avgRating} ({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Title & SKU */}
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-text leading-tight">
              {product.title}
            </h1>
            <p className="text-xs text-secondary-text">SKU: {product.sku}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-bold text-3xl text-primary-text">
                {formatCurrency(currentPrice)}
              </span>
              {product.sale_price && (
                <span className="text-base text-secondary-text line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <p className="text-sm text-secondary-text leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Dynamic Options Selectors */}
            {product.options && product.options.map((option) => (
              <div key={option.id} className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="uppercase tracking-wider text-primary-text">{option.name}:</span>
                  <span className="text-secondary-text">{selectedOptions[option.name]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.values?.map((val) => {
                    const isSelected = selectedOptions[option.name] === val.value;
                    const isColor = option.name.toLowerCase().includes('color');

                    if (isColor) {
                      return (
                        <button
                          key={val.id}
                          onClick={() => setSelectedOptions({ ...selectedOptions, [option.name]: val.value })}
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-accent scale-110 shadow-sm' : 'border-black/10 hover:border-black/30'
                          }`}
                          style={{ backgroundColor: val.value.toLowerCase() }}
                          title={val.value}
                        >
                          {isSelected && <Check className={`w-4 h-4 ${['white', 'yellow', 'cream'].includes(val.value.toLowerCase()) ? 'text-black' : 'text-white'}`} />}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={val.id}
                        onClick={() => setSelectedOptions({ ...selectedOptions, [option.name]: val.value })}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-primary-text text-white border-primary-text shadow-sm'
                            : 'bg-white text-primary-text border-black/15 hover:bg-black/5'
                        }`}
                      >
                        {val.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-text">Quantity:</span>
                <div className="flex items-center border border-black/15 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-black/5 text-secondary-text transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-primary-text">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    className="p-2.5 hover:bg-black/5 text-secondary-text transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="w-full text-base h-14 shadow-card"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                <span>
                  {product.stock_quantity === 0
                    ? 'Out of Stock'
                    : `Add to Cart — ${formatCurrency(currentPrice * quantity)}`}
                </span>
              </Button>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="border-t border-black/10 pt-4 space-y-2">
            {[
              { id: 'description', title: 'Product Details & Specs', content: product.description },
              { id: 'shipping', title: 'Shipping & Returns', content: 'Complimentary express delivery on all orders over $150. Returns accepted within 30 days of delivery.' },
            ].map((acc) => (
              <div key={acc.id} className="border-b border-black/5 pb-2">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                  className="w-full py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-primary-text text-left"
                >
                  <span>{acc.title}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === acc.id ? 'rotate-180' : ''}`} />
                </button>
                {activeAccordion === acc.id && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-secondary-text leading-relaxed pb-3"
                  >
                    {acc.content}
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="pt-12 border-t border-black/10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Client Testimonials</span>
            <h2 className="font-serif text-3xl font-bold text-primary-text mt-1">
              Customer Reviews ({reviews.length})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Submit Review Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary-text">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary-text mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-black/20'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-text mb-1">Review Title</label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional craftsmanship"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-background-secondary border border-black/10 rounded-xl outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-text mb-1">Your Review</label>
                <textarea
                  rows={4}
                  placeholder="Share details about fit, quality, and material feel..."
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className="w-full p-4 text-xs bg-background-secondary border border-black/10 rounded-xl outline-none focus:border-accent resize-none"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={submittingReview}>
                Submit Review
              </Button>
            </form>
          </div>

          {/* Right: Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-background-secondary/40 rounded-3xl border border-black/5 text-xs text-secondary-text">
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-white rounded-2xl border border-black/5 shadow-card space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-black/15'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.is_verified && (
                      <span className="px-2 py-0.5 bg-success/10 text-success rounded-md text-[10px] font-bold uppercase">
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  {rev.title && <h4 className="font-bold text-sm text-primary-text">{rev.title}</h4>}
                  <p className="text-xs text-secondary-text leading-relaxed">{rev.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-black/10 space-y-8">
          <h2 className="font-serif text-3xl font-bold text-primary-text">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
