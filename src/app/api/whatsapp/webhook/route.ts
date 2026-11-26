import { NextRequest, NextResponse } from "next/server";
import { addWhatsAppMessage } from "@/lib/whatsapp-store";
import { processAiMerchantReply } from "@/lib/ai-merchant";

// Verify Tokens accepted from Meta Developer Dashboard
const VALID_VERIFY_TOKENS = [
  process.env.WHATSAPP_VERIFY_TOKEN,
  "aki_aduni_whatsapp_token_2026",
  "aki_enterprise_whatsapp_token_2026",
  "rabuni_whatsapp_webhook_token_2026",
].filter(Boolean) as string[];

interface ExtractedMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  type: string;
  timestamp: number;
}

/**
 * Universal Multi-Format Message Extractor (inspired by VoteCastHub)
 * Supports Meta WhatsApp Cloud API, interactive button clicks, list choices, and direct webhooks.
 */
function extractMessagesFromPayload(body: any): ExtractedMessage[] {
  if (!body || typeof body !== "object") return [];

  const results: ExtractedMessage[] = [];

  // 1. Meta WhatsApp Cloud API format: entry -> changes -> value -> messages
  if (Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          const value = change.value;
          if (Array.isArray(value?.messages)) {
            const displayPhone = value.metadata?.display_phone_number || "233541855969";

            for (const msg of value.messages) {
              const rawFrom = String(msg.from || "");
              let text = "";

              if (msg.type === "text" && msg.text) {
                text = String(msg.text.body || "").trim();
              } else if (msg.type === "interactive" && msg.interactive) {
                if (msg.interactive.button_reply) {
                  text = String(msg.interactive.button_reply.title || msg.interactive.button_reply.id || "").trim();
                } else if (msg.interactive.list_reply) {
                  text = String(msg.interactive.list_reply.title || msg.interactive.list_reply.id || "").trim();
                }
              } else if (msg.type === "image" && msg.image) {
                text = msg.image.caption || "[Image]";
              } else if (msg.type === "document" && msg.document) {
                text = msg.document.filename || "[Document]";
              } else if (msg.type === "audio" || msg.type === "voice") {
                text = "[Voice Note]";
              } else if (typeof msg.body === "string") {
                text = msg.body.trim();
              }

              if (rawFrom) {
                results.push({
                  id: msg.id || `wa-${Date.now()}-${Math.random()}`,
                  from: rawFrom,
                  to: displayPhone,
                  text: text || "[WhatsApp Message]",
                  type: msg.type || "text",
                  timestamp: msg.timestamp ? Number(msg.timestamp) * 1000 : Date.now(),
                });
              }
            }
          }
        }
      }
    }
  }

  // 2. Direct / Forwarder format: payload.message or payload.text
  if (results.length === 0 && (body.message || body.text || body.body)) {
    const rawFrom = String(body.from || body.phone || body.sender || "");
    const text = String(body.message || body.text || body.body || "").trim();
    if (rawFrom) {
      results.push({
        id: body.id || `direct-${Date.now()}`,
        from: rawFrom,
        to: body.to || "233541855969",
        text: text || "[Message]",
        type: "text",
        timestamp: body.timestamp ? Number(body.timestamp) : Date.now(),
      });
    }
  }

  return results;
}

/**
 * 1. GET /api/whatsapp/webhook
 * Meta Developer Dashboard verification handshake
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token && VALID_VERIFY_TOKENS.includes(token)) {
      console.log("[WhatsApp Webhook] Verification successful!");
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.warn("[WhatsApp Webhook] Verification failed. Mode or token mismatch.", { mode, token });
    return new NextResponse("Forbidden: Verification token mismatch", { status: 403 });
  } catch (err: any) {
    console.error("[WhatsApp Webhook] GET Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * 2. POST /api/whatsapp/webhook
 * Handles incoming WhatsApp customer inquiries & Meta status callbacks
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ status: "invalid_body" }, { status: 400 });
    }

    const messages = extractMessagesFromPayload(rawBody);

    if (messages.length > 0) {
      for (const msg of messages) {
        console.log(`[WhatsApp Webhook] Received message from ${msg.from}: ${msg.text}`);

        // 1. Persist to shared Supabase Storage for Companion Mobile App real-time sync
        await addWhatsAppMessage({
          id: msg.id,
          from: msg.from,
          to: msg.to,
          direction: "incoming",
          type: msg.type,
          text: msg.text,
          timestamp: msg.timestamp,
        });

        // 2. Trigger AI Merchant Auto-Responder (must await in serverless so Vercel does not terminate execution early)
        try {
          await processAiMerchantReply({
            id: msg.id,
            phone: msg.from,
            text: msg.text,
            type: msg.type,
            timestamp: msg.timestamp,
          });
        } catch (err) {
          console.warn("[WhatsApp Webhook] AI Merchant auto-reply error:", err);
        }
      }

      return NextResponse.json({ status: "success", count: messages.length }, { status: 200 });
    }

    // Acknowledge delivery receipts & status updates (sent, delivered, read)
    return NextResponse.json({ status: "received", type: "event_acknowledged" }, { status: 200 });
  } catch (err: any) {
    console.error("[WhatsApp Webhook] POST Exception:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 200 });
  }
}
