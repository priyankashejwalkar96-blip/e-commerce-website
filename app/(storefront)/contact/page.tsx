"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';

export default function ContactPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast('Thank you! Your message has been sent to our client care team.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 space-y-12">
      <div className="max-w-xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Client Services</span>
        <h1 className="font-serif text-4xl font-bold text-primary-text">Get in Touch</h1>
        <p className="text-xs text-secondary-text leading-relaxed">
          Have a question about sizing, materials, or custom orders? Our concierge team is available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Your Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email Address *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Input label="Subject *" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <div>
            <label className="block text-xs font-semibold text-secondary-text mb-1">Message *</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full p-4 text-xs bg-white border border-black/15 rounded-xl outline-none focus:border-accent resize-none"
              placeholder="How can we assist you today?"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={submitting}>
            <Send className="w-4 h-4 mr-2" />
            <span>Send Message</span>
          </Button>
        </form>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary-text">Email Enquiries</h4>
                <p className="text-xs text-secondary-text">concierge@luxecommerce.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary-text">Phone Direct</h4>
                <p className="text-xs text-secondary-text">+1 (800) 555-0199</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary-text">Flagship Studio</h4>
                <p className="text-xs text-secondary-text">100 Fashion Ave, New York, NY 10001</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
