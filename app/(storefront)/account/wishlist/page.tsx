"use client";

import React, { useState, useEffect } from 'react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data: wishData } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', user.id);

        if (wishData && wishData.length > 0) {
          const productIds = wishData.map((w) => w.product_id);
          const { data: prods } = await supabase
            .from('products')
            .select('*, category:categories(*), images:product_images(*)')
            .in('id', productIds);
          if (prods) setWishlistProducts(prods as Product[]);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 space-y-8">
      <div className="border-b border-black/5 pb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Saved Collection</span>
        <h1 className="font-serif text-3xl font-bold text-primary-text flex items-center gap-2 mt-1">
          <Heart className="w-6 h-6 fill-destructive text-destructive" />
          My Wishlist ({wishlistProducts.length})
        </h1>
      </div>

      {!user ? (
        <div className="py-20 text-center space-y-4">
          <p className="text-xs text-secondary-text">Please sign in to view your saved wishlist.</p>
          <Link href="/account/auth">
            <Button variant="primary">Sign In Now</Button>
          </Link>
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-xs text-secondary-text animate-pulse">Loading wishlist...</div>
      ) : wishlistProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-black/5 shadow-card p-8 space-y-4 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-secondary-text mx-auto" />
          <h3 className="font-serif text-xl font-bold text-primary-text">Your Wishlist is Empty</h3>
          <p className="text-xs text-secondary-text">Click the heart icon on any product to save items for later.</p>
          <Link href="/products">
            <Button variant="primary">Explore Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
