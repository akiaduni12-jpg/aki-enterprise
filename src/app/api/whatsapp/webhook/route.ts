import { NextRequest, NextResponse } from "next/server";
import { addWhatsAppMessage } from "@/lib/whatsapp-store";

// Verify Tokens accepted from Meta Developer Dashboard
const VALID_VERIFY_TOKENS = [
  process.env.WHATSAPP_VERIFY_TOKEN,
  "aki_aduni_whatsapp_token_2026",
  "aki_enterprise_whatsapp_token_2026",
].filter(Boolean) as string[];

/**
 * 1. GET /api/whatsapp/webhook
 * Meta sends a GET request to verify the webhook when you click "Verify and save" in the Meta dashboard.
 * Query params:
 *   - hub.mode: 'subscribe'
 *   - hub.verify_token: token string configured in Meta dashboard
 *   - hub.challenge: random integer/string sent by Meta that must be returned in the response
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token && VALID_VERIFY_TOKENS.includes(token)) {
      console.log("[WhatsApp Webhook] Verification successful");
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.warn("[WhatsApp Webhook] Verification failed. Token mismatch or invalid mode.");
    return new NextResponse("Forbidden: Verification token mismatch", { status: 403 });
  } catch (err: any) {
    console.error("[WhatsApp Webhook] GET Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * 2. POST /api/whatsapp/webhook
 * Meta sends notifications whenever an incoming message arrives, or when message status changes (sent, delivered, read).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Handle Incoming Messages from Customers
      if (value?.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const from = message.from; // Customer's phone number with country code (e.g., 233551243372)
        const text = message.text?.body;
        const messageType = message.type;

        console.log(`[WhatsApp Webhook] Incoming message from ${from} (${messageType}): ${text || "[non-text]"}`);

        // Persist message to persistent store for real-time mobile sync
        await addWhatsAppMessage({
          id: message.id,
          from,
          to: value.metadata?.display_phone_number || "233541855969",
          direction: "incoming",
          type: messageType,
          text: text || "",
          timestamp: message.timestamp ? Number(message.timestamp) * 1000 : Date.now(),
        });
      }

      // Handle Message Delivery Status Updates (sent, delivered, read, failed)
      if (value?.statuses && value.statuses.length > 0) {
        const statusObj = value.statuses[0];
        console.log(`[WhatsApp Webhook] Status update for message ${statusObj.id}: ${statusObj.status}`);
      }

      return NextResponse.json({ status: "success" }, { status: 200 });
    }

    return NextResponse.json({ status: "ignored" }, { status: 404 });
  } catch (err: any) {
    console.error("[WhatsApp Webhook] POST Error:", err);
    // Meta requires a 200 OK or 400 even on error so it doesn't repeatedly retry failing webhooks
    return NextResponse.json({ status: "error", message: err.message }, { status: 200 });
  }
}
