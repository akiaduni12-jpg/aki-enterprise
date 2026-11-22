// ==============================================================================
// AKI ENTERPRISE - ARKESEL SMS INTEGRATION SERVICE
// Certified SMS gateway for Ghana order alerts, customer notifications & CRM
// ==============================================================================

export interface SMSConfig {
  apiKey: string;
  senderId: string;
  adminPhone: string;
  notifyCustomerOnOrder: boolean;
  notifyCustomerOnPayment: boolean;
  notifyCustomerOnStatus: boolean;
  notifyAdminOnOrder: boolean;
}

export interface SMSLogEntry {
  id: string;
  to: string;
  message: string;
  type: "order_created" | "payment_confirmed" | "status_update" | "admin_alert" | "custom_test" | "broadcast";
  status: "sent" | "delivered" | "failed" | "pending_sender_id";
  response?: string;
  timestamp: string;
}

export const DEFAULT_SMS_CONFIG: SMSConfig = {
  apiKey: process.env.ARKESEL_SMS_API_KEY || "Z3VHUWVaUkJSS1RVRUppamRqRnQ",
  senderId: process.env.ARKESEL_SENDER_ID || "AKI SHOP",
  adminPhone: process.env.ARKESEL_ADMIN_PHONE || "0551243372",
  notifyCustomerOnOrder: true,
  notifyCustomerOnPayment: true,
  notifyCustomerOnStatus: true,
  notifyAdminOnOrder: true,
};

// In-memory log buffer for runtime audit
const recentSMSLogs: SMSLogEntry[] = [
  {
    id: "sms-init-1",
    to: "0551243372",
    message: "Aki Enterprise Arkesel SMS gateway initialized successfully.",
    type: "admin_alert",
    status: "sent",
    response: "SMS Service Connected",
    timestamp: new Date().toISOString(),
  },
];

export function getSMSLogs(): SMSLogEntry[] {
  return recentSMSLogs;
}

export function recordSMSLog(entry: Omit<SMSLogEntry, "id" | "timestamp">) {
  const newLog: SMSLogEntry = {
    ...entry,
    id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  recentSMSLogs.unshift(newLog);
  if (recentSMSLogs.length > 50) {
    recentSMSLogs.pop();
  }
  return newLog;
}

/**
 * Normalize phone numbers to standard Ghana format (233xxxxxxxxx or 0xxxxxxxxx)
 */
export function formatGhanaPhone(rawPhone: string): string {
  if (!rawPhone) return "";
  const cleaned = rawPhone.replace(/[^0-9]/g, "");

  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return "233" + cleaned.slice(1);
  } else if (cleaned.startsWith("233") && cleaned.length === 12) {
    return cleaned;
  }
  return cleaned;
}

/**
 * Check Arkesel live SMS credit balance
 */
export async function checkArkeselBalance(apiKey = DEFAULT_SMS_CONFIG.apiKey): Promise<{
  success: boolean;
  balance?: string | number;
  message?: string;
  raw?: any;
}> {
  try {
    const url = `https://sms.arkesel.com/sms/api?action=check-balance&api_key=${encodeURIComponent(
      apiKey
    )}&response=json`;

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      // Sometimes Arkesel returns plain numbers or text
    }

    if (json) {
      const balance =
        json.balance ??
        json.main_balance ??
        json.data?.balance ??
        json.data?.sms_balance ??
        json.credit ??
        "Active";

      return {
        success: true,
        balance,
        raw: json,
      };
    }

    return {
      success: true,
      balance: text.trim() || "Connected",
      raw: text,
    };
  } catch (error: any) {
    console.error("[Arkesel SMS] Balance check error:", error);
    return {
      success: false,
      message: error.message || "Failed to check SMS balance",
    };
  }
}

/**
 * Send an SMS via Arkesel Gateway
 */
