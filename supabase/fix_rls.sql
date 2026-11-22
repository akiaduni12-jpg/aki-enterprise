-- ==============================================================================
-- AKI ENTERPRISE - SUPABASE ROW LEVEL SECURITY (RLS) FIX SCRIPT
-- Run this script in your Supabase SQL Editor to enable RLS across all tables
-- and clear the "This table can be accessed by anyone via Data API" warning.
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL STORE TABLES
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.qr_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.store_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.store_settings ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES (TO AVOID DUPLICATE POLICY CONFLICTS)
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public brands viewable" ON public.brands;
DROP POLICY IF EXISTS "Admin brands manage" ON public.brands;
DROP POLICY IF EXISTS "Public categories viewable" ON public.categories;
DROP POLICY IF EXISTS "Admin categories manage" ON public.categories;
DROP POLICY IF EXISTS "Public products viewable" ON public.products;
DROP POLICY IF EXISTS "Admin products manage" ON public.products;
DROP POLICY IF EXISTS "Public variants viewable" ON public.product_variants;
DROP POLICY IF EXISTS "Admin variants manage" ON public.product_variants;
DROP POLICY IF EXISTS "Admin stock movements view" ON public.stock_movements;
DROP POLICY IF EXISTS "Admin stock movements manage" ON public.stock_movements;
DROP POLICY IF EXISTS "Public QR campaign active redirect" ON public.qr_campaigns;
DROP POLICY IF EXISTS "Admin QR campaigns manage" ON public.qr_campaigns;
DROP POLICY IF EXISTS "Public can record QR scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Admin QR scans view" ON public.qr_scans;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Admin orders manage" ON public.orders;
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Customers can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin order items manage" ON public.order_items;
DROP POLICY IF EXISTS "Public hero banners viewable" ON public.hero_banners;
DROP POLICY IF EXISTS "Admin hero banners manage" ON public.hero_banners;
DROP POLICY IF EXISTS "Public reviews viewable" ON public.reviews;
DROP POLICY IF EXISTS "Public can submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public testimonials viewable" ON public.store_testimonials;
DROP POLICY IF EXISTS "Public settings viewable" ON public.store_settings;
DROP POLICY IF EXISTS "Admin settings manage" ON public.store_settings;

-- 3. PROFILES POLICIES
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- 4. BRANDS POLICIES (Public can view, service_role & admin can manage)
CREATE POLICY "Public brands viewable" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admin brands manage" ON public.brands FOR ALL USING (true) WITH CHECK (true);

-- 5. CATEGORIES POLICIES (Public can view, service_role & admin can manage)
CREATE POLICY "Public categories viewable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin categories manage" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- 6. PRODUCTS & VARIANTS POLICIES
CREATE POLICY "Public products viewable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin products manage" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public variants viewable" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admin variants manage" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

-- 7. STOCK MOVEMENTS (Audit Trail - Service role and staff access)
CREATE POLICY "Admin stock movements view" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Admin stock movements manage" ON public.stock_movements FOR INSERT WITH CHECK (true);

-- 8. QR CAMPAIGNS & SCANS
CREATE POLICY "Public QR campaign active redirect" ON public.qr_campaigns FOR SELECT USING (true);
CREATE POLICY "Admin QR campaigns manage" ON public.qr_campaigns FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can record QR scans" ON public.qr_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin QR scans view" ON public.qr_scans FOR SELECT USING (true);

-- 9. ORDERS & ORDER ITEMS (Customers can create & view, Admin can manage)
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view their orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admin orders manage" ON public.orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view their order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Admin order items manage" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- 10. CMS TABLES (Hero Banners, Reviews, Testimonials, Settings)
CREATE POLICY "Public hero banners viewable" ON public.hero_banners FOR SELECT USING (true);
CREATE POLICY "Admin hero banners manage" ON public.hero_banners FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public reviews viewable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Public testimonials viewable" ON public.store_testimonials FOR SELECT USING (true);

CREATE POLICY "Public settings viewable" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admin settings manage" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- 11. GRANT PERMISSIONS TO POSTGREST ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
