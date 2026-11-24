import fs from "fs";
import path from "path";

export interface StoredWhatsAppMessage {
  id: string;
  from: string; // Phone number e.g. "233551243372"
  to: string;   // Phone number e.g. "233541855969"
  direction: "incoming" | "outgoing";
  type: string;
  text?: string;
  timestamp: number; // Unix timestamp ms
  status?: string;
}

const STORE_PATH = path.join(process.cwd(), ".whatsapp-messages.json");

// In-memory cache
let messagesCache: StoredWhatsAppMessage[] = [];

// Initialize cache from disk if available
try {
  if (fs.existsSync(STORE_PATH)) {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    messagesCache = JSON.parse(raw);
  }
} catch (e) {
  messagesCache = [];
}

function persist() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(messagesCache.slice(-200), null, 2), "utf-8");
  } catch (e) {
    console.error("[WhatsApp Store] Failed to persist messages:", e);
  }
}

export function addWhatsAppMessage(msg: Omit<StoredWhatsAppMessage, "id" | "timestamp"> & { id?: string; timestamp?: number }) {
  const newMsg: StoredWhatsAppMessage = {
    id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    from: msg.from,
    to: msg.to,
    direction: msg.direction,
    type: msg.type || "text",
    text: msg.text,
    timestamp: msg.timestamp || Date.now(),
    status: msg.status || "delivered",
  };

  messagesCache.push(newMsg);
  persist();
  return newMsg;
}

export function getWhatsAppMessages(sinceTimestamp?: number): StoredWhatsAppMessage[] {
  if (!sinceTimestamp) {
    return messagesCache.slice(-50);
  }
  return messagesCache.filter((m) => m.timestamp > sinceTimestamp);
}