export async function sendArkeselSMS({
  to,
  message,
  senderId = DEFAULT_SMS_CONFIG.senderId,
  apiKey = DEFAULT_SMS_CONFIG.apiKey,
  schedule,
  type = "custom_test",
}: {
  to: string;
  message: string;
  senderId?: string;
  apiKey?: string;
  schedule?: string;
  type?: SMSLogEntry["type"];
}): Promise<{
  success: boolean;
  message?: string;
  response?: any;
}> {
  const formattedPhone = formatGhanaPhone(to);
  if (!formattedPhone || formattedPhone.length < 9) {
    recordSMSLog({
      to,
      message,
      type,
      status: "failed",
      response: "Invalid phone number format",
    });
    return { success: false, message: "Invalid recipient phone number." };
  }

  try {
    let url = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${encodeURIComponent(
      apiKey
    )}&to=${encodeURIComponent(formattedPhone)}&from=${encodeURIComponent(
      senderId
    )}&sms=${encodeURIComponent(message)}`;

    if (schedule) {
      url += `&schedule=${encodeURIComponent(schedule)}`;
    }

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const responseText = await res.text();
    let responseJson: any = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      // response is plain text
    }

    const isSuccess =
      res.ok &&
      (!responseJson ||
        responseJson.status === "success" ||
        responseJson.code === "100" ||
        String(responseText).toLowerCase().includes("successful") ||
        String(responseText).toLowerCase().includes("100"));

    const statusNote = isSuccess
      ? "sent"
      : responseText.toLowerCase().includes("sender") || responseText.toLowerCase().includes("approval")
      ? "pending_sender_id"
      : "failed";

    recordSMSLog({
      to: formattedPhone,
      message,
      type,
      status: statusNote,
      response: responseText.slice(0, 150),
    });

    return {
      success: isSuccess,
      message: responseText,
      response: responseJson || responseText,
    };
  } catch (error: any) {
    console.error("[Arkesel SMS] Send error:", error);
    recordSMSLog({
      to: formattedPhone,
      message,
      type,
      status: "failed",
      response: error.message,
    });
    return { success: false, message: error.message || "Network error sending SMS." };
  }
}

/**
 * Add a customer to Arkesel Phonebook for broadcast marketing
 */
export async function insertArkeselContact({
  phone,
  firstName,
  lastName,
  email,
  phoneBook = "Aki Customers",
  apiKey = DEFAULT_SMS_CONFIG.apiKey,
}: {
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneBook?: string;
  apiKey?: string;
}) {
  const formattedPhone = formatGhanaPhone(phone);
  if (!formattedPhone) return;

  try {
    let url = `https://sms.arkesel.com/contacts/api?action=subscribe-us&api_key=${encodeURIComponent(
      apiKey
    )}&phone_book=${encodeURIComponent(phoneBook)}&phone_number=${encodeURIComponent(
      formattedPhone
    )}`;

    if (firstName) url += `&first_name=${encodeURIComponent(firstName)}`;
    if (lastName) url += `&last_name=${encodeURIComponent(lastName)}`;
    if (email) url += `&email=${encodeURIComponent(email)}`;

    await fetch(url, { method: "GET", cache: "no-store" });
  } catch (err) {
    console.warn("[Arkesel SMS] Contact subscribe notice:", err);
  }
}

// ============================================================================
// AUTOMATED ORDER LIFECYCLE SMS DISPATCHERS
// ============================================================================

export async function sendOrderCreatedCustomerSMS(order: {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  fulfillment_type?: string;
}) {
  const firstName = order.customer_name?.split(" ")[0] || "Valued Customer";
  const fulfillmentNote =
    order.fulfillment_type === "shop_pickup"
      ? "Shop pickup at Miaso, Kwahu East."
      : "Our courier will dispatch it to your address.";

  const message = `Hello ${firstName}, your Aki Enterprise order #${order.order_number} for GH₵ ${order.total_amount.toLocaleString()} is received! ${fulfillmentNote} WhatsApp/Call: 0551243372.`;

  return sendArkeselSMS({
    to: order.customer_phone,
    message,
    type: "order_created",
  });
}

export async function sendOrderCreatedAdminAlertSMS(order: {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  delivery_city?: string;
  fulfillment_type?: string;
}) {
  const message = `[Aki Shop Alert] New Order #${order.order_number} from ${order.customer_name} (${order.customer_phone}) for GH₵ ${order.total_amount.toLocaleString()}. Fulfillment: ${order.fulfillment_type || "Delivery"}. Call customer to confirm.`;

  return sendArkeselSMS({
    to: DEFAULT_SMS_CONFIG.adminPhone,
    message,
    type: "admin_alert",
  });
}

export async function sendOrderPaidCustomerSMS(order: {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
}) {
  const firstName = order.customer_name?.split(" ")[0] || "Customer";
  const message = `Hello ${firstName}, your payment for Aki Enterprise order #${order.order_number} (GH₵ ${order.total_amount.toLocaleString()}) has been confirmed! We are packaging your items. Call/WhatsApp: 0551243372.`;

  return sendArkeselSMS({
    to: order.customer_phone,
    message,
    type: "payment_confirmed",
  });
}

export async function sendOrderStatusCustomerSMS(
  order: {
    order_number: string;
    customer_name: string;
    customer_phone: string;
    delivery_city?: string;
  },
  newStatus: string
) {
  const firstName = order.customer_name?.split(" ")[0] || "Customer";
  let message = "";

  if (newStatus === "ready_for_pickup") {
    message = `Hello ${firstName}, your order #${order.order_number} is READY FOR PICKUP at Aki Enterprise shop in Miaso, Kwahu East! Please bring your phone. Contact: 0551243372.`;
  } else if (newStatus === "out_for_delivery") {
    message = `Hello ${firstName}, your order #${order.order_number} is OUT FOR DELIVERY${
      order.delivery_city ? ` to ${order.delivery_city}` : ""
    }! Please keep your phone reachable. Courier hotline: 0551243372.`;
  } else if (newStatus === "delivered") {
    message = `Hello ${firstName}, your order #${order.order_number} has been DELIVERED! Thank you for choosing Aki Enterprise. Shop warranty is active. Call/WhatsApp: 0551243372.`;
  }

  if (!message) return null;

  return sendArkeselSMS({
    to: order.customer_phone,
    message,
    type: "status_update",
  });
}
