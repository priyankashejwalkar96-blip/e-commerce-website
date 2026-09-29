"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const primaryImage = product.images?.[0]?.image_url || product.og_image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop';
  const secondaryImage = product.images?.[1]?.image_url || primaryImage;

  const price = product.sale_price ?? product.price;
  const isSale = Boolean(product.sale_price && product.sale_price < product.price);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast('Please sign in to save items to your wishlist', 'info');
      return;
    }

    try {
      if (isWishlisted) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        setIsWishlisted(false);
        toast('Removed from wishlist', 'info');
      } else {
        await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: product.id });
        setIsWishlisted(true);
        toast('Added to wishlist', 'success');
      }
    } catch {
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, undefined, {}, imgRef.current);
    toast(`Added "${product.title}" to bag`, 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative flex flex-col bg-white rounded-2xl border border-black/5 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div ref={imgRef} className="relative aspect-[3/4] w-full overflow-hidden bg-background-secondary">
        {/* Sale / New Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {isSale && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-destructive text-white rounded-full shadow-sm">
              Sale
            </span>
          )}
          {product.tags?.includes('new') && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary-text text-white rounded-full shadow-sm animate-pulse">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-primary-text hover:bg-white transition-all shadow-sm group/btn"
        >
          <motion.div whileTap={{ scale: 1.3 }}>
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-destructive text-destructive' : 'text-primary-text'
              }`}
            />
          </motion.div>
        </button>

        {/* Crossfading Images */}
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-transform duration-500 ease-out ${
              isHovered ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
            }`}
          />
          <Image
            src={secondaryImage}
            alt={`${product.title} lifestyle view`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-transform duration-500 ease-out absolute inset-0 ${
              isHovered ? 'scale-105 opacity-100' : 'scale-100 opacity-0'
            }`}
          />
        </Link>

        {/* Quick View & Quick Add Floating Controls */}
        <div className="absolute bottom-3 inset-x-3 z-10 flex gap-2">
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-primary-text hover:bg-white shadow-sm transition-all"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          <motion.button
            onClick={handleQuickAdd}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            disabled={product.stock_quantity === 0}
            className="flex-1 py-2.5 px-3 bg-primary-text text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.stock_quantity === 0 ? 'Out of Stock' : 'Quick Add'}</span>
          </motion.button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col gap-1">
        {product.category?.name && (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary-text">
            {product.category.name}
          </span>
        )}

        <Link href={`/products/${product.slug}`} className="group-hover:text-accent transition-colors">
          <h3 className="font-serif text-base font-semibold text-primary-text line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-sm text-primary-text">{formatCurrency(price)}</span>
          {isSale && (
            <span className="text-xs text-secondary-text line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
