import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { addWhatsAppMessage, isAgentSessionActive, setAgentSession } from "@/lib/whatsapp-store";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export interface InboundWhatsAppMessage {
  id?: string;
  phone: string;
  text: string;
  type?: string;
  timestamp?: number;
}

/**
 * Format phone number for clean human-readable WhatsApp display
 * e.g., "233245259221" -> "+233 24 525 9221"
 */
function formatPhonePretty(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length === 12) {
    return `+233 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `0${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return digits ? `+${digits}` : "Unknown";
}

/**
 * Helper to search customer orders in Supabase DB by phone or order number
 */
async function lookupCustomerOrder(phone: string, text: string) {
  if (!isSupabaseConfigured) return null;
  try {
    const client = getServiceSupabase();

    // 1. Check if user sent an explicit order reference (e.g. ORD-1042 or AKI-2026-4182 or 4+ digits)
    const orderMatch = text.match(/\b(AKI[-\w]+|ORD[-\w]+|\d{4,6})\b/i);
    if (orderMatch) {
      const candidate = orderMatch[1];
      const { data: byNum, error: numErr } = await client
        .from("orders")
        .select("*")
        .ilike("order_number", `%${candidate}%`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!numErr && byNum && byNum.length > 0) return byNum[0];
    }

    // 2. Query by customer phone number variations
    const cleanDigits = phone.replace(/\D/g, "");
    if (!cleanDigits) return null;

    const localFormat = cleanDigits.startsWith("233") ? "0" + cleanDigits.slice(3) : cleanDigits;
    const intlFormat = cleanDigits.startsWith("0") ? "233" + cleanDigits.slice(1) : cleanDigits;

    const { data: byPhone, error: phoneErr } = await client
      .from("orders")
      .select("*")
      .or(`customer_phone.ilike.%${localFormat}%,customer_phone.ilike.%${intlFormat}%`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!phoneErr && byPhone && byPhone.length > 0) return byPhone[0];
  } catch (err) {
    console.warn("[AI Merchant] Order lookup error:", err);
  }
  return null;
}

/**
 * Intelligent AI Merchant Auto-Reply Engine with WhatsApp Interactive Buttons
 * Automatically responds to customer inquiries and provides live Order Tracking.
 */
export async function processAiMerchantReply(inbound: InboundWhatsAppMessage) {
  const { phone, text } = inbound;
  if (!phone || !text) return;

  const clean = text.trim();
  const lower = clean.toLowerCase();
  const formattedUserPhone = formatPhonePretty(phone);

  // Check if customer explicitly wants to resume the bot
  const isResetCommand = lower === "btn_menu" || /^(menu|start|bot|restart|options)\b/i.test(lower);
  if (isResetCommand) {
    try {
      await setAgentSession(phone, false);
    } catch {}
  } else {
    // If a human agent session is active (e.g. customer asked for agent or admin manually replied), suppress AI bot!
    try {
      const sessionActive = await isAgentSessionActive(phone);
      if (sessionActive) {
        console.log(`[AI Merchant] Human agent session active for ${phone}. Bot auto-reply suppressed.`);
        return;
      }
    } catch (e) {
      console.warn("[AI Merchant] Error checking agent session:", e);
    }
  }

  let replyText = "";
  let buttons: Array<{ id: string; title: string }> = [];
  let headerText = "AKI ADUNI VENTURES 🇬🇭";
  let footerText = "Miaso, Kwahu • Fast Express Waybill";

  // Check if customer explicitly clicked track button or inquired about order
  const isOrderQuery =
    lower === "btn_track" ||
    /\b(order|track|tracking|status|waybill|delivery|dispatch|shipping|courier|where\s+is\s+my)\b/i.test(lower) ||
    /\b(aki-\d+|ord-\d+)\b/i.test(lower);

  // 1. Order Tracking Inquiry
  if (isOrderQuery) {
    let order: any = null;
    try {
      order = await lookupCustomerOrder(phone, clean);
    } catch (e) {
      console.warn("[AI Merchant] Error in lookupCustomerOrder:", e);
    }

    if (order) {
      const totalFormatted = Number(order.total_amount || 0).toLocaleString();
      const statusUpper = String(order.order_status || "Processing").toUpperCase();
      const paymentUpper = String(order.payment_status || "Pending").toUpperCase();
      const destination = order.delivery_city || order.delivery_address || "Customer Location";
      const itemList = Array.isArray(order.items) && order.items.length > 0
        ? order.items.map((i: any) => i.title || i.product_title || "Item").join(", ")
        : "TechHub Product";

      replyText =
        `📦 *ORDER TRACKING FOUND*\n` +
        `📱 *Your Number*: ${formattedUserPhone}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `• *Order Ref*: #${order.order_number}\n` +
        `• *Customer*: ${order.customer_name}\n` +
        `• *Total*: GH₵ ${totalFormatted} (${paymentUpper})\n` +
        `• *Status*: 🚚 *${statusUpper}*\n` +
        `• *Destination*: ${destination}\n` +
        `• *Items*: ${itemList}\n\n` +
        `🔗 *Live Web Tracking*:\nhttps://www.akiaduniventures.com/track?order=${order.order_number}\n\n` +
        `Need driver contact or change of drop-off? Tap an option below:`;

      buttons = [
        { id: "btn_agent", title: "💬 Talk to Agent" },
        { id: "btn_phones", title: "📱 View Phones" },
        { id: "btn_location", title: "📍 Store Location" },
      ];
    } else {
      replyText =
        `📦 *LIVE ORDER TRACKING*\n` +
        `📱 *Your Number Checked*: ${formattedUserPhone}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `We could not find an active dispatch package linked to *${formattedUserPhone}*.\n\n` +
        `👉 If you placed your order with another phone number or have your store receipt, please reply with your *Order Number* (e.g. *ORD-1042* or *AKI-2026-XXXX*).\n\n` +
        `You can also track anytime on our live site:\n` +
        `👉 https://www.akiaduniventures.com/track`;

      buttons = [
        { id: "btn_phones", title: "📱 View Phones" },
        { id: "btn_agent", title: "💬 Talk to Agent" },
        { id: "btn_location", title: "📍 Store Location" },
      ];
    }
  }
  // 2. Greetings / Menu
  else if (
    lower === "btn_menu" ||
    /^(hi|hello|hey|yo|good\s+(morning|afternoon|evening)|howdy|greetings|start|menu|ok\s*see|ok)\b/i.test(lower)
  ) {
    replyText =
      "Hello! Welcome to *AKI ADUNI VENTURES* 🇬🇭\n\n" +
      "We provide premium UK-Used & Brand-New iPhones, Samsung Galaxy devices, and consumer electronics with *6 Months Shop Warranty*.\n\n" +
      "How can we help you today? Tap an option below to get started:";

    buttons = [
      { id: "btn_phones", title: "📱 View Phones" },
      { id: "btn_track", title: "📦 Track Order" },
      { id: "btn_location", title: "📍 Store Location" },
    ];
  }
  // 3. Pricing & Product Inquiry
  else if (
    lower === "btn_phones" ||
    /\b(price|prices|pricelist|cost|how\s+much|phone|phones|iphone|samsung|galaxy|laptop|airpods|headphone|buy|purchase|stock|catalog|shop)\b/i.test(lower)
  ) {
    replyText =
      "📱 *Featured Device Deals at AKI ADUNI VENTURES*:\n\n" +
      "• *Apple iPhone 14 Pro* (UK Used Grade A, 128GB) — GH₵ 7,800\n" +
      "• *Apple iPhone 13* (UK Used Grade A, 128GB) — GH₵ 5,400\n" +
      "• *Samsung Galaxy S23* (UK Used, 128GB) — GH₵ 5,900\n" +
      "• *Wireless Headphone* — GH₵ 140\n\n" +
      "✅ Free screen protector & 6 months store warranty included.\n\n" +
      "👉 View all available devices: https://www.akiaduniventures.com/catalog\n" +
      "To purchase or place an order, tap below or call/MoMo *055 124 3372*.";

    buttons = [
      { id: "btn_track", title: "📦 Track Order" },
      { id: "btn_location", title: "📍 Store Location" },
      { id: "btn_agent", title: "💬 Talk to Agent" },
    ];
  }
  // 4. Location & Directions
  else if (
    lower === "btn_location" ||
    /\b(location|where|address|shop|store|office|miaso|kwahu|directions|visit|hour|hours)\b/i.test(lower)
  ) {
    replyText =
      "📍 *AKI ADUNI VENTURES Physical Store*:\n" +
      "Main Commercial Street, Miaso, Kwahu East, Eastern Region, Ghana.\n\n" +
      "🕒 *Store Hours*:\n" +
      "• Sunday - Friday: 7:30 AM - 10:30 PM\n" +
      "• Saturday: Closed\n\n" +
      "🚚 *Express Delivery*: VIP Bus Terminal waybill dispatch available to Accra, Kumasi, Takoradi, and all regions nationwide.\n\n" +
      "📞 Shop Manager: 055 124 3372";

    buttons = [
      { id: "btn_phones", title: "📱 View Phones" },
      { id: "btn_track", title: "📦 Track Order" },
      { id: "btn_agent", title: "💬 Talk to Agent" },
    ];
  }
  // 5. Speak with Agent / Manager
  else if (
    lower === "btn_agent" ||
    /\b(agent|human|manager|boss|owner|speak|call|person|support|help)\b/i.test(lower)
  ) {
    replyText =
      "👤 *Shop Manager Connected*\n\n" +
      "Our shop manager in Miaso has taken over this chat. The automated bot is now paused so you can speak directly with our team!\n\n" +
      "📞 Direct Line: *055 124 3372*\n" +
      "🌐 Live Website: https://www.akiaduniventures.com\n\n" +
      "Type any question and our team will answer you directly right here.";

    buttons = [
      { id: "btn_menu", title: "🤖 Re-open Bot Menu" },
      { id: "btn_phones", title: "📱 View Phones" },
    ];

    // Activate 2-hour human takeover session (AI auto-responder paused)
    try {
      await setAgentSession(phone, true, 2, "Customer requested agent");
    } catch (e) {
      console.warn("[AI Merchant] Error activating agent session:", e);
    }
  }
  // 6. General fallback with interactive navigation buttons
  else {
    replyText =
      "Thank you for contacting *AKI ADUNI VENTURES*!\n\n" +
      `We received your message: "${clean}"\n\n` +
      "Our shop manager in Miaso has been notified and will reply shortly. Tap an option below to explore our devices or track an order:";

    buttons = [
      { id: "btn_phones", title: "📱 View Phones" },
      { id: "btn_track", title: "📦 Track Order" },
      { id: "btn_location", title: "📍 Store Location" },
    ];
  }

  // Send automatic response via Meta WhatsApp Cloud API (with Interactive Buttons)
  try {
    const sendRes = await sendWhatsAppMessage({
      to: phone,
      text: replyText,
      buttons,
      headerText,
      footerText,
    });

    // Record the AI outgoing response in store so the companion mobile app and admin see it
    await addWhatsAppMessage({
      id: `ai-reply-${Date.now()}`,
      from: process.env.WHATSAPP_PHONE_NUMBER_ID || "1449155268281310",
      to: phone,
      direction: "outgoing",
      type: buttons.length > 0 ? "interactive" : "text",
      text: replyText,
      timestamp: Date.now(),
      status: sendRes.success ? "delivered" : "failed",
    });
  } catch (err) {
    console.warn("[AI Merchant] Failed to send automated reply:", err);
  }
}
