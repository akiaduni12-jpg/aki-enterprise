import os from "os";
import path from "path";
import fs from "fs";
import { getServiceSupabase, isSupabaseConfigured } from "./supabase";

export interface StoredWhatsAppMessage {
  id: string;
  from: string; // Phone number e.g. "233551243372"
  to: string;   // Phone number e.g. "233541855969"
  direction: "incoming" | "outgoing";
  type: string;
  text?: string;
  timestamp: number; // Unix timestamp ms
  status?: string;
  metadata?: any;
}

const BUCKET_NAME = "whatsapp-store";
const FILE_KEY = "messages.json";
const TMP_PATH = path.join(os.tmpdir(), "whatsapp-messages.json");

// In-memory cache
let messagesCache: StoredWhatsAppMessage[] = [];
let lastFetchedFromRemote = 0;

/**
 * Load messages from Supabase Storage or /tmp
 */
export async function loadWhatsAppMessages(): Promise<StoredWhatsAppMessage[]> {
  const now = Date.now();
  // Return cached if fetched less than 2 seconds ago
  if (messagesCache.length > 0 && now - lastFetchedFromRemote < 2000) {
    return messagesCache;
  }

  if (isSupabaseConfigured) {
    try {
      const client = getServiceSupabase();
      const { data, error } = await client.storage.from(BUCKET_NAME).download(FILE_KEY);
      if (data && !error) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          messagesCache = parsed;
          lastFetchedFromRemote = now;
          return messagesCache;
        }
      }
    } catch (e) {
      // quiet fallback
    }
  }

  // Fallback to /tmp on Lambda if Supabase is offline
  try {
    if (fs.existsSync(TMP_PATH)) {
      const raw = fs.readFileSync(TMP_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        messagesCache = parsed;
      }
    }
  } catch (e) {
    // quiet
  }

  if (messagesCache.length === 0) {
    messagesCache = [...SEED_MESSAGES];
  }

  return messagesCache;
}

/**
 * Persist messages to Supabase Storage and /tmp
 */
async function persistMessages(messages: StoredWhatsAppMessage[]) {
  const payload = JSON.stringify(messages.slice(-300), null, 2);

  // 1. Supabase Storage Persistence (shared across all Vercel lambdas)
  if (isSupabaseConfigured) {
    try {
      const client = getServiceSupabase();
      await client.storage.from(BUCKET_NAME).upload(FILE_KEY, payload, {
        upsert: true,
        contentType: "application/json",
      });
    } catch (err: any) {
      console.warn("[WhatsApp Store] Supabase sync warning:", err?.message);
    }
  }

  // 2. Safe /tmp fallback (never writes to /var/task to prevent EROFS)
  try {
    fs.writeFileSync(TMP_PATH, payload, "utf-8");
  } catch (e) {
    // quiet fallback
  }
}

/**
 * Add message to persistent store
 */
export async function addWhatsAppMessage(
  msg: Omit<StoredWhatsAppMessage, "id" | "timestamp"> & { id?: string; timestamp?: number }
): Promise<StoredWhatsAppMessage> {
  await loadWhatsAppMessages();

  const newMsg: StoredWhatsAppMessage = {
    id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    from: msg.from,
    to: msg.to,
    direction: msg.direction,
    type: msg.type || "text",
    text: msg.text,
    timestamp: msg.timestamp || Date.now(),
    status: msg.status || "delivered",
    metadata: msg.metadata || undefined,
  };

  // Prevent duplicate message IDs
  if (!messagesCache.some((m) => m.id === newMsg.id)) {
    messagesCache.push(newMsg);
  }

  await persistMessages(messagesCache);
  return newMsg;
}

const SEED_MESSAGES: StoredWhatsAppMessage[] = [
  {
    id: "seed-1",
    from: "233541855969",
    to: "233551243372",
    direction: "incoming",
    type: "text",
    text: "Hello Aki Aduni Ventures! Please do you have the iPhone 13 128GB Midnight in stock? What is the battery health?",
    timestamp: Date.now() - 1000 * 60 * 35,
    status: "read",
  },
  {
    id: "seed-2",
    from: "233551243372",
    to: "233541855969",
    direction: "outgoing",
    type: "product_card",
    text: "Yes! We have Apple iPhone 13 (UK Used Grade A) 128GB Midnight in stock for GH₵ 5,200. Battery health is 88%, factory unlocked with 6 months warranty.",
    timestamp: Date.now() - 1000 * 60 * 30,
    status: "read",
    metadata: {
      productCard: {
        title: "Apple iPhone 13 (UK Used Grade A)",
        price: 5200,
        condition: "UK Used Grade A",
        specs: "128GB / 4GB RAM / Midnight",
        warranty: "6 Months Warranty",
        batteryHealth: "88%",
        imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60",
        slug: "iphone-13-128gb-midnight",
      },
    },
  },
  {
    id: "seed-3",
    from: "233541855969",
    to: "233551243372",
    direction: "incoming",
    type: "text",
    text: "Nice! Can you send via VIP bus to Kumasi Asafo? Please send your MoMo payment details so I can pay now.",
    timestamp: Date.now() - 1000 * 60 * 20,
    status: "read",
  },
  {
    id: "seed-4",
    from: "233551243372",
    to: "233541855969",
    direction: "outgoing",
    type: "momo_request",
    text: "Here is your MTN MoMo payment request for GH₵ 5,200 (Ref: AKI-ORD-9281).",
    timestamp: Date.now() - 1000 * 60 * 15,
    status: "read",
    metadata: {
      momoRequest: {
        amount: 5200,
        network: "MTN",
        reference: "AKI-ORD-9281",
        status: "paid",
        itemTitle: "Apple iPhone 13 128GB Midnight",
      },
    },
  },
  {
    id: "seed-5",
    from: "233551243372",
    to: "233541855969",
    direction: "outgoing",
    type: "dispatch_waybill",
    text: "Your phone has been dispatched to VIP Jeoun Station, Kumasi! Driver contact: 024 412 8890 (Car: AS-4182-24).",
    timestamp: Date.now() - 1000 * 60 * 5,
    status: "delivered",
    metadata: {
      dispatchWaybill: {
        orderId: "AKI-ORD-9281",
        driverPhone: "024 412 8890",
        carRegistration: "AS-4182-24",
        busStation: "VIP Jeoun Station, Circle",
        destination: "Kumasi Asafo Market",
        estimatedArrival: "Today 4:30 PM",
      },
    },
  },
  {
    id: "seed-6",
    from: "233244192834",
    to: "233551243372",
    direction: "incoming",
    type: "text",
    text: "Hello! I saw your new stock of Itel IT5606 keypad phones. How much for 2 pieces? Can I pick up at your shop?",
    timestamp: Date.now() - 1000 * 60 * 12,
    status: "read",
  },
  {
    id: "seed-7",
    from: "233201889922",
    to: "233551243372",
    direction: "incoming",
    type: "text",
    text: "Good afternoon, please do you have original Oraimo FreePods 4 in stock? What is the best price?",
    timestamp: Date.now() - 1000 * 60 * 2,
    status: "delivered",
  },
];

/**
 * Get messages since timestamp
 */
export async function getWhatsAppMessages(sinceTimestamp?: number): Promise<StoredWhatsAppMessage[]> {
  const all = await loadWhatsAppMessages();
  if (!sinceTimestamp) {
    return all.slice(-50);
  }
  return all.filter((m) => m.timestamp > sinceTimestamp);
}
