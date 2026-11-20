import { supabase, isSupabaseConfigured, getServiceSupabase } from "./supabase";
import { PRODUCTS, CATEGORIES, BRANDS, INITIAL_QR_CAMPAIGNS } from "./mock-data";
import { Product, Category, Brand, Order, QRCampaign } from "@/types/ecommerce";

/**
 * Fetch all active products (hybrid: Supabase first with mock fallback)
 */
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    return PRODUCTS;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return PRODUCTS;
    }

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      brand_id: item.brand_id,
      brand_name: item.brand_name || "Aki Enterprise",
      category_id: item.category_id,
      category_slug: item.category_slug || "smartphones",
      category_name: item.category_name || "Smartphones",
      description: item.description,
      features: item.features || [],
      specs: item.specs || {},
      images: item.images || [],
      base_price: Number(item.base_price),
      featured: item.featured,
      best_seller: item.best_seller,
      new_arrival: item.new_arrival,
      variants: (item.product_variants || []).map((v: any) => ({
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
      })),
      created_at: item.created_at,
    }));
  } catch (err) {
    console.warn("Using fallback mock products:", err);
    return PRODUCTS;
  }
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) || null;
}

/**
 * Fetch all active categories
 */
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured || !supabase) {
    return CATEGORIES;
  }

  try {
    const { data, error } = await supabase.from("categories").select("*");
    if (error || !data || data.length === 0) return CATEGORIES;
    return data;
  } catch {
    return CATEGORIES;
  }
}

/**
 * Record a new order in Supabase
 */
export async function saveOrder(orderData: Partial<Order>): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      const { data, error } = await client
        .from("orders")
        .insert({
          order_number: orderData.order_number,
          customer_name: orderData.customer?.full_name,
          customer_phone: orderData.customer?.phone,
          customer_email: orderData.customer?.email,
          fulfillment_type: orderData.fulfillment_type,
          delivery_address: orderData.customer?.delivery_address,
          delivery_city: orderData.customer?.city,
          delivery_notes: orderData.customer?.delivery_notes,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.delivery_fee,
          discount_amount: orderData.discount_amount || 0,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status || "unpaid",
          paystack_reference: orderData.paystack_reference,
          order_status: orderData.order_status || "pending_payment",
          qr_campaign_id: orderData.qr_campaign_id,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase order insert error:", error);
      } else if (data && orderData.items && orderData.items.length > 0) {
        // Insert order line items
        await client.from("order_items").insert(
          orderData.items.map((item) => ({
            order_id: data.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_title: item.product_title,
            variant_sku: item.variant_sku,
            condition: item.condition,
            storage: item.storage,
            ram: item.ram,
            color: item.color,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total_price: item.total_price,
            image_url: item.image_url,
          }))
        );
        return { success: true, orderId: data.id };
      }
    }
    return { success: true, orderId: `local-${Date.now()}` };
  } catch (err: any) {
    console.error("Order save failure:", err);
    return { success: false, error: err.message };
  }
}
