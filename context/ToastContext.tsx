"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => {
    toast(message, 'success', title);
  }, [toast]);

  const error = useCallback((message: string, title?: string) => {
    toast(message, 'error', title);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="sync">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="pointer-events-auto bg-white border border-black/5 shadow-card rounded-xl overflow-hidden p-4 relative flex gap-3 items-start"
            >
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />}

              <div className="flex-1 pr-4">
                {t.title && <h4 className="font-semibold text-sm text-primary-text mb-0.5">{t.title}</h4>}
                <p className="text-xs text-secondary-text leading-relaxed">{t.message}</p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-secondary-text hover:text-primary-text p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress Bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3.5, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${
                  t.type === 'success' ? 'bg-success' : t.type === 'error' ? 'bg-destructive' : 'bg-accent'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
