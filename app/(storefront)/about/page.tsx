import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 space-y-20">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Our Philosophy</span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-primary-text leading-tight">
          Crafting Modern Artifacts for Contemporary Living
        </h1>
        <p className="text-sm text-secondary-text leading-relaxed pt-2">
          Founded on the principle that true luxury lies in restraint, precision craftsmanship, and uncompromised material honesty.
        </p>
      </div>

      <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-card border border-black/5">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop"
          alt="Studio Craftsmanship"
          fill
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8">
        <div className="space-y-3">
          <h3 className="font-serif text-2xl font-bold text-primary-text">1. Ethical Provenance</h3>
          <p className="text-xs text-secondary-text leading-relaxed">
            Every fiber, hide, and metal is sourced exclusively from certified ethical tanneries and mills in Northern Italy and Japan.
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="font-serif text-2xl font-bold text-primary-text">2. Architectural Form</h3>
          <p className="text-xs text-secondary-text leading-relaxed">
            We reject ephemeral trends in favor of geometric silhouettes engineered for functional longevity and quiet confidence.
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="font-serif text-2xl font-bold text-primary-text">3. Master Artisanal</h3>
          <p className="text-xs text-secondary-text leading-relaxed">
            Produced in limited, small-batch runs to ensure rigorous quality control and eliminate excess inventory waste.
          </p>
        </div>
      </div>
    </div>
  );
}
