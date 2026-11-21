import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { CATEGORIES, BRANDS, PRODUCTS, INITIAL_QR_CAMPAIGNS } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Supabase credentials are not configured in environment." },
        { status: 503 }
      );
    }

    const client = getServiceSupabase();
    const stats: any = {};

    // 1. Seed Categories
    const categoryIdMap: Record<string, string> = {};
    for (const cat of CATEGORIES) {
      const { data, error } = await client
        .from("categories")
        .upsert(
          {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            icon: cat.icon,
            image_url: cat.image_url,
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (!error && data) {
        categoryIdMap[cat.slug] = data.id;
        categoryIdMap[cat.id] = data.id;
      }
    }
    stats.categories = Object.keys(categoryIdMap).length;

    // 2. Seed Brands
    const brandIdMap: Record<string, string> = {};
    for (const b of BRANDS) {
      const { data, error } = await client
        .from("brands")
        .upsert(
          {
            name: b.name,
            slug: b.slug,
            logo_url: b.logo_url || null,
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (!error && data) {
        brandIdMap[b.slug] = data.id;
        brandIdMap[b.id] = data.id;
        brandIdMap[b.name.toLowerCase()] = data.id;
      }
    }
    stats.brands = Object.keys(brandIdMap).length;

    // 3. Seed Products & Product Variants
    let productCount = 0;
    let variantCount = 0;

    for (const prod of PRODUCTS) {
      const mappedCatId =
        categoryIdMap[prod.category_slug] ||
        categoryIdMap[prod.category_id] ||
        null;

      const mappedBrandId =
        brandIdMap[(prod as any).brand_slug || ""] ||
        brandIdMap[prod.brand_name.toLowerCase()] ||
        null;

      const { data: dbProduct, error: pErr } = await client
        .from("products")
        .upsert(
          {
            title: prod.title,
            slug: prod.slug,
            brand_id: mappedBrandId,
            category_id: mappedCatId,
            description: prod.description,
            features: prod.features || [],
            specs: prod.specs || {},
            images: prod.images || [],
            base_price: prod.base_price,
            featured: Boolean(prod.featured),
            best_seller: Boolean(prod.best_seller),
            new_arrival: Boolean(prod.new_arrival),
            is_active: true,
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (!pErr && dbProduct) {
        productCount++;

        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
          for (const v of prod.variants) {
            const { error: vErr } = await client
              .from("product_variants")
              .upsert(
                {
                  product_id: dbProduct.id,
                  sku: v.sku,
                  condition: v.condition || "brand_new",
                  storage: v.storage || null,
                  ram: v.ram || null,
                  color: v.color || "Default",
                  color_hex: v.color_hex || "#171717",
                  battery_health: v.battery_health || null,
                  warranty_months: v.warranty_months || 12,
                  price: v.price || prod.base_price,
                  original_price: v.original_price || null,
                  stock_quantity: v.stock_quantity ?? 5,
                },
                { onConflict: "sku" }
              );

            if (!vErr) variantCount++;
          }
        }
      } else if (pErr) {
        console.error("Product insert error:", prod.slug, pErr.message);
      }
    }
    stats.products = productCount;
    stats.variants = variantCount;

    // 4. Seed QR Campaigns
    let qrCount = 0;
    for (const qr of INITIAL_QR_CAMPAIGNS) {
      const { error: qrErr } = await client
        .from("qr_campaigns")
        .upsert(
          {
            campaign_name: qr.campaign_name,
            slug: qr.slug,
            destination_path: qr.destination_path,
            location_tag: qr.location_tag,
            is_active: qr.is_active,
            scans_count: qr.scans_count || 0,
            orders_count: qr.orders_count || 0,
            total_revenue: qr.total_revenue || 0,
          },
          { onConflict: "slug" }
        );

      if (!qrErr) qrCount++;
    }
    stats.qr_campaigns = qrCount;

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded from catalog!",
      stats,
    });
  } catch (err: any) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
