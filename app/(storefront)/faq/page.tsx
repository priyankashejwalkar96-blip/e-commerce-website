"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const FAQ_ITEMS = [
  {
    q: 'What shipping options do you offer?',
    a: 'We offer Express Priority Shipping via FedEx/DHL. Shipping is complimentary on all orders over $150.',
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with tags intact.',
  },
  {
    q: 'Are your leather goods sustainably sourced?',
    a: 'Yes. All calfskin and hides are vegetable-tanned by certified tanneries in Tuscany adhering to strict European environmental standards.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order ships, you will receive a email notification containing your carrier tracking number. You can also view live tracking inside your account dashboard.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Help Center</span>
        <h1 className="font-serif text-4xl font-bold text-primary-text">Frequently Asked Questions</h1>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-black/5 shadow-card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-6 text-left font-serif text-lg font-bold text-primary-text flex justify-between items-center"
            >
              <span>{item.q}</span>
              <ChevronDown className={`w-5 h-5 text-secondary-text transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === idx && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-6 pb-6 text-xs text-secondary-text leading-relaxed border-t border-black/5 pt-4"
              >
                {item.a}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
