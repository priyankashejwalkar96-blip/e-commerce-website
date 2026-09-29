-- Seed Data for E-Commerce Platform

-- Insert Categories
INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
('Apparel & Outerwear', 'apparel', 'Tailored coats, jackets, and organic cotton essentials.', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop', 1),
('Leather Goods', 'leather-goods', 'Handcrafted calfskin weekender bags, totes, and wallets.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', 2),
('Timepieces & Jewelry', 'jewelry', 'Swiss movement watches and solid silver signet rings.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', 3),
('Home & Living', 'home-living', 'Architectural stoneware vessels, linen throws, and scents.', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert Hero Slides
INSERT INTO hero_slides (image_url, heading, subheading, cta_text, cta_link, sort_order) VALUES
('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop', 'Redefining Modern Luxury Essentials', 'Discover meticulously crafted garments and timeless accessories.', 'Explore Collection', '/products', 1),
('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop', 'Autumn Winter Capsule 2026', 'Uncompromising quality meets architectural minimalism.', 'Shop New Arrivals', '/products?sort=newest', 2);

-- Insert Sample Coupons
INSERT INTO coupons (code, type, value, min_order_amount, is_active) VALUES
('LUXE15', 'percentage', 15, 100, true),
('WELCOME50', 'fixed', 50, 250, true)
ON CONFLICT (code) DO NOTHING;
