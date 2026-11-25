import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { addWhatsAppMessage } from "@/lib/whatsapp-store";

export interface InboundWhatsAppMessage {
  id?: string;
  phone: string;
  text: string;
  type?: string;
  timestamp?: number;
}

/**
 * Intelligent AI Merchant Auto-Reply Engine for AKI ADUNI VENTURES
 * Automatically responds to customer inquiries on WhatsApp 24/7
 */
export async function processAiMerchantReply(inbound: InboundWhatsAppMessage) {
  const { phone, text } = inbound;
  if (!phone || !text) return;

  const clean = text.trim();
  const lower = clean.toLowerCase();

  let replyText = "";

  // 1. Greetings
  if (/^(hi|hello|hey|yo|good\s+(morning|afternoon|evening)|howdy|greetings|start|menu)\b/i.test(lower)) {
    replyText =
      "Hello! Welcome to *AKI ADUNI VENTURES* 🇬🇭\n\n" +
      "We provide premium UK-Used & Brand-New iPhones, Samsung Galaxy devices, and consumer electronics with *6 Months Shop Warranty*.\n\n" +
      "How can we help you today?\n" +
      "• Reply *PHONES* to view device prices\n" +
      "• Reply *LOCATION* for our Miaso shop address\n" +
      "• Reply *ORDER* to track your package\n\n" +
      "🌐 Visit our live catalog: https://www.akiaduniventures.com";
  }
  // 2. Pricing & Product Inquiry
  else if (/\b(price|prices|pricelist|cost|how\s+much|phone|phones|iphone|samsung|galaxy|laptop|airpods|headphone|buy|purchase|stock|catalog|shop)\b/i.test(lower)) {
    replyText =
      "📱 *Featured Device Deals at AKI ADUNI VENTURES*:\n\n" +
      "• *Apple iPhone 14 Pro* (UK Used Grade A, 128GB) — GH₵ 7,800\n" +
      "• *Apple iPhone 13* (UK Used Grade A, 128GB) — GH₵ 5,400\n" +
      "• *Samsung Galaxy S23* (UK Used, 128GB) — GH₵ 5,900\n" +
      "• *Wireless Headphone* — GH₵ 140\n\n" +
      "✅ Free screen protector & 6 months store warranty included.\n\n" +
      "👉 View all available devices: https://www.akiaduniventures.com/catalog\n" +
      "To purchase or place an order, reply with the device model or call/MoMo *055 124 3372*.";
  }
  // 3. Location & Directions
  else if (/\b(location|where|address|shop|store|office|miaso|kwahu|directions|visit)\b/i.test(lower)) {
    replyText =
      "📍 *AKI ADUNI VENTURES Physical Store*:\n" +
      "Main Commercial Street, Miaso, Kwahu East, Eastern Region, Ghana.\n\n" +
      "🕒 *Hours*: Monday - Saturday: 8:00 AM - 7:00 PM\n" +
      "🚚 *Express Delivery*: VIP Bus Terminal waybill dispatch available to Accra, Kumasi, Takoradi, and all regions nationwide.\n\n" +
      "📞 Shop Manager: 055 124 3372";
  }
  // 4. Order tracking & Delivery
  else if (/\b(order|track|tracking|status|waybill|delivery|dispatch|shipping|courier)\b/i.test(lower)) {
    replyText =
      "📦 *Order Status & Waybill Dispatch*:\n\n" +
      "To check your delivery, please reply with your *Order Number* (e.g. ORD-3372) or the phone number used during checkout.\n\n" +
      "You can also track your orders live on our website:\n" +
      "👉 https://www.akiaduniventures.com/orders\n\n" +
      "Our dispatch officer will verify your waybill right away.";
  }
  // 5. General fallback
  else {
    replyText =
      "Thank you for contacting *AKI ADUNI VENTURES*!\n\n" +
      `We received your message: "${clean}"\n\n` +
      "Our shop manager in Miaso has been notified and will reply shortly. You can also explore our full online inventory at https://www.akiaduniventures.com or call *055 124 3372* for immediate assistance.";
  }

  // 1. Send automatic response via Meta WhatsApp Cloud API
  try {
    const sendRes = await sendWhatsAppMessage({
      to: phone,
      text: replyText,
    });

    // 2. Record the AI outgoing response in store so the companion mobile app sees it
    await addWhatsAppMessage({
      id: `ai-reply-${Date.now()}`,
      from: process.env.WHATSAPP_PHONE_NUMBER_ID || "1449155268281310",
      to: phone,
      direction: "outgoing",
      type: "text",
      text: replyText,
      timestamp: Date.now(),
      status: sendRes.success ? "delivered" : "failed",
    });
  } catch (err) {
    console.warn("[AI Merchant] Failed to send automated reply:", err);
  }
}
