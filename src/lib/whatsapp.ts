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
  buttons?: Array<{ id: string; title: string }>;
  headerText?: string;
  footerText?: string;
}

export async function sendWhatsAppMessage({
  to,
  text,
  templateName,
  templateLanguage = "en_US",
  templateComponents = [],
  buttons = [],
  headerText,
  footerText,
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
  } else if (buttons && buttons.length > 0 && text) {
    // Meta WhatsApp Cloud API Interactive Reply Buttons (up to 3 buttons)
    payload.type = "interactive";
    payload.interactive = {
      type: "button",
      body: { text },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: {
            id: b.id.slice(0, 256),
            title: b.title.slice(0, 20),
          },
        })),
      },
    };
    if (headerText) {
      payload.interactive.header = { type: "text", text: headerText.slice(0, 60) };
    }
    if (footerText) {
      payload.interactive.footer = { text: footerText.slice(0, 60) };
    }
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
      // Fallback: If interactive buttons failed, retry with plain text
      if (payload.type === "interactive" && text) {
        console.log("[WhatsApp API] Falling back from interactive to plain text...");
        const fallbackButtonsText = buttons.map((b) => `• ${b.title}`).join("\n");
        const fallbackText = `${text}\n\n${fallbackButtonsText}`;
        return sendWhatsAppMessage({
          to: cleanTo,
          text: fallbackText,
        });
      }
      return { success: false, error: data.error?.message || "WhatsApp send failed" };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[WhatsApp API Exception]", err);
    return { success: false, error: err.message };
  }
}
