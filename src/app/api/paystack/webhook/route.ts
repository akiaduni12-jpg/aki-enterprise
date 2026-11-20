import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder_key";
    const signature = request.headers.get("x-paystack-signature");

    const rawBody = await request.text();

    // Verify HMAC SHA512 signature from Paystack
    const hash = crypto
      .createHmac("sha512", paystackSecret)
      .update(rawBody)
      .digest("hex");

    // In production with real keys, reject invalid signatures:
    if (process.env.NODE_ENV === "production" && signature !== hash) {
      return NextResponse.json(
        { error: "Invalid Paystack signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);

    // Handle payment events
    switch (event.event) {
      case "charge.success": {
        const data = event.data;
        const reference = data.reference;
        const amountGhs = data.amount / 100; // Paystack sends amounts in pesewas / minor units
        const channel = data.channel; // 'mobile_money' or 'card'

        console.log(`[Paystack Webhook] Verified payment for ref ${reference}: GH₵ ${amountGhs} via ${channel}`);
        if (isSupabaseConfigured) {
          try {
            const client = getServiceSupabase();
            await client
              .from("orders")
              .update({
                payment_status: "paid",
                order_status: "paid",
                updated_at: new Date().toISOString(),
              })
              .eq("paystack_reference", reference);
          } catch (dbErr) {
            console.error("[Paystack Webhook] DB update error:", dbErr);
          }
        }
        break;
      }

      default:
        console.log(`[Paystack Webhook] Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Paystack Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
