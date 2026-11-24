import { NextRequest, NextResponse } from "next/server";
import { addWhatsAppMessage } from "@/lib/whatsapp-store";

interface SendMessageRequest {
  to: string;
  text?: string;
  type?: "text" | "image" | "document" | "template";
  imageUrl?: string;
  documentUrl?: string;
  documentFilename?: string;
  templateName?: string;
  phoneNumberId?: string;
}

/**
 * Format phone number for Meta WhatsApp Cloud API.
 * E.g., '0541855969' -> '233541855969'
 * '+233 54 185 5969' -> '233541855969'
 */
function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "233" + cleaned.slice(1);
  }
  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendMessageRequest = await req.json();
    const { to, text, type = "text", imageUrl, documentUrl, documentFilename, templateName } = body;

    if (!to) {
      return NextResponse.json({ error: "Missing recipient 'to' phone number" }, { status: 400 });
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = body.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) {
      return NextResponse.json(
        { error: "Server missing WHATSAPP_ACCESS_TOKEN in environment configuration" },
        { status: 500 }
      );
    }

    if (!phoneNumberId) {
      return NextResponse.json(
        {
          error: "Missing WHATSAPP_PHONE_NUMBER_ID. Please provide phoneNumberId or set it in .env.local",
        },
        { status: 400 }
      );
    }

    const recipientPhone = normalizePhoneNumber(to);
    let payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
    };

    if (type === "text") {
      if (!text) {
        return NextResponse.json({ error: "Missing message 'text' body" }, { status: 400 });
      }
      payload.type = "text";
      payload.text = { body: text };
    } else if (type === "image" && imageUrl) {
      payload.type = "image";
      payload.image = { link: imageUrl, caption: text || undefined };
    } else if (type === "document" && documentUrl) {
      payload.type = "document";
      payload.document = {
        link: documentUrl,
        filename: documentFilename || "document.pdf",
        caption: text || undefined,
      };
    } else if (type === "template" && templateName) {
      payload.type = "template";
      payload.template = {
        name: templateName,
        language: { code: "en_US" },
      };
    } else {
      payload.type = "text";
      payload.text = { body: text || "Hello from AKI ADUNI VENTURES" };
    }

    const metaRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      console.error("[WhatsApp Send] Meta API Error:", metaData);
      return NextResponse.json(
        {
          success: false,
          error: metaData.error?.message || "Failed to send message via Meta WhatsApp API",
          details: metaData.error,
        },
        { status: metaRes.status }
      );
    }

    const messageId = metaData.messages?.[0]?.id;

    // Record outbound message in store for sync
    await addWhatsAppMessage({
      id: messageId,
      from: phoneNumberId,
      to: recipientPhone,
      direction: "outgoing",
      type,
      text: text || "",
    });

    return NextResponse.json(
      {
        success: true,
        messageId,
        recipient: recipientPhone,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[WhatsApp Send] Server Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
