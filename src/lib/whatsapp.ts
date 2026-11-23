/**
 * WhatsApp Cloud API Client for Aki Enterprise
 * Sends order confirmations, shipping updates, and notifications.
 */

interface SendWhatsAppMessageParams {
  to: string; // Recipient phone number in international format without '+' (e.g., "233551243372")
  text?: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
}

export async function sendWhatsAppMessage({
  to,
  text,
  templateName,
  templateLanguage = "en_US",
  templateComponents = [],
}: SendWhatsAppMessageParams) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("[WhatsApp API] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return { success: false, error: "WhatsApp credentials not configured" };
  }

  // Sanitize phone number (strip '+', spaces, dashes; replace leading '0' with '233' if Ghana)
  let cleanTo = to.replace(/[\s\-\+\(\)]/g, "");
  if (cleanTo.startsWith("0") && cleanTo.length === 10) {
    cleanTo = "233" + cleanTo.slice(1);
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  let payload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanTo,
  };

  if (templateName) {
    payload.type = "template";
    payload.template = {
      name: templateName,
      language: { code: templateLanguage },
      components: templateComponents,
    };
  } else if (text) {
    payload.type = "text";
    payload.text = { preview_url: false, body: text };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[WhatsApp API Error]", data);
      return { success: false, error: data.error?.message || "WhatsApp send failed" };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[WhatsApp API Exception]", err);
    return { success: false, error: err.message };
  }
}
