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
        if (Array.isArray(parsed)) {
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
      messagesCache = JSON.parse(raw);
    }
  } catch (e) {
    // quiet
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
  };

  // Prevent duplicate message IDs
  if (!messagesCache.some((m) => m.id === newMsg.id)) {
    messagesCache.push(newMsg);
  }

  await persistMessages(messagesCache);
  return newMsg;
}

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
