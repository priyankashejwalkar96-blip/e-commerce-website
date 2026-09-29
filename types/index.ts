export type UserRole = 'customer' | 'admin';
export type ProductStatus = 'draft' | 'active';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type CouponType = 'percentage' | 'fixed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  sale_start: string | null;
  sale_end: string | null;
  sku: string;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  status: ProductStatus;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  options?: ProductOption[];
  reviews_count?: number;
  average_rating?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  alt_text: string | null;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  values?: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price: number | null;
  stock_quantity: number;
  option_values: { option_name: string; value: string }[];
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  title: string;
  variant_info: { option_name: string; value: string }[] | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  product?: Product;
}

export interface OrderTimelineItem {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  shipping_address: Address;
  billing_address?: Address | null;
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon_code?: string | null;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  razorpay_payment_id?: string | null;
  tracking_number?: string | null;
  tracking_carrier?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  timeline?: OrderTimelineItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string;
  is_verified: boolean;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount: number;
  usage_limit: number | null;
  per_customer_limit: number;
  times_used: number;
  valid_from: string;
  valid_to: string | null;
  applicable_products: string[];
  applicable_categories: string[];
  is_active: boolean;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  heading: string;
  subheading: string | null;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
  badge?: string | null;
}

export interface StoreFeature {
  id: string;
  icon_name: string;
  image_url?: string | null;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (product.id + variant.id)
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  selectedOptions: Record<string, string>;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  logo_inverted_url: string | null;
  favicon_url: string | null;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  currency_code: string;
  currency_symbol: string;
  tax_rate: number;
  tax_inclusive: boolean;
  announcement_bar_active: boolean;
  announcement_bar_text: string | null;
  announcement_bar_link: string | null;
  announcement_bar_color: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  promo_banner_active?: boolean;
  promo_banner_badge?: string | null;
  promo_banner_title?: string | null;
  promo_banner_subtitle?: string | null;
  promo_banner_button_text?: string | null;
  promo_banner_button_link?: string | null;
  promo_banner_image_url?: string | null;
}
