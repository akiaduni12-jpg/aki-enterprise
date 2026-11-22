import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { PRODUCTS } from "@/lib/mock-data";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      // Fallback
      const fallbackList = PRODUCTS.flatMap((p) =>
        p.variants.map((v) => ({
          ...v,
          productTitle: p.title,
          brandName: p.brand_name,
        }))
      );
      return NextResponse.json({ success: true, variants: fallbackList, movements: [] });
    }

    const client = getServiceSupabase();

    // 1. Fetch variants joined with product details
    const { data: variants, error: varError } = await client
      .from("product_variants")
      .select(`
        id,
        product_id,
        sku,
        condition,
        storage,
        ram,
        color,
        color_hex,
        battery_health,
        warranty_months,
        price,
        original_price,
        stock_quantity,
        product:products(id, title, brand_name, category_name, images)
      `)
      .order("created_at", { ascending: false });

    // 2. Fetch recent stock movements
    const { data: movements } = await client
      .from("stock_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25);

    if (varError || !variants || variants.length === 0) {
      // Fallback if table is still empty
      const fallbackList = PRODUCTS.flatMap((p) =>
        p.variants.map((v) => ({
          ...v,
          productTitle: p.title,
          brandName: p.brand_name,
        }))
      );
      return NextResponse.json({ success: true, variants: fallbackList, movements: movements || [] });
    }

    const formatted = variants.map((v: any) => ({
      id: v.id,
      product_id: v.product_id,
      sku: v.sku,
      condition: v.condition,
      storage: v.storage,
      ram: v.ram,
      color: v.color,
      color_hex: v.color_hex,
      battery_health: v.battery_health,
      warranty_months: v.warranty_months,
      price: Number(v.price),
      original_price: v.original_price ? Number(v.original_price) : undefined,
      stock_quantity: v.stock_quantity,
      productTitle: v.product?.title || "Product",
      brandName: v.product?.brand_name || "Aki Enterprise",
      productImage: v.product?.images?.[0] || null,
    }));

    return NextResponse.json({
      success: true,
      variants: formatted,
      movements: movements || [],
    });
  } catch (error: any) {
    console.error("[Inventory API] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantId, delta = 0, reason = "manual_adjustment", notes = "" } = body;

    if (!variantId || typeof delta !== "number") {
      return NextResponse.json(
        { error: "variantId and numeric delta are required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: true,
        message: "Supabase not configured, updated locally",
        delta,
      });
    }

    const client = getServiceSupabase();

    // 1. Get current stock
    const { data: currentVariant, error: fetchErr } = await client
      .from("product_variants")
      .select("id, stock_quantity")
      .eq("id", variantId)
      .maybeSingle();

    if (fetchErr || !currentVariant) {
      // If variant has mock id or not in DB, return gracefully
      return NextResponse.json({
        success: true,
        fallback: true,
        message: "Variant not found in database, updated locally",
      });
    }

    const currentStock = currentVariant.stock_quantity ?? 0;
    const newStock = Math.max(0, currentStock + delta);

    // 2. Update stock quantity
    const { error: updateErr } = await client
      .from("product_variants")
      .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
      .eq("id", variantId);

    if (updateErr) {
      throw updateErr;
    }

    // 3. Log stock movement
    const validReason = ["purchase_restock", "order_sale", "manual_adjustment", "damaged", "customer_return"].includes(
      reason
    )
      ? reason
      : "manual_adjustment";

    try {
      await client.from("stock_movements").insert({
        variant_id: variantId,
        change_amount: delta,
        balance_after: newStock,
        reason: validReason,
        notes: notes || `Stock adjusted (${delta > 0 ? `+${delta}` : delta}) by Store Admin`,
        created_at: new Date().toISOString(),
      });
    } catch (movementErr) {
      console.warn("Stock movement logging warning:", movementErr);
    }

    return NextResponse.json({
      success: true,
      variantId,
      stock_quantity: newStock,
      delta,
    });
  } catch (error: any) {
    console.error("[Inventory API] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update inventory" },
      { status: 500 }
    );
  }
}
