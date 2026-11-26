import { NextRequest, NextResponse } from "next/server";
import { addWhatsAppMessage } from "@/lib/whatsapp-store";

interface SendMessageRequest {
  to: string;
  text?: string;
  type?: "text" | "image" | "document" | "template" | "product_card" | "momo_request" | "dispatch_waybill";
  imageUrl?: string;
  documentUrl?: string;
  documentFilename?: string;
  templateName?: string;
  phoneNumberId?: string;
  metadata?: any;
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
    const { to, text, type = "text", imageUrl, documentUrl, documentFilename, templateName, metadata } = body;

    if (!to) {
      return NextResponse.json({ error: "Missing recipient 'to' phone number" }, { status: 400 });
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = body.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "1449155268281310";
    const recipientPhone = normalizePhoneNumber(to);

    // Format rich text bodies if specialized commerce cards are passed
    let formattedText = text || "";
    if (type === "product_card" && metadata?.productCard) {
      const p = metadata.productCard;
      formattedText = `📱 *AKI ADUNI VENTURES - Product Recommendation*\n\n*${p.title}*\n💰 Price: GH₵ ${Number(p.price || 0).toLocaleString()}\n✨ Condition: ${p.condition || "Brand New"}\n🛡️ Warranty: ${p.warranty || "6 Months Warranty"}\n${p.batteryHealth ? `🔋 Battery Health: ${p.batteryHealth}\n` : ""}🔗 View & Order: https://www.akiaduniventures.com/product/${p.slug || ""}`;
    } else if (type === "momo_request" && metadata?.momoRequest) {
      const m = metadata.momoRequest;
      formattedText = `💳 *AKI ADUNI VENTURES - Mobile Money Request*\n\nAmount: *GH₵ ${Number(m.amount || 0).toLocaleString()}*\nNetwork: *${m.network || "MTN MoMo"}*\nRef: *${m.reference || "AKI-PAY"}*\nItem: ${m.itemTitle || "Order Payment"}\n\n📲 Please authorize the prompt or send to:\n*055 124 3372* (Aki Aduni Ventures)`;
    } else if (type === "dispatch_waybill" && metadata?.dispatchWaybill) {
      const w = metadata.dispatchWaybill;
      formattedText = `🚚 *AKI ADUNI VENTURES - Order Dispatched & Waybill*\n\nOrder Ref: *${w.orderId}*\nBus Station: *${w.busStation || "VIP Jeoun Station, Circle"}*\nDestination: *${w.destination || "Customer Location"}*\nDriver Phone: *${w.driverPhone}*\nVehicle Plate: *${w.carRegistration}*\nETA: *${w.estimatedArrival || "Today"}*\n\nPlease inspect your package upon collection. For support call 055 124 3372.`;
    }

    let payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
    };

    if (type === "image" && imageUrl) {
      payload.type = "image";
      payload.image = { link: imageUrl, caption: formattedText || undefined };
    } else if (type === "document" && documentUrl) {
      payload.type = "document";
      payload.document = {
        link: documentUrl,
        filename: documentFilename || "document.pdf",
        caption: formattedText || undefined,
      };
    } else if (type === "template" && templateName) {
      payload.type = "template";
      payload.template = {
        name: templateName,
        language: { code: "en_US" },
      };
    } else {
      payload.type = "text";
      payload.text = { body: formattedText || "Hello from AKI ADUNI VENTURES" };
    }

    let messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let deliveredToMeta = false;
    let metaWarning: string | undefined = undefined;

    // Send via Meta WhatsApp Cloud API if token configured
    if (token) {
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const metaData = await metaRes.json();
        if (metaRes.ok && metaData.messages?.[0]?.id) {
          messageId = metaData.messages[0].id;
          deliveredToMeta = true;
        } else {
          console.warn("[WhatsApp Send] Meta API Warning:", metaData);
          metaWarning = metaData.error?.message || "Meta API accepted via local queue";
        }
      } catch (err: any) {
        console.warn("[WhatsApp Send] Meta API Fetch Exception:", err.message);
        metaWarning = err.message;
      }
    } else {
      metaWarning = "Server running in offline/local sync mode (no WHATSAPP_ACCESS_TOKEN)";
    }

    // Always record outbound message in store for sync
    const savedMsg = await addWhatsAppMessage({
      id: messageId,
      from: phoneNumberId,
      to: recipientPhone,
      direction: "outgoing",
      type,
      text: formattedText,
      metadata,
      status: deliveredToMeta ? "delivered" : "sent",
    });

    return NextResponse.json(
      {
        success: true,
        messageId,
        recipient: recipientPhone,
        deliveredToMeta,
        warning: metaWarning,
        message: savedMsg,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[WhatsApp Send] Server Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
