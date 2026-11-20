-- ==============================================================================
-- TECHHUB (AKI ENTERPRISE) - DATABASE SCHEMA FOR SUPABASE / POSTGRESQL
-- E-Commerce Web Application (Storefront, Multi-Variant Catalog, Orders & QR)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES & ROLES
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'inventory_staff', 'customer');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  base_price NUMERIC(12, 2) NOT NULL,
  featured BOOLEAN DEFAULT false,
  best_seller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT VARIANTS (Condition: Brand New, UK-Used, Refurbished; Storage, RAM, Color, Warranty)
CREATE TYPE product_condition AS ENUM ('brand_new', 'uk_used', 'refurbished');

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  condition product_condition NOT NULL DEFAULT 'brand_new',
  storage TEXT,          -- e.g. '128GB', '256GB', '512GB'
  ram TEXT,              -- e.g. '8GB', '12GB'
  color TEXT NOT NULL,   -- e.g. 'Space Black', 'Titanium'
  color_hex TEXT,        -- e.g. '#232323'
  battery_health TEXT,   -- e.g. '90%+', '100%'
  warranty_months INTEGER DEFAULT 12,
  price NUMERIC(12, 2) NOT NULL,
  original_price NUMERIC(12, 2),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVENTORY MOVEMENTS (Stock In, Stock Out, Audit Trail)
CREATE TYPE movement_reason AS ENUM ('purchase_restock', 'order_sale', 'manual_adjustment', 'damaged', 'customer_return');

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE NOT NULL,
  change_amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason movement_reason NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QR CAMPAIGNS (Physical shop posters, shelf tags, flyers)
CREATE TABLE IF NOT EXISTS public.qr_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  destination_path TEXT NOT NULL,
  location_tag TEXT NOT NULL, -- e.g. 'Osu Branch Main Shelf', 'Accra Mall Stand'
  is_active BOOLEAN DEFAULT true,
  scans_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.qr_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.qr_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS & FULFILLMENT
CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'paid',
  'processing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE fulfillment_type AS ENUM ('shop_pickup', 'delivery');
CREATE TYPE payment_method AS ENUM ('paystack_momo', 'paystack_card', 'cash_on_pickup');

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  fulfillment_type fulfillment_type NOT NULL DEFAULT 'delivery',
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_notes TEXT,
  subtotal NUMERIC(12, 2) NOT NULL,
  delivery_fee NUMERIC(12, 2) DEFAULT 0.00,
  discount_amount NUMERIC(12, 2) DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'paystack_momo',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  paystack_reference TEXT,
  order_status order_status NOT NULL DEFAULT 'pending_payment',
  qr_campaign_id UUID REFERENCES public.qr_campaigns(id) ON DELETE SET NULL,
  staff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  variant_sku TEXT NOT NULL,
  condition product_condition NOT NULL,
  storage TEXT,
  ram TEXT,
  color TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(12, 2) NOT NULL,
  image_url TEXT
);

-- 9. ROW LEVEL SECURITY (RLS) & PRIVILEGES
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_campaigns ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public brands viewable" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public categories viewable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products viewable" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public variants viewable" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public QR campaign active redirect" ON public.qr_campaigns FOR SELECT USING (is_active = true);

-- Public checkout (customers can create orders & items)
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Orders viewable by creator or staff
CREATE POLICY "Customers can view their orders" ON public.orders FOR SELECT
  USING (true);
CREATE POLICY "Customers can view their order items" ON public.order_items FOR SELECT
  USING (true);

-- 10. POSTGRES PRIVILEGES FOR POSTGREST (Anon, Authenticated & Service Role)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
