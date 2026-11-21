-- ==============================================================================
-- AKI ENTERPRISE - CMS TABLES ADDITION FOR SUPABASE / POSTGRESQL
-- Tables: hero_banners, reviews, store_testimonials, store_settings
-- Run this in your Supabase SQL Editor to enable cross-device multi-admin sync.
-- ==============================================================================

-- 1. HERO BANNERS & HOMEPAGE SLIDES
CREATE TABLE IF NOT EXISTS public.hero_banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  badge TEXT NOT NULL,
  accent_color TEXT DEFAULT '#F26A00',
  image_url TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Shop Now',
  cta_link TEXT NOT NULL DEFAULT '/products',
  secondary_cta_text TEXT,
  secondary_cta_link TEXT,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_slug TEXT,
  product_title TEXT,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'approved', -- 'approved', 'pending', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STORE TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.store_testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  city TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  highlight TEXT NOT NULL,
  content TEXT NOT NULL,
  verified_buyer BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'approved', -- 'approved', 'pending', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORE SETTINGS & CMS POLICIES
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  store_name TEXT NOT NULL DEFAULT 'Aki Enterprise',
  tagline TEXT DEFAULT 'Original Electronics & Smart Devices • Ghana',
  business_name TEXT DEFAULT 'Aki Enterprise',
  owner_name TEXT DEFAULT 'Aki Enterprise Management',
  phone TEXT NOT NULL DEFAULT '0551243372',
  whatsapp TEXT NOT NULL DEFAULT '0551243372',
  email TEXT NOT NULL DEFAULT 'support@akienterprise.com',
  address TEXT NOT NULL DEFAULT 'Miaso, Kwahu East, Eastern Region, Ghana',
  city TEXT DEFAULT 'Miaso, Kwahu East',
  region TEXT DEFAULT 'Eastern Region',
  country TEXT DEFAULT 'Ghana',
  currency TEXT DEFAULT 'GH₵',
  announcement_text TEXT DEFAULT 'Free Delivery on Orders Above GH₵ 500 across Ghana | Genuine Warranty Guaranteed',
  announcement_enabled BOOLEAN DEFAULT true,
  delivery_fee NUMERIC(10, 2) DEFAULT 30.00,
  free_delivery_threshold NUMERIC(10, 2) DEFAULT 500.00,
  socials JSONB DEFAULT '{"facebook": "https://facebook.com/akienterprise", "instagram": "https://instagram.com/akienterprise", "tiktok": "https://tiktok.com/@akienterprise", "x": "https://x.com/akienterprise", "whatsapp": "https://wa.me/233551243372"}'::jsonb,
  policies JSONB DEFAULT '{}'::jsonb,
  google_merchant JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public hero banners viewable" ON public.hero_banners FOR SELECT USING (true);
CREATE POLICY "Public reviews viewable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public store testimonials viewable" ON public.store_testimonials FOR SELECT USING (true);
CREATE POLICY "Public store settings viewable" ON public.store_settings FOR SELECT USING (true);

-- Public Submit Permissions (Customers can post reviews & feedback)
CREATE POLICY "Public can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit testimonials" ON public.store_testimonials FOR INSERT WITH CHECK (true);

-- Service Role Full Access (Admin management via backend APIs)
GRANT ALL ON TABLE public.hero_banners TO service_role, anon, authenticated;
GRANT ALL ON TABLE public.reviews TO service_role, anon, authenticated;
GRANT ALL ON TABLE public.store_testimonials TO service_role, anon, authenticated;
GRANT ALL ON TABLE public.store_settings TO service_role, anon, authenticated;

-- ==============================================================================
-- 6. DEFAULT DATA SEEDING
-- ==============================================================================

-- Seed Default Hero Banners
INSERT INTO public.hero_banners (title, subtitle, badge, accent_color, image_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order, is_active)
VALUES
  (
    'The Latest Technology. Better Prices.',
    'Discover certified smartphones, original accessories, and everyday electronics at wholesale-direct retail prices in Ghana. Shop warranty guaranteed.',
    'Premium Electronics • Aki Enterprise',
    '#F26A00',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1920&q=80',
    'Shop Now',
    '/products?category=smartphones',
    'Explore Deals',
    '/products?featured=true',
    1,
    true
  ),
  (
    'Pristine iPhones & Samsungs. Tested Battery.',
    'Grade-A UK-used devices thoroughly checked with 90%+ battery health, zero cosmetic scratches, and 6-month Aki Enterprise warranty. Pay via MoMo on arrival.',
    'Certified UK-Used Flagships',
    '#EA580C',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1920&q=80',
    'Browse UK-Used',
    '/products?category=smartphones&condition=uk_used',
    'View All Phones',
    '/products?category=smartphones',
    2,
    true
  ),
  (
    'Zero Battery Anxiety. Anker Fast Charging.',
    'Original Anker 65W GaN III adapters, 20,000mAh power banks, and heavy-duty braided cables built to survive daily power cuts and travel.',
    'Fast GaN & High Capacity Power',
    '#2563EB',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1920&q=80',
    'Shop Fast Chargers',
    '/products?category=power-banks-chargers',
    'View Power Banks',
    '/products?category=power-banks-chargers',
    3,
    true
  ),
  (
    'High-Speed Crucial RAM & Gen4 NVMe SSDs.',
    'Supercharge your laptop multitasking and boot speed. Free in-store installation and Windows OS migration assistance at our Miaso shop.',
    'PC & Laptop Performance Upgrades',
    '#7C3AED',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=80',
    'Explore PC Parts',
    '/products?category=computer-accessories',
    'RAM & Storage',
    '/products?category=computer-accessories',
    4,
    true
  )
ON CONFLICT DO NOTHING;

-- Seed Default Testimonials
INSERT INTO public.store_testimonials (customer_name, city, rating, highlight, content, verified_buyer, featured, status)
VALUES
  (
    'Kofi Asante',
    'East Legon, Accra',
    5,
    'Transparent Battery Health & Real Warranty',
    'Bought a UK-used iPhone 13 Pro. Before payment, they plugged it into 3uTools in front of me to verify 92% battery health, zero parts replaced, and gave me an official receipt with warranty.',
    true,
    true,
    'approved'
  ),
  (
    'Esi Mansa',
    'Kumasi, Ashanti Region',
    5,
    'Fast Dispatch & Secure Delivery',
    'I ordered an Anker 20,000mAh power bank from Kumasi. Sent money through MTN MoMo and package arrived the next afternoon via VIP Parcel. 100% original packaging.',
    true,
    true,
    'approved'
  ),
  (
    'Daniel Ofori',
    'Miaso, Kwahu East',
    5,
    'Best Electronics Shop in Kwahu',
    'Having a genuine gadget shop right in Kwahu East with Accra wholesale prices is a blessing. Friendly staff, authentic original chargers, and solid technical knowledge.',
    true,
    true,
    'approved'
  )
ON CONFLICT DO NOTHING;
