import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { PRODUCTS } from "@/lib/mock-data";
import { Product } from "@/types/ecommerce";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, products: PRODUCTS, localOnly: true });
    }

    const client = getServiceSupabase();
    const { data: dbProducts, error } = await client
      .from("products")
      .select(`
        *,
        product_variants (*)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ success: true, products: PRODUCTS, fallback: true });
    }

    const formatted: Product[] = dbProducts.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      brand_id: p.brand_id,
      brand_name: p.brand_name || "Aki Enterprise",
      category_id: p.category_id,
      category_slug: p.category_slug || "smartphones",
      category_name: p.category_name || "Smartphones",
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

    return NextResponse.json({ success: true, products: formatted });
  } catch (err: any) {
    console.error("[API Products GET] error:", err);
    return NextResponse.json({ success: true, products: PRODUCTS, error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const productData = await req.json();
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, product: productData, localOnly: true });
    }

    const client = getServiceSupabase();
    const slug =
      productData.slug ||
      productData.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    // 1. Upsert product
    const { data: insertedProduct, error: pError } = await client
      .from("products")
      .upsert(
        {
          title: productData.title,
          slug,
          description: productData.description || "",
          base_price: Number(productData.base_price) || 0,
          images: productData.images || [],
          features: productData.features || [],
          specs: productData.specs || {},
          featured: Boolean(productData.featured),
          best_seller: Boolean(productData.best_seller),
          new_arrival: Boolean(productData.new_arrival),
          category_id: productData.category_id || undefined,
          brand_id: productData.brand_id || undefined,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (pError || !insertedProduct) {
      return NextResponse.json({ success: false, error: pError?.message }, { status: 400 });
    }

    // 2. Insert variants if present
    if (productData.variants && productData.variants.length > 0) {
      const variantPayloads = productData.variants.map((v: any) => ({
        product_id: insertedProduct.id,
        sku: v.sku || `${slug}-${Date.now()}`,
        condition: v.condition || "brand_new",
        storage: v.storage,
        ram: v.ram,
        color: v.color || "Default",
        color_hex: v.color_hex || "#171717",
        battery_health: v.battery_health,
        warranty_months: Number(v.warranty_months) || 12,
        price: Number(v.price) || Number(productData.base_price) || 0,
        original_price: v.original_price ? Number(v.original_price) : null,
        stock_quantity: Number(v.stock_quantity) || 5,
        updated_at: new Date().toISOString(),
      }));

      await client.from("product_variants").upsert(variantPayloads, { onConflict: "sku" });
    }

    return NextResponse.json({ success: true, product: insertedProduct });
  } catch (err: any) {
    console.error("[API Products POST] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, slug, updates } = await req.json();
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, localOnly: true });
    }

    const client = getServiceSupabase();
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.base_price !== undefined) dbUpdates.base_price = Number(updates.base_price);
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.features !== undefined) dbUpdates.features = updates.features;
    if (updates.specs !== undefined) dbUpdates.specs = updates.specs;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    if (updates.best_seller !== undefined) dbUpdates.best_seller = updates.best_seller;
    if (updates.new_arrival !== undefined) dbUpdates.new_arrival = updates.new_arrival;
    if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id;
    if (updates.brand_id !== undefined) dbUpdates.brand_id = updates.brand_id;

    // Match by slug first, then fallback to id
    const matchQuery = slug ? client.from("products").update(dbUpdates).eq("slug", slug) : client.from("products").update(dbUpdates).eq("id", id);
    const { data, error } = await matchQuery.select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (err: any) {
    console.error("[API Products PUT] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, localOnly: true });
    }

    const client = getServiceSupabase();
    const query = slug ? client.from("products").delete().eq("slug", slug) : client.from("products").delete().eq("id", id);
    const { error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
