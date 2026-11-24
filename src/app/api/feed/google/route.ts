import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { PRODUCTS } from "@/lib/mock-data";
import { Product } from "@/types/ecommerce";
import { generateGoogleMerchantXml, generateGoogleMerchantTsv } from "@/lib/google-merchant";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "xml").toLowerCase();

    // Determine Base URL
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "akiaduniventures.com";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    let products: Product[] = PRODUCTS;

    // Fetch live products from Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const client = getServiceSupabase();
        const { data: dbProducts, error } = await client
          .from("products")
          .select(`
            *,
            product_variants (*),
            categories (id, name, slug),
            brands (id, name, slug)
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!error && dbProducts && dbProducts.length > 0) {
          products = dbProducts.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            brand_id: p.brand_id,
            brand_name: p.brands?.name || p.brand_name || "Aki Enterprise",
            category_id: p.category_id,
            category_slug: p.categories?.slug || p.category_slug || "smartphones",
            category_name: p.categories?.name || p.category_name || "Smartphones",
            description: p.description || "",
            features: p.features || [],
            specs: p.specs || {},
            images: p.images || [],
            base_price: Number(p.base_price) || 0,
            featured: Boolean(p.featured),
            best_seller: Boolean(p.best_seller),
            new_arrival: Boolean(p.new_arrival),
            created_at: p.created_at,
            variants: (p.product_variants || []).map((v: any) => ({
              id: v.id,
              product_id: v.product_id,
              sku: v.sku,
              condition: v.condition || "brand_new",
              storage: v.storage,
              ram: v.ram,
              color: v.color || "Default",
              color_hex: v.color_hex || "#171717",
              battery_health: v.battery_health,
              warranty_months: Number(v.warranty_months) || 12,
              price: Number(v.price) || Number(p.base_price) || 0,
              original_price: v.original_price ? Number(v.original_price) : undefined,
              stock_quantity: Number(v.stock_quantity) || 5,
            })),
          }));
        }
      } catch (dbErr) {
        console.warn("[Google Merchant Feed] Supabase query notice, using catalog fallback:", dbErr);
      }
    }

    if (format === "tsv") {
      const tsvContent = generateGoogleMerchantTsv(products, baseUrl);
      return new NextResponse(tsvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/tab-separated-values; charset=utf-8",
          "Content-Disposition": 'attachment; filename="google-merchant-feed.tsv"',
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    // Default: RSS 2.0 / XML Feed
    const xmlContent = generateGoogleMerchantXml(products, baseUrl);
    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    console.error("[Google Merchant Feed Error]:", err);
    return new NextResponse(`<error>${err.message}</error>`, {
      status: 500,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
