"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, History } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('luxe_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      // Ignore parse error
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*), images:product_images(*)')
          .eq('status', 'active')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(6);

        if (data) setResults(data as Product[]);
      } catch {
        // Handle search error silently
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSearch = (term: string) => {
    setQuery(term);
  };

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('luxe_recent_searches', JSON.stringify(updated));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Modal Overlay Content */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative max-w-3xl mx-auto mt-12 sm:mt-20 p-4"
          >
            <div className="bg-white rounded-3xl shadow-card border border-black/5 overflow-hidden">
              {/* Input Bar */}
              <div className="relative flex items-center px-6 py-4 border-b border-black/5">
                <Search className="w-5 h-5 text-secondary-text mr-3 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search products, collections, tags..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-lg font-medium text-primary-text outline-none placeholder:text-secondary-text/60"
                />
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-secondary-text hover:text-primary-text hover:bg-black/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {query.trim() === '' ? (
                  <div>
                    {recentSearches.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-3 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5" />
                          Recent Searches
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((term, i) => (
                            <button
                              key={i}
                              onClick={() => handleSelectSearch(term)}
                              className="px-3 py-1.5 bg-background-secondary rounded-xl text-xs font-medium text-primary-text hover:bg-black/10 transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <h4 className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-3">
                      Popular Suggestions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['Minimal Watch', 'Leather Tote', 'Ceramic Vase', 'Linen Shirt'].map((item) => (
                        <button
                          key={item}
                          onClick={() => handleSelectSearch(item)}
                          className="px-3 py-1.5 bg-background-secondary rounded-xl text-xs font-medium text-primary-text hover:bg-black/10 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : loading ? (
                  <div className="py-12 text-center text-sm text-secondary-text animate-pulse">
                    Searching catalog...
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm font-semibold text-primary-text">No products found</p>
                    <p className="text-xs text-secondary-text mt-1">
                      Try searching with different keywords like "leather" or "shirt".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-secondary-text">
                      Results ({results.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.map((product) => {
                        const img = product.images?.[0]?.image_url || '/placeholder.jpg';
                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => {
                              saveSearchTerm(query);
                              onClose();
                            }}
                            className="flex items-center gap-3 p-2.5 rounded-xl border border-black/5 hover:border-accent/40 bg-background-secondary/30 hover:bg-white transition-all group"
                          >
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0">
                              <Image
                                src={img}
                                alt={product.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h5 className="font-medium text-xs text-primary-text truncate group-hover:text-accent transition-colors">
                                {product.title}
                              </h5>
                              <p className="font-bold text-xs text-primary-text mt-1">
                                {formatCurrency(product.sale_price ?? product.price)}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-secondary-text group-hover:translate-x-1 group-hover:text-accent transition-all shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
