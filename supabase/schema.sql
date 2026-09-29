-- Supabase Schema for E-Commerce Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'active');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE fulfillment_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'Luxe Commerce' NOT NULL,
  tagline TEXT DEFAULT 'Curated Luxury Essentials',
  logo_url TEXT,
  logo_inverted_url TEXT,
  favicon_url TEXT,
  contact_email TEXT DEFAULT 'support@luxecommerce.com',
  contact_phone TEXT DEFAULT '+1 (800) 555-0199',
  business_address TEXT DEFAULT '100 Fashion Ave, New York, NY 10001',
  currency_code TEXT DEFAULT 'USD' NOT NULL,
  currency_symbol TEXT DEFAULT '$' NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 8.50 NOT NULL,
  tax_inclusive BOOLEAN DEFAULT false NOT NULL,
  announcement_bar_active BOOLEAN DEFAULT true NOT NULL,
  announcement_bar_text TEXT DEFAULT 'Complimentary Express Shipping on Orders Over $150',
  announcement_bar_link TEXT DEFAULT '/products',
  announcement_bar_color TEXT DEFAULT '#1A1A1A',
  social_instagram TEXT DEFAULT 'https://instagram.com',
  social_facebook TEXT DEFAULT 'https://facebook.com',
  social_twitter TEXT DEFAULT 'https://twitter.com',
  social_tiktok TEXT DEFAULT 'https://tiktok.com',
  social_youtube TEXT DEFAULT 'https://youtube.com',
  promo_banner_active BOOLEAN DEFAULT true,
  promo_banner_badge TEXT DEFAULT 'LIMITED TIME EVENT',
  promo_banner_title TEXT DEFAULT 'The Private Seasonal Sale: Up to 30% Off',
  promo_banner_subtitle TEXT DEFAULT 'Enjoy exclusive savings on selected archival outerwear, leather footwear, and minimalist timepieces.',
  promo_banner_button_text TEXT DEFAULT 'Shop Private Sale',
  promo_banner_button_link TEXT DEFAULT '/products?sale=true',
  promo_banner_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. SEO Settings Table
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meta_title_template TEXT DEFAULT '{Page Title} | Luxe Commerce' NOT NULL,
  default_meta_description TEXT DEFAULT 'Discover timeless luxury and modern design essentials.',
  og_default_image_url TEXT,
  ga_tracking_id TEXT,
  fb_pixel_id TEXT,
  search_console_meta TEXT,
  robots_txt TEXT DEFAULT 'User-agent: *' || chr(10) || 'Allow: /' || chr(10) || 'Disallow: /admin/',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Page SEO Table
CREATE TABLE IF NOT EXISTS page_seo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT UNIQUE NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  og_image_url TEXT
);

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  sku TEXT UNIQUE NOT NULL,
  stock_quantity INT DEFAULT 0 NOT NULL,
  track_inventory BOOLEAN DEFAULT true NOT NULL,
  allow_backorders BOOLEAN DEFAULT false NOT NULL,
  status product_status DEFAULT 'draft' NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  alt_text TEXT
);

-- 8. Product Options Table (e.g., Size, Color)
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL
);

-- 9. Product Option Values Table (e.g., XL, Red)
CREATE TABLE IF NOT EXISTS product_option_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id UUID REFERENCES product_options(id) ON DELETE CASCADE NOT NULL,
  value TEXT NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL
);

-- 10. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price NUMERIC(10,2),
  stock_quantity INT DEFAULT 0 NOT NULL,
  option_values JSONB DEFAULT '[]'::JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'US' NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Orders Sequence for Order Number Generation
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 10001;

-- 12. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE DEFAULT ('ORD-' || nextval('order_number_seq')::TEXT) NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method TEXT DEFAULT 'Standard Shipping' NOT NULL,
  shipping_cost NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  fulfillment_status fulfillment_status DEFAULT 'pending' NOT NULL,
  razorpay_payment_id TEXT,
  tracking_number TEXT,
  tracking_carrier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  variant_info JSONB,
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL
);

-- 14. Order Timeline Table
CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type coupon_type DEFAULT 'percentage' NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  usage_limit INT,
  per_customer_limit INT DEFAULT 1 NOT NULL,
  times_used INT DEFAULT 0 NOT NULL,
  valid_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valid_to TIMESTAMPTZ,
  applicable_products UUID[] DEFAULT '{}'::UUID[],
  applicable_categories UUID[] DEFAULT '{}'::UUID[],
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 18. Hero Slides Table
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  heading TEXT NOT NULL,
  subheading TEXT,
  badge TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/products',
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- 18b. Store Features / Trust Badges Table
CREATE TABLE IF NOT EXISTS store_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon_name TEXT DEFAULT 'Truck' NOT NULL,
  image_url TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- 19. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- 20. Media Table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size INT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profile creation on Supabase Auth Sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- Public Readable Tables
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON products FOR SELECT USING (status = 'active' OR is_admin());
CREATE POLICY "Public product images read" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public product options read" ON product_options FOR SELECT USING (true);
CREATE POLICY "Public product option values read" ON product_option_values FOR SELECT USING (true);
CREATE POLICY "Public product variants read" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public site_settings read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public seo_settings read" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Public page_seo read" ON page_seo FOR SELECT USING (true);
CREATE POLICY "Public hero_slides read" ON hero_slides FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Public reviews read" ON reviews FOR SELECT USING (true);

-- Admin Full Access Policies
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (is_admin());
CREATE POLICY "Admin full access products" ON products FOR ALL USING (is_admin());
CREATE POLICY "Admin full access product_images" ON product_images FOR ALL USING (is_admin());
CREATE POLICY "Admin full access product_options" ON product_options FOR ALL USING (is_admin());
CREATE POLICY "Admin full access product_option_values" ON product_option_values FOR ALL USING (is_admin());
CREATE POLICY "Admin full access product_variants" ON product_variants FOR ALL USING (is_admin());
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL USING (is_admin());
CREATE POLICY "Admin full access seo_settings" ON seo_settings FOR ALL USING (is_admin());
CREATE POLICY "Admin full access page_seo" ON page_seo FOR ALL USING (is_admin());
CREATE POLICY "Admin full access hero_slides" ON hero_slides FOR ALL USING (is_admin());
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL USING (is_admin());
CREATE POLICY "Admin full access media" ON media FOR ALL USING (is_admin());

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Addresses Policies
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id OR is_admin());

-- Wishlist Policies
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- Orders Policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (is_admin());

-- Order Items Policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Reviews Policies
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admin can delete reviews" ON reviews FOR DELETE USING (is_admin());

-- Subscribers Policy
CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT WITH CHECK (true);

-- Insert Initial Default Settings
INSERT INTO site_settings (site_name, tagline) VALUES ('LUXE', 'Elevated Contemporary Essentials') ON CONFLICT DO NOTHING;
INSERT INTO seo_settings (meta_title_template) VALUES ('{Page Title} | LUXE') ON CONFLICT DO NOTHING;
