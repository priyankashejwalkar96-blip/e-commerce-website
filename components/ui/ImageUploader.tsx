"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Check, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

const PRESET_SAMPLE_IMAGES = [
  { name: 'Swiss Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Leather Bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Wool Coat', url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Ceramic Vessel', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Cashmere Sweater', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Silver Ring', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop' },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = 'Product Image',
  value,
  onChange,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as Data URL (base64) so local files preview & persist instantly
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageError(false);
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (newUrl: string) => {
    setImageError(false);
    onChange(newUrl);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider">
          {label}
        </label>
        <div className="flex gap-1 bg-background-secondary p-1 rounded-xl text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'upload' ? 'bg-white text-primary-text shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'url' ? 'bg-white text-primary-text shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'presets' ? 'bg-white text-primary-text shadow-sm' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Presets</span>
          </button>
        </div>
      </div>

      {/* Live Preview Container */}
      {value ? (
        <div className="relative aspect-[16/9] sm:aspect-[2/1] w-full rounded-2xl overflow-hidden bg-background-secondary border border-black/10 shadow-sm group">
          {!imageError ? (
            <Image
              src={value}
              alt="Image Preview"
              fill
              unoptimized={value.startsWith('data:')}
              onError={() => setImageError(true)}
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-xs text-destructive space-y-1">
              <ImageIcon className="w-8 h-8 text-destructive/50" />
              <span className="font-bold">Image Failed to Load</span>
              <span className="text-[10px] text-secondary-text">Check your URL or select a local file.</span>
            </div>
          )}

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-primary-text rounded-xl text-xs font-bold shadow-md hover:bg-white/90 flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              Change Image
            </button>
            <button
              type="button"
              onClick={() => {
                setImageError(false);
                onChange('');
              }}
              className="p-1.5 bg-destructive text-white rounded-xl text-xs font-bold shadow-md hover:bg-destructive/90"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[16/9] sm:aspect-[2/1] w-full rounded-2xl border-2 border-dashed border-black/15 hover:border-accent bg-background-secondary/30 hover:bg-background-secondary/60 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-accent group-hover:scale-110 transition-transform shadow-sm">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-primary-text block">
              Click to upload image file
            </span>
            <span className="text-[11px] text-secondary-text">
              Supports PNG, JPG, WEBP, or GIF up to 10MB
            </span>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Tab Contents */}
      {activeTab === 'url' && (
        <div className="space-y-1">
          <input
            type="url"
            placeholder="Paste full image URL (https://...)"
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full h-11 px-4 text-xs bg-white border border-black/15 rounded-xl outline-none focus:border-accent font-mono"
          />
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="space-y-2">
          <span className="text-[11px] text-secondary-text font-semibold block">Select a curated sample image:</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_SAMPLE_IMAGES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleUrlChange(preset.url)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  value === preset.url ? 'border-accent ring-2 ring-accent/30 scale-105' : 'border-black/10 hover:border-black/30'
                }`}
                title={preset.name}
              >
                <Image src={preset.url} alt={preset.name} fill className="object-cover" />
                {value === preset.url && (
                  <div className="absolute inset-0 bg-accent/30 flex items-center justify-center text-white">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
