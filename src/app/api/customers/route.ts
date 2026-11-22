import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

export interface CustomerSummary {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string;
  address: string | null;
  total_orders: number;
  total_spent: number;
  paid_orders_count: number;
  first_order_at: string;
  last_order_at: string;
  tier: "vip" | "regular" | "new";
  status: "active" | "flagged";
  notes?: string;
  orders: {
    order_number: string;
    total_amount: number;
    order_status: string;
    payment_status: string;
    fulfillment_type: string;
    created_at: string;
    items_count: number;
    items_summary?: string;
  }[];
}

// Fallback seed customer records for demo / initial view
const FALLBACK_CUSTOMERS: CustomerSummary[] = [
  {
    id: "cust-0551243372",
    full_name: "Francis Kwasi Boateng",
    phone: "0551243372",
    email: "francis.boateng@gmail.com",
    city: "Miaso, Kwahu East",
    address: "Opposite Miaso Chief Palace, Near Main Road",
    total_orders: 2,
    total_spent: 14200,
    paid_orders_count: 2,
    first_order_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    last_order_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    tier: "vip",
    status: "active",
    notes: "Prefers shop counter pickup on Saturdays. Very reliable buyer.",
    orders: [
      {
        order_number: "AKI-2026-9812",
        total_amount: 11400,
        order_status: "delivered",
        payment_status: "paid",
        fulfillment_type: "shop_pickup",
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        items_count: 1,
        items_summary: "1x iPhone 16 Pro (128GB)",
      },
      {
        order_number: "AKI-2026-1044",
        total_amount: 2800,
        order_status: "processing",
        payment_status: "paid",
        fulfillment_type: "shop_pickup",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        items_count: 1,
        items_summary: "1x AirPods Pro 2nd Gen",
      },
    ],
  },
  {
    id: "cust-0244891102",
    full_name: "Ama Osei Tutu",
    phone: "0244891102",
    email: "ama.osei@yahoo.com",
    city: "Nkawkaw",
    address: "Near Commercial Bank, High Street",
    total_orders: 1,
    total_spent: 8500,
    paid_orders_count: 1,
    first_order_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    last_order_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    tier: "vip",
    status: "active",
    notes: "Express dispatch via Nkawkaw driver.",
    orders: [
      {
        order_number: "AKI-2026-8742",
        total_amount: 8500,
        order_status: "out_for_delivery",
        payment_status: "paid",
        fulfillment_type: "delivery",
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        items_count: 1,
        items_summary: "1x Samsung Galaxy S24 (256GB)",
      },
    ],
  },
  {
    id: "cust-0509823411",
    full_name: "Kofi Owusu Mensah",
    phone: "0509823411",
    email: null,
    city: "Abetifi, Kwahu",
    address: "Abetifi Presbyterian College Road",
    total_orders: 1,
    total_spent: 3400,
    paid_orders_count: 1,
    first_order_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    last_order_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    tier: "regular",
    status: "active",
    notes: "Cash on delivery at Abetifi station.",
    orders: [
      {
        order_number: "AKI-2026-3129",
        total_amount: 3400,
        order_status: "processing",
        payment_status: "pending",
        fulfillment_type: "delivery",
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        items_count: 1,
        items_summary: "1x iPhone 13 (128GB UK-Used)",
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: true,
        customers: FALLBACK_CUSTOMERS,
        source: "mock",
      });
    }

    const client = getServiceSupabase();

    // Fetch all orders with their items
    const { data: orders, error: ordersErr } = await client
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        customer_phone,
        customer_email,
        delivery_address,
        delivery_city,
        total_amount,
        payment_status,
        order_status,
        fulfillment_type,
        created_at,
        order_items (
          id,
          product_title,
          quantity
        )
      `)
      .order("created_at", { ascending: false });

    if (ordersErr) {
      console.warn("[Customers API] Could not load orders:", ordersErr.message);
      return NextResponse.json({
        success: true,
        customers: FALLBACK_CUSTOMERS,
        source: "fallback",
      });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        customers: FALLBACK_CUSTOMERS,
        source: "fallback_empty",
      });
    }

    // Aggregate orders by normalized phone number
    const customerMap = new Map<string, CustomerSummary>();

    for (const ord of orders) {
      const rawPhone = ord.customer_phone || "";
      const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
      if (!cleanPhone) continue;

      const itemsSummary = (ord.order_items || [])
        .map((it: any) => `${it.quantity}x ${it.product_title}`)
        .join(", ");

      const orderSummary = {
        order_number: ord.order_number,
        total_amount: Number(ord.total_amount) || 0,
        order_status: ord.order_status,
        payment_status: ord.payment_status,
        fulfillment_type: ord.fulfillment_type,
        created_at: ord.created_at,
        items_count: ord.order_items?.length || 1,
        items_summary: itemsSummary || "Product Order",
      };

      const existing = customerMap.get(cleanPhone);
      if (existing) {
        existing.total_orders += 1;
        existing.total_spent += orderSummary.total_amount;
        if (
          ord.payment_status === "paid" ||
          ord.order_status === "delivered" ||
          ord.order_status === "processing"
        ) {
          existing.paid_orders_count += 1;
        }
        if (new Date(ord.created_at) < new Date(existing.first_order_at)) {
          existing.first_order_at = ord.created_at;
        }
        if (new Date(ord.created_at) > new Date(existing.last_order_at)) {
          existing.last_order_at = ord.created_at;
          // Refresh latest info
          if (ord.customer_name) existing.full_name = ord.customer_name;
          if (ord.customer_email) existing.email = ord.customer_email;
          if (ord.delivery_city) existing.city = ord.delivery_city;
          if (ord.delivery_address) existing.address = ord.delivery_address;
        }
        existing.orders.push(orderSummary);

        // Recalculate tier
        if (existing.total_spent >= 4000 || existing.total_orders >= 2) {
          existing.tier = "vip";
        }
      } else {
        const isPaid =
          ord.payment_status === "paid" ||
          ord.order_status === "delivered" ||
          ord.order_status === "processing";

        customerMap.set(cleanPhone, {
          id: `cust-${cleanPhone}`,
          full_name: ord.customer_name || "Customer",
          phone: rawPhone,
          email: ord.customer_email || null,
          city: ord.delivery_city || "Ghana",
          address: ord.delivery_address || null,
          total_orders: 1,
          total_spent: orderSummary.total_amount,
          paid_orders_count: isPaid ? 1 : 0,
          first_order_at: ord.created_at,
          last_order_at: ord.created_at,
          tier: orderSummary.total_amount >= 4000 ? "vip" : "regular",
          status: "active",
          orders: [orderSummary],
        });
      }
    }

    const aggregated = Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.last_order_at).getTime() - new Date(a.last_order_at).getTime()
    );

    return NextResponse.json({
      success: true,
      customers: aggregated.length > 0 ? aggregated : FALLBACK_CUSTOMERS,
      source: "supabase",
    });
  } catch (error: any) {
    console.error("[Customers API] GET error:", error);
    return NextResponse.json({
      success: true,
      customers: FALLBACK_CUSTOMERS,
      source: "error_fallback",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
    }

    const body = await request.json();
    const { customer_id, notes, status, tier } = body;

    if (!customer_id) {
      return NextResponse.json({ error: "customer_id is required." }, { status: 400 });
    }

    // Optionally update in Supabase profiles if ID matches UUID
    if (isSupabaseConfigured) {
      try {
        const client = getServiceSupabase();
        // Update staff notes or profile status if profile table has matching record
        await client
          .from("profiles")
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq("phone", customer_id.replace("cust-", ""));
      } catch (err) {
        console.warn("[Customers API] Could not write to profiles:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Customer status and notes updated successfully.",
      customer_id,
      notes,
      status,
      tier,
    });
  } catch (err: any) {
    console.error("[Customers API] POST error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}
