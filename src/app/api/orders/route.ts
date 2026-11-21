import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer,
      fulfillment_type = "delivery",
      payment_method = "paystack_momo",
      subtotal = 0,
      delivery_fee = 0,
      discount_amount = 0,
      total_amount = 0,
      items = [],
      origin = "",
    } = body;

    if (!customer?.full_name || !customer?.phone) {
      return NextResponse.json(
        { error: "Customer name and phone number are required." },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AKI-${currentYear}-${randomCode}`;
    const cleanOrderNumber = orderNumber.replace(/[^A-Za-z0-9]/g, "");
    const paystackRef = `ref_aki_${cleanOrderNumber}_${Date.now()}`;

    const isPaystackPayment =
      payment_method === "paystack_momo" || payment_method === "paystack_card";

    let insertedOrder: any = {
      order_number: orderNumber,
      customer_name: customer.full_name,
      customer_phone: customer.phone,
      customer_email: customer.email || null,
      fulfillment_type,
      delivery_address: customer.delivery_address || null,
      delivery_city: customer.city || "Ghana",
      delivery_notes: customer.delivery_notes || null,
      subtotal: Number(subtotal) || 0,
      delivery_fee: Number(delivery_fee) || 0,
      discount_amount: Number(discount_amount) || 0,
      total_amount: Number(total_amount) || 0,
      payment_method,
      payment_status: isPaystackPayment ? "unpaid" : "pending",
      paystack_reference: isPaystackPayment ? paystackRef : null,
      order_status: isPaystackPayment ? "pending_payment" : "processing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Insert into Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const client = getServiceSupabase();
        const { data: dbOrder, error: orderErr } = await client
          .from("orders")
          .insert(insertedOrder)
          .select()
          .single();

        if (orderErr) {
          console.error("[Orders API] Supabase order insert error:", orderErr);
        } else if (dbOrder) {
          insertedOrder = dbOrder;

          // Insert line items
          if (Array.isArray(items) && items.length > 0) {
            const lineItems = items.map((i: any) => ({
              order_id: dbOrder.id,
              product_id: i.product_id || null,
              variant_id: i.variant_id || null,
              product_title: i.product_title || "Product",
              variant_sku: i.variant_sku || null,
              unit_price: Number(i.unit_price) || 0,
              quantity: Number(i.quantity) || 1,
              total_price: Number(i.total_price || i.unit_price * i.quantity) || 0,
            }));

            const { error: itemsErr } = await client
              .from("order_items")
              .insert(lineItems);
            if (itemsErr) {
              console.error("[Orders API] Order items insert error:", itemsErr);
            }
          }
        }
      } catch (dbEx) {
        console.error("[Orders API] Supabase exception:", dbEx);
      }
    }

    // 2. Initialize Paystack Transaction if payment method is MoMo or Card
    let paystackData: any = null;

    if (isPaystackPayment) {
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      const callbackBase = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const callbackUrl = `${callbackBase}/checkout/verify?reference=${paystackRef}&order=${orderNumber}`;

      // Clean customer email for Paystack (Paystack strictly requires an email)
      const sanitizedEmail =
        customer.email && customer.email.includes("@")
          ? customer.email.trim()
          : `customer.${customer.phone.replace(/[^0-9]/g, "")}@akienterprise.com`;

      const amountInPesewas = Math.round(Number(total_amount) * 100);

      if (paystackSecret && !paystackSecret.includes("placeholder")) {
        try {
          const channels =
            payment_method === "paystack_momo"
              ? ["mobile_money"]
              : ["card"];

          const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${paystackSecret}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: sanitizedEmail,
              amount: amountInPesewas,
              currency: "GHS",
              reference: paystackRef,
              callback_url: callbackUrl,
              channels,
              metadata: {
                order_number: orderNumber,
                customer_name: customer.full_name,
                customer_phone: customer.phone,
                fulfillment_type,
                delivery_city: customer.city,
                items_summary: items.map((i: any) => `${i.quantity}x ${i.product_title}`).join(", "),
              },
            }),
          });

          const paystackJson = await paystackRes.json();

          if (paystackJson.status && paystackJson.data) {
            paystackData = {
              authorization_url: paystackJson.data.authorization_url,
              access_code: paystackJson.data.access_code,
              reference: paystackRef,
              is_simulation: false,
            };
          } else {
            console.warn("[Orders API] Paystack init response notice:", paystackJson.message);
            // Fallback simulation link if Paystack rejects test parameter
            paystackData = {
              authorization_url: `${callbackBase}/checkout/verify?reference=${paystackRef}&order=${orderNumber}&simulated=true`,
              reference: paystackRef,
              is_simulation: true,
              message: paystackJson.message,
            };
          }
        } catch (paystackErr: any) {
          console.error("[Orders API] Paystack call error:", paystackErr.message);
          paystackData = {
            authorization_url: `${callbackBase}/checkout/verify?reference=${paystackRef}&order=${orderNumber}&simulated=true`,
            reference: paystackRef,
            is_simulation: true,
          };
        }
      } else {
        // Fallback simulation when no key configured
        paystackData = {
          authorization_url: `${callbackBase}/checkout/verify?reference=${paystackRef}&order=${orderNumber}&simulated=true`,
          reference: paystackRef,
          is_simulation: true,
        };
      }
    }

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      order: {
        ...insertedOrder,
        items,
      },
      paystack: paystackData,
    });
  } catch (error: any) {
    console.error("[Orders API] Create error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const client = getServiceSupabase();
    const { data: orders, error: ordersErr } = await client
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `)
      .order("created_at", { ascending: false });

    if (ordersErr) {
      console.error("[Orders API] GET error:", ordersErr);
      return NextResponse.json({ success: false, error: ordersErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    console.error("[Orders API] GET exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
