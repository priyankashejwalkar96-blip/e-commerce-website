"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, value, defaultValue, onChange, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      Boolean(value || defaultValue || (ref && typeof ref !== 'function' && ref.current?.value))
    );

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(Boolean(e.target.value));
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      onChange?.(e);
    };

    const isActive = isFocused || hasValue || Boolean(value);

    return (
      <div className="w-full flex flex-col gap-1 text-left">
        <div className="relative flex items-center">
          <input
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'w-full h-13 px-4 pt-5 pb-1 bg-white border border-black/15 rounded-xl text-sm font-medium text-primary-text outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20',
              icon && 'pl-11',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              className
            )}
            {...props}
          />

          {icon && <div className="absolute left-3.5 text-secondary-text pointer-events-none">{icon}</div>}

          <label
            className={cn(
              'absolute left-4 pointer-events-none text-xs font-medium text-secondary-text transition-all duration-200 origin-left',
              icon && 'left-11',
              isActive
                ? 'top-2 text-[10px] uppercase tracking-wider text-accent font-semibold'
                : 'top-3.5 text-sm text-secondary-text'
            )}
          >
            {label}
          </label>
        </div>
        {error && <span className="text-xs text-destructive pl-1 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
