"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          toast(error.message, 'error');
        } else {
          toast('Successfully signed in!', 'success');
          router.push('/account');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) {
          toast(error.message, 'error');
        } else {
          toast('Account created! Please check your email for confirmation.', 'success');
          setMode('signin');
        }
      }
    } catch {
      toast('Authentication request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Client Portal</span>
        <h1 className="font-serif text-3xl font-bold text-primary-text">
          {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="text-xs text-secondary-text">
          {mode === 'signin'
            ? 'Sign in to access your orders, wishlist, and exclusive offers.'
            : 'Join the LUXE private client list for elevated shopping experiences.'}
        </p>
      </div>

      {/* Mode Switcher Pills */}
      <div className="flex bg-background-secondary p-1 rounded-2xl border border-black/5">
        <button
          onClick={() => setMode('signin')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            mode === 'signin'
              ? 'bg-white text-primary-text shadow-card'
              : 'text-secondary-text hover:text-primary-text'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            mode === 'signup'
              ? 'bg-white text-primary-text shadow-card'
              : 'text-secondary-text hover:text-primary-text'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Auth Form */}
      <motion.form
        key={mode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleAuth}
        className="bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-4"
      >
        {mode === 'signup' && (
          <Input
            label="Full Name *"
            icon={<UserIcon className="w-4 h-4" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        <Input
          label="Email Address *"
          type="email"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password *"
          type="password"
          icon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
          <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.form>
    </div>
  );
}
