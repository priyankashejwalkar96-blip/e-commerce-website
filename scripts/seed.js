const { createClient } = require('@supabase/supabase-js');

const url = 'https://ugsiyutonjwwmeyjzwie.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc2l5dXRvbmp3d21leWp6d2llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDQwMjg4MCwiZXhwIjoyMTA1OTc4ODgwfQ.PYAPun3bf8wdXdLr5Wm6T5t8Dpr6X8hWEanejIgZVpg';

const supabase = createClient(url, serviceKey);

async function seed() {
  console.log('Seeding Supabase database...');

  // 1. Categories
  const categoriesData = [
    {
      name: 'Apparel & Outerwear',
      slug: 'apparel',
      description: 'Tailored coats, jackets, knitwear, and organic cotton essentials.',
      image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop',
      sort_order: 1
    },
    {
      name: 'Leather Goods',
      slug: 'leather-goods',
      description: 'Handcrafted calfskin weekender bags, totes, and accessories.',
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
      sort_order: 2
    },
    {
      name: 'Timepieces & Jewelry',
      slug: 'jewelry',
      description: 'Swiss movement watches and solid sterling silver jewelry.',
      image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      sort_order: 3
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Architectural stoneware vessels, pure linen throws, and scents.',
      image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
      sort_order: 4
    }
  ];

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .upsert(categoriesData, { onConflict: 'slug' })
    .select();

  if (catError) {
    console.error('Category error:', catError);
    return;
  }
  console.log(`Seeded ${categories.length} categories.`);

  const catMap = {};
  categories.forEach((c) => {
    catMap[c.slug] = c.id;
  });

  // 2. Products
  const productsData = [
    {
      title: 'Monochrome Tailored Wool Trench Coat',
      slug: 'monochrome-tailored-coat',
      description: 'Double-breasted coat crafted from pure merino wool with horn buttons, lapel collars, and a belted waist for silhouette customization.',
      category_id: catMap['apparel'],
      price: 495.00,
      sale_price: 395.00,
      sku: 'COAT-001',
      stock_quantity: 15,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['new', 'outerwear', 'bestseller'],
      image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Oversized Organic Cashmere Sweater',
      slug: 'organic-cashmere-sweater',
      description: 'Ultra-soft Mongolian cashmere ribbed knit sweater designed with dropped shoulders and a relaxed modern fit.',
      category_id: catMap['apparel'],
      price: 320.00,
      sale_price: null,
      sku: 'KNIT-002',
      stock_quantity: 20,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['knitwear', 'new'],
      image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Tailored Italian Wool Trousers',
      slug: 'tailored-wool-trousers',
      description: 'Structured high-waist pleated trousers woven in Biella, Italy with sharp central creases and discreet side pockets.',
      category_id: catMap['apparel'],
      price: 280.00,
      sale_price: 240.00,
      sku: 'PANT-003',
      stock_quantity: 18,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['apparel', 'tailoring'],
      image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Minimalist Silk Slip Dress',
      slug: 'minimalist-silk-dress',
      description: 'Fluid bias-cut silk dress featuring adjustable spaghetti straps and a subtle cowl neckline.',
      category_id: catMap['apparel'],
      price: 360.00,
      sale_price: null,
      sku: 'DRESS-004',
      stock_quantity: 10,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['silk', 'evening'],
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Italian Full-Grain Leather Weekender Bag',
      slug: 'leather-weekender-bag',
      description: 'Handcrafted in Florence from vegetable-tanned calfskin leather with solid brass hardware and detachable shoulder strap.',
      category_id: catMap['leather-goods'],
      price: 680.00,
      sale_price: 590.00,
      sku: 'BAG-001',
      stock_quantity: 12,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['leather', 'travel', 'bestseller'],
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Minimalist Calfskin Tote Bag',
      slug: 'calfskin-tote-bag',
      description: 'Spacious open-top tote with unlined suede interior and internal zip pocket.',
      category_id: catMap['leather-goods'],
      price: 420.00,
      sale_price: null,
      sku: 'BAG-002',
      stock_quantity: 14,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['tote', 'workwear'],
      image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Handcrafted Bifold Leather Wallet',
      slug: 'bifold-leather-wallet',
      description: 'Slimline leather wallet with 8 card slots, dual currency compartments, and RFID blocking layer.',
      category_id: catMap['leather-goods'],
      price: 145.00,
      sale_price: 115.00,
      sku: 'WALLET-003',
      stock_quantity: 25,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['accessories', 'leather'],
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Swiss Movement Sapphire Watch',
      slug: 'swiss-movement-watch',
      description: '38mm brushed stainless steel casing featuring anti-reflective domed sapphire glass and quick-release Italian leather strap.',
      category_id: catMap['jewelry'],
      price: 340.00,
      sale_price: null,
      sku: 'WATCH-001',
      stock_quantity: 15,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['watch', 'swiss', 'featured'],
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Solid Sterling Silver Signet Ring',
      slug: 'sterling-silver-signet-ring',
      description: 'Hand-carved 925 sterling silver ring with brushed face and polished bevel edges.',
      category_id: catMap['jewelry'],
      price: 165.00,
      sale_price: 135.00,
      sku: 'RING-002',
      stock_quantity: 30,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['jewelry', 'silver'],
      image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Architectural Ceramic Table Vessel',
      slug: 'ceramic-vessel',
      description: 'Hand-thrown stoneware sculptural vase finished in a tactile matte reactive glaze finish.',
      category_id: catMap['home-living'],
      price: 185.00,
      sale_price: null,
      sku: 'HOME-001',
      stock_quantity: 8,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['home', 'ceramics'],
      image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Pure French Linen Throw Blanket',
      slug: 'pure-linen-throw',
      description: 'Washed European flax linen throw blanket with delicate eyelash fringe edges.',
      category_id: catMap['home-living'],
      price: 210.00,
      sale_price: 175.00,
      sku: 'HOME-002',
      stock_quantity: 16,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['textiles', 'home'],
      image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Hand-Poured Botanical Scented Candle',
      slug: 'botanical-scented-candle',
      description: 'Natural soy wax candle scented with sandalwood, amber, and smoked vetiver in mouth-blown tinted glass vessel.',
      category_id: catMap['home-living'],
      price: 65.00,
      sale_price: null,
      sku: 'HOME-003',
      stock_quantity: 40,
      track_inventory: true,
      allow_backorders: false,
      status: 'active',
      tags: ['candle', 'fragrance'],
      image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1000&auto=format&fit=crop'
    }
  ];

  for (const prod of productsData) {
    const { image_url, ...prodFields } = prod;
    const { data: insertedProd, error: prodErr } = await supabase
      .from('products')
      .upsert(prodFields, { onConflict: 'slug' })
      .select()
      .single();

    if (prodErr) {
      console.error(`Error inserting ${prod.title}:`, prodErr);
      continue;
    }

    if (insertedProd) {
      // Add product image
      await supabase.from('product_images').upsert({
        product_id: insertedProd.id,
        image_url: image_url,
        sort_order: 0,
        alt_text: insertedProd.title
      }, { onConflict: 'id' });
    }
  }

  console.log('Seeded all products & images successfully!');

  // 3. Hero Slides
  const slides = [
    {
      image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
      heading: 'Redefining Modern Luxury Essentials',
      subheading: 'Discover meticulously crafted garments and timeless accessories for contemporary living.',
      cta_text: 'Explore Collection',
      cta_link: '/products',
      sort_order: 1,
      is_active: true
    },
    {
      image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
      heading: 'Autumn Winter Capsule 2026',
      subheading: 'Uncompromising quality meets architectural minimalism. Made from organic natural fibers.',
      cta_text: 'Shop New Arrivals',
      cta_link: '/products?sort=newest',
      sort_order: 2,
      is_active: true
    },
    {
      image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
      heading: 'The Art of Subtle Elegance',
      subheading: 'Tailored silhouettes engineered for effortless elegance every day.',
      cta_text: 'View Lookbook',
      cta_link: '/products',
      sort_order: 3,
      is_active: true
    }
  ];

  await supabase.from('hero_slides').insert(slides);
  console.log('Seeded hero slides.');
}

seed().catch(console.error);
