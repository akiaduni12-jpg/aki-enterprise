"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Send,
  Phone,
  MessageSquare,
  Check,
  CheckCheck,
  ShoppingBag,
  CreditCard,
  Truck,
  ShieldCheck,
  Tag,
  X,
  ChevronRight,
  User,
  Filter,
  RefreshCw,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  MapPin,
  Clock,
  AlertCircle,
  Megaphone,
  CheckCircle2,
  Package,
  FileText,
  ArrowLeft,
  Pin,
  PinOff,
  Zap,
  Paperclip,
  Copy,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

interface StoredMessage {
  id: string;
  from: string;
  to: string;
  direction: "incoming" | "outgoing";
  type: string;
  text?: string;
  timestamp: number;
  status?: string;
  metadata?: any;
}

interface Conversation {
  phone: string;
  name: string;
  city?: string;
  tags: string[];
  lastMessage: string;
  lastMessageTime: number;
  lastDirection: "incoming" | "outgoing";
  unreadCount: number;
  messages: StoredMessage[];
}

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  regular_price?: number;
  image_url?: string;
  condition?: string;
  brand?: { name: string };
  category?: { name: string };
}

interface CustomerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  delivery_city?: string;
  delivery_address?: string;
  items?: any[];
}

const QUICK_SAVED_REPLIES = [
  {
    id: "locations",
    title: "📍 Circle & Miaso Shop Locations",
    category: "Locations",
    badge: "Directions",
    text: `📍 *AKI ADUNI VENTURES - Store Locations & Hours*\n\n1. *Accra Central Shop:* Opposite VIP Jeoun Bus Terminal, Circle, Accra.\n2. *Eastern Region Shop:* Miaso Market Junction, Kwahu East.\n\n⏰ Opening Hours:\nMonday - Saturday: 7:30 AM - 7:00 PM\nSunday: 1:00 PM - 6:00 PM\n📞 Direct Hotline: 055 124 3372`,
  },
  {
    id: "momo",
    title: "💳 Official MoMo Accounts & Payment Verification",
    category: "Payments",
    badge: "Finance",
    text: `💳 *Official Payment Accounts - AKI ADUNI VENTURES*\n\n• *MTN Mobile Money:*\nNumber: *055 124 3372*\nMerchant Name: *Aki Aduni Ventures*\n\n• *Telecel Cash:*\nNumber: *055 124 3372*\nName: *Aki Aduni Ventures*\n\n⚠️ Always confirm the merchant name *Aki Aduni Ventures* before entering your PIN!`,
  },
  {
    id: "delivery",
    title: "🚚 Nationwide VIP Bus Waybill & Delivery",
    category: "Delivery",
    badge: "Logistics",
    text: `🚚 *Nationwide VIP Bus Delivery Notice*\n\nWe dispatch daily to all major bus terminals in Ghana:\n• Accra ➔ Kumasi (Asafo / VIP): 4-5 hours\n• Accra ➔ Sunyani / Takoradi / Cape Coast: Same day\n• Accra ➔ Tamale / Bolga: Next day early morning\n\nPackages are safely sealed, insured, and accompanied by the driver's phone number and bus registration number.`,
  },
  {
    id: "warranty",
    title: "🛡️ 6-Month Shop Warranty & Battery Guarantee",
    category: "Warranty",
    badge: "Security",
    text: `🛡️ *Warranty & Quality Guarantee*\n\nEvery device purchased from AKI ADUNI VENTURES includes:\n✅ Full 6-Month Hardware Warranty\n✅ 100% Genuine, Grade A Tested\n✅ Battery Health 85% to 100% Guaranteed\n✅ 7-Day Hassle-Free Swap for any technical fault`,
  },
  {
    id: "keypad",
    title: "🔋 Keypad Phone Fresh Stock & Prices",
    category: "Products",
    badge: "Devices",
    text: `🔋 *Brand-New Keypad Phones in Stock*\n\n• Itel 5620 / 5606 (Super Torch, 2500mAh): GH₵ 130 - 160\n• Villaon V10 / V20 (Big Battery, Wireless FM): GH₵ 85 - 120\n• Ifinex M66 Plus (Long Standby): GH₵ 75 - 95\n• CALE Super Torch Phone: GH₵ 70 - 85\n\nAll brand-new in sealed boxes with chargers!`,
  },
  {
    id: "thanks",
    title: "🙏 Thank You for Contacting Us",
    category: "Support",
    badge: "Customer Care",
    text: `Thank you for contacting *AKI ADUNI VENTURES*! 🇬🇭 Your satisfaction is our top priority. Please let us know if you need any more information on our phones, laptops, or accessories. Have a wonderful day!`,
  },
];

export default function AdminWhatsAppEnginePage() {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "orders" | "leads" | "contacts">("all");
  const [storeCustomers, setStoreCustomers] = useState<any[]>([]);
  const [isAiPaused, setIsAiPaused] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(true);

  // Modals & Panels
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMoMoModal, setShowMoMoModal] = useState(false);
  const [showWaybillModal, setShowWaybillModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showTemplateGuideModal, setShowTemplateGuideModal] = useState(false);
  const [showSendTemplateModal, setShowSendTemplateModal] = useState(false);
  const [templateNameToSend, setTemplateNameToSend] = useState("aki_catalog_showcase");
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [templateLangCode, setTemplateLangCode] = useState("en_US");
  const [isSendingTemplate, setIsSendingTemplate] = useState(false);

  // New Features: Pinned chats, Quick replies, Media upload, Message actions & CRM notes
  const [pinnedPhones, setPinnedPhones] = useState<string[]>([]);
  const [showQuickRepliesModal, setShowQuickRepliesModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [imageCaption, setImageCaption] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [staffNote, setStaffNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [newChatPhone, setNewChatPhone] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [newChatMessage, setNewChatMessage] = useState("");

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  // MoMo Form
  const [momoAmount, setMomoAmount] = useState<number>(0);
  const [momoNetwork, setMomoNetwork] = useState<"MTN" | "Telecel" | "AT">("MTN");
  const [momoItemTitle, setMomoItemTitle] = useState("");
  const [momoRef, setMomoRef] = useState(`AKI-PAY-${Math.floor(1000 + Math.random() * 9000)}`);

  // Waybill Form
  const [waybillOrderId, setWaybillOrderId] = useState(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [waybillStation, setWaybillStation] = useState("VIP Jeoun Station, Circle");
  const [waybillDestination, setWaybillDestination] = useState("Kumasi Asafo");
  const [waybillDriverPhone, setWaybillDriverPhone] = useState("024 412 8890");
  const [waybillCarReg, setWaybillCarReg] = useState("AS-4182-24");
  const [waybillEta, setWaybillEta] = useState("Today 4:30 PM");

  // Broadcast Form
  const [broadcastTarget, setBroadcastTarget] = useState<"all" | "leads" | "buyers">("all");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const prevPhoneRef = useRef<string>("");
  const prevMessageCountRef = useRef<number>(0);

  // Monitor chat container scroll position to prevent automatic scroll jump when user scrolls up
  const handleChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isBottom = distanceToBottom < 120;
    isNearBottomRef.current = isBottom;
    setShowScrollBottomBtn(!isBottom);
  };

  // Play incoming message chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // quiet fallback
    }
  };

  // Fetch initial messages and poll every 4 seconds
  const fetchMessages = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/whatsapp/messages");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages((prev) => {
            // Keep any optimistic sending messages (id starts with temp-)
            const tempMessages = (prev || []).filter(
              (m) => m && m.id && String(m.id).startsWith("temp-")
            );
            const map = new Map<string, StoredMessage>();
            const cleanActive = selectedPhone ? selectedPhone.replace(/\D/g, "") : "";
            for (const m of data.messages) {
              if (m && m.id) {
                // If message is incoming from the currently active chat, keep it as read
                const fromClean = (m.from || "").replace(/\D/g, "");
                if (cleanActive && m.direction === "incoming" && fromClean === cleanActive) {
                  map.set(m.id, { ...m, status: "read" });
                } else {
                  map.set(m.id, m);
                }
              }
            }
            for (const m of tempMessages) {
              if (m && m.id && !map.has(m.id)) map.set(m.id, m);
            }
            const merged = Array.from(map.values()).sort(
              (a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0)
            );

            // If new incoming messages arrived, play chime sound
            if (prev.length > 0 && merged.length > prev.length) {
              const latestNew = merged.slice(prev.length);
              const hasIncoming = latestNew.some((m: StoredMessage) => m.direction === "incoming");
              if (hasIncoming) playChime();
            }
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Polling WhatsApp messages failed:", err);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Fetch products & orders for context
  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const raw = data?.products || (Array.isArray(data) ? data : []);
        if (Array.isArray(raw)) {
          const sanitized: ProductItem[] = raw.map((p: any) => ({
            id: String(p.id || Math.random()),
            title: String(p.title || "Original Device"),
            slug: String(p.slug || ""),
            price: Number(p.price ?? p.base_price ?? p.variants?.[0]?.price ?? 0),
            regular_price: p.regular_price ? Number(p.regular_price) : undefined,
            image_url: p.image_url || (Array.isArray(p.images) ? p.images[0] : "") || "/icons/logo-icon.webp",
            condition: p.condition || p.variants?.[0]?.condition || "Brand New (Factory Sealed)",
            category: { name: p.category_name || p.categories?.name || "Phones & Gadgets" },
          }));
          setProducts(sanitized);
        }
      })
      .catch(() => { });

    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(() => { });

    // Fetch store customers directory
    fetch("/api/customers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.customers)) {
          setStoreCustomers(data.customers);
        }
      })
      .catch(() => { });

    // Support initiating chat from any admin link (e.g. /admin/whatsapp?phone=233541855969&name=Kofi)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlPhone = params.get("phone");
      const urlMsg = params.get("message");
      if (urlPhone) {
        let clean = urlPhone.replace(/\D/g, "");
        if (clean.startsWith("0") && clean.length === 10) {
          clean = "233" + clean.slice(1);
        }
        setSelectedPhone(clean);
        if (urlMsg) setInputText(urlMsg);
      }
    }
  }, []);

  // Check AI Bot Pause status for active phone
  useEffect(() => {
    if (!selectedPhone) return;
    fetch(`/api/whatsapp/bot-status?phone=${selectedPhone}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setIsAiPaused(Boolean(data.isPaused));
          setRemainingMinutes(data.remainingMinutes || 0);
        }
      })
      .catch(() => { });

    // Mark unread incoming messages from selected phone as read
    const cleanPhone = selectedPhone.replace(/\D/g, "");
    setMessages((prev) =>
      prev.map((m) => {
        const fromClean = (m.from || "").replace(/\D/g, "");
        if (m.direction === "incoming" && fromClean === cleanPhone && m.status !== "read") {
          return { ...m, status: "read" };
        }
        return m;
      })
    );

    fetch("/api/whatsapp/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", phone: cleanPhone }),
    }).catch(() => { });
  }, [selectedPhone]);

  // Toggle AI Bot manual pause / resume
  const handleToggleAiBot = async () => {
    if (!selectedPhone) return;
    const newAction = isAiPaused ? "resume" : "pause";
    try {
      const res = await fetch("/api/whatsapp/bot-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: selectedPhone,
          action: newAction,
          durationHours: 2,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        setIsAiPaused(Boolean(data.isPaused));
        setRemainingMinutes(data.remainingMinutes || 0);
      }
    } catch (err) {
      console.warn("Failed to toggle bot:", err);
    }
  };

  // Group messages into conversations
  const conversations: Conversation[] = useMemo(() => {
    const map = new Map<string, StoredMessage[]>();
    for (const msg of messages || []) {
      if (!msg) continue;
      // Identify contact phone (either incoming 'from' or outgoing 'to')
      const rawPhone = msg.direction === "incoming" ? msg.from : msg.to;
      const contactPhone = typeof rawPhone === "string" ? rawPhone.trim() : "";
      if (!contactPhone) continue;
      if (!map.has(contactPhone)) {
        map.set(contactPhone, []);
      }
      map.get(contactPhone)!.push(msg);
    }

    const convList: Conversation[] = [];
    const knownNames: Record<string, { name: string; city?: string; tags: string[] }> = {
      "233541855969": {
        name: "Kwabena Mensah",
        city: "Kumasi, Ashanti",
        tags: ["Hot Lead", "iPhone 13", "MoMo Paid"],
      },
      "233244192834": {
        name: "Ama Serwaa",
        city: "Circle, Accra",
        tags: ["Keypad Stock", "Circle Pickup"],
      },
      "233201889922": {
        name: "Emmanuel Osei",
        city: "Miaso / Kwahu",
        tags: ["Audio & Earbuds", "Lead"],
      },
    };

    map.forEach((msgs, phone) => {
      if (!phone || typeof phone !== "string") return;
      // Sort messages by timestamp asc
      const sorted = (msgs || []).sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
      const last = sorted[sorted.length - 1] || ({} as StoredMessage);
      const known = knownNames[phone] || {
        name: `Customer ${phone.length >= 4 ? phone.slice(-4) : phone}`,
        city: "Ghana",
        tags: ["Active Inquiry"],
      };

      convList.push({
        phone,
        name: known.name || `Customer ${phone}`,
        city: known.city || "Ghana",
        tags: Array.isArray(known.tags) ? known.tags : [],
        lastMessage: last.text || "[Attachment / Card]",
        lastMessageTime: Number(last.timestamp) || Date.now(),
        lastDirection: last.direction || "incoming",
        unreadCount: sorted.filter((m) => m && m.direction === "incoming" && m.status !== "read").length,
        messages: sorted,
      });
    });

    // Sort conversations: Pinned chats first, then by latest message time desc
    return convList.sort((a, b) => {
      const aPinned = pinnedPhones.includes(a.phone);
      const bPinned = pinnedPhones.includes(b.phone);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return (b.lastMessageTime || 0) - (a.lastMessageTime || 0);
    });
  }, [messages, pinnedPhones]);

  // Set default selected phone on desktop only (so mobile view stays on the Chats list first)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      if (!selectedPhone && conversations.length > 0) {
        setSelectedPhone(conversations[0].phone);
      }
    }
  }, [conversations, selectedPhone]);

  // Current active conversation
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.phone === selectedPhone) || null;
  }, [conversations, selectedPhone]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return (conversations || []).filter((c) => {
      if (!c) return false;
      const safeName = (c.name || "").toLowerCase();
      const safePhone = (c.phone || "").toLowerCase();
      const safeMsg = (c.lastMessage || "").toLowerCase();
      const query = (searchQuery || "").toLowerCase();

      const matchSearch =
        safeName.includes(query) ||
        safePhone.includes(query) ||
        safeMsg.includes(query);

      if (!matchSearch) return false;

      if (filterTab === "unread") return (c.unreadCount || 0) > 0;
      if (filterTab === "orders")
        return (c.tags || []).some((t) => (t || "").toLowerCase().includes("order") || (t || "").toLowerCase().includes("paid"));
      if (filterTab === "leads")
        return (c.tags || []).some((t) => (t || "").toLowerCase().includes("lead") || (t || "").toLowerCase().includes("inquiry"));
      return true;
    });
  }, [conversations, searchQuery, filterTab]);

  // Filter store customers for Contacts tab
  const filteredStoreCustomers = useMemo(() => {
    if (!storeCustomers || storeCustomers.length === 0) return [];
    const q = (searchQuery || "").toLowerCase();
    return storeCustomers.filter((c) => {
      const name = (c.full_name || "").toLowerCase();
      const phone = (c.phone || "").toLowerCase();
      const city = (c.city || "").toLowerCase();
      return name.includes(q) || phone.includes(q) || city.includes(q);
    });
  }, [storeCustomers, searchQuery]);

  // Smart Auto-scroll: only scrolls to bottom if user is already at the bottom or switching chats
  useEffect(() => {
    const currentCount = activeConversation?.messages?.length || 0;
    const isNewConversation = prevPhoneRef.current !== selectedPhone;
    const hasNewMessage = currentCount > prevMessageCountRef.current;

    prevPhoneRef.current = selectedPhone;
    prevMessageCountRef.current = currentCount;

    // 1. If switching conversation, ALWAYS scroll to bottom immediately
    if (isNewConversation) {
      isNearBottomRef.current = true;
      setShowScrollBottomBtn(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
      return;
    }

    // 2. If new message arrived, ONLY scroll down if user was already reading at the bottom
    // If user has scrolled up to read history, DO NOT interrupt them!
    if (hasNewMessage && isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages, selectedPhone]);

  // Send message handler
  const handleSendMessage = async (payloadOverride?: {
    to?: string;
    text?: string;
    type?: any;
    metadata?: any;
    imageUrl?: string;
  }) => {
    const targetPhone = payloadOverride?.to || selectedPhone;
    if (!targetPhone) return;

    if (payloadOverride?.to && payloadOverride.to !== selectedPhone) {
      setSelectedPhone(payloadOverride.to);
    }

    const textToSend = payloadOverride?.text !== undefined ? payloadOverride.text : inputText.trim();
    const typeToSend = payloadOverride?.type || "text";
    const imageUrlToSend = payloadOverride?.imageUrl;
    const metadataToSend = payloadOverride?.metadata || (imageUrlToSend ? { imageUrl: imageUrlToSend } : undefined);

    if (!textToSend && !metadataToSend && !imageUrlToSend) return;

    setIsSending(true);
    setInputText("");

    // Optimistic UI update
    const optimisticMsg: StoredMessage = {
      id: `temp-${Date.now()}`,
      from: "1449155268281310",
      to: targetPhone,
      direction: "outgoing",
      type: typeToSend,
      text: textToSend,
      timestamp: Date.now(),
      status: "sending",
      metadata: metadataToSend,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: targetPhone,
          text: textToSend,
          type: typeToSend,
          imageUrl: imageUrlToSend,
          metadata: metadataToSend,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setIsAiPaused(true);
        setRemainingMinutes(120);
        // Replace temp message with server message
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Quick Order Tracking Card sender
  const handleSendCustomerOrderCard = () => {
    if (!selectedPhone) return;
    const order = activeCustomerOrders[0];
    if (order) {
      const totalFormatted = Number(order.total_amount || 0).toLocaleString();
      const statusUpper = String(order.order_status || "Processing").toUpperCase();
      const paymentUpper = String(order.payment_status || "Paid").toUpperCase();
      const destination = order.delivery_city || "Customer Address";

      const text =
        `📦 *AKI ADUNI VENTURES - Live Order Status*\n\n` +
        `• Order Ref: *#${order.order_number}*\n` +
        `• Customer: ${order.customer_name}\n` +
        `• Total: GH₵ ${totalFormatted} (${paymentUpper})\n` +
        `• Fulfillment Status: 🚚 *${statusUpper}*\n` +
        `• Delivery Destination: ${destination}\n` +
        `• Track Live: https://www.akiaduniventures.com/track?order=${order.order_number}\n\n` +
        `Our dispatch office in Miaso has packaged your order. Please reply here or call 055 124 3372 if you have any delivery questions!`;

      handleSendMessage({ text, type: "text" });
    } else {
      const text =
        `📦 *AKI ADUNI VENTURES - Order Tracking*\n\n` +
        `To track your delivery live on our system, please visit:\n` +
        `👉 https://www.akiaduniventures.com/track\n\n` +
        `Or reply with your Order Number (e.g. ORD-1042) and our team will check your waybill status right away!`;

      handleSendMessage({ text, type: "text" });
    }
  };

  // Quick replies
  const handleQuickReply = (text: string) => {
    handleSendMessage({ text, type: "text" });
  };

  // Send Product Card
  const handleSendProductCard = (product: ProductItem) => {
    const safePrice = Number(product?.price ?? (product as any)?.base_price ?? 0);
    const safeTitle = String(product?.title || "Original Store Device");
    const safeSlug = String(product?.slug || "");
    const safeCond = String(product?.condition || "Brand New (Factory Sealed)");
    const safeImg = String(product?.image_url || (product as any)?.images?.[0] || "/icons/logo-icon.webp");

    const productCard = {
      title: safeTitle,
      price: safePrice,
      condition: safeCond,
      specs: product?.category?.name || "Original Storefront Item",
      warranty: "6 Months Warranty",
      imageUrl: safeImg,
      slug: safeSlug,
    };

    handleSendMessage({
      text: `📱 *${safeTitle}*\nPrice: GH₵ ${safePrice.toLocaleString()}\nCondition: ${safeCond}\nLink: https://www.akiaduniventures.com/product/${safeSlug}`,
      type: "product_card",
      metadata: { productCard },
    });
    setShowProductModal(false);
  };

  // Send MoMo Request
  const handleSendMoMoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoAmount || momoAmount <= 0) return;

    const momoRequest = {
      amount: momoAmount,
      network: momoNetwork,
      reference: momoRef,
      status: "pending",
      itemTitle: momoItemTitle || "Aki Aduni Store Order",
    };

    handleSendMessage({
      text: `💳 *Official MoMo Payment Request*\nAmount: GH₵ ${momoAmount.toLocaleString()}\nNetwork: ${momoNetwork} MoMo\nReference: ${momoRef}`,
      type: "momo_request",
      metadata: { momoRequest },
    });
    setShowMoMoModal(false);
  };

  // Send Waybill & Dispatch
  const handleSendWaybill = (e: React.FormEvent) => {
    e.preventDefault();
    const dispatchWaybill = {
      orderId: waybillOrderId,
      driverPhone: waybillDriverPhone,
      carRegistration: waybillCarReg,
      busStation: waybillStation,
      destination: waybillDestination,
      estimatedArrival: waybillEta,
    };

    handleSendMessage({
      text: `🚚 *Order Dispatched via ${waybillStation}*\nOrder Ref: ${waybillOrderId}\nDriver Contact: ${waybillDriverPhone}\nPlate: ${waybillCarReg}\nETA: ${waybillEta}`,
      type: "dispatch_waybill",
      metadata: { dispatchWaybill },
    });
    setShowWaybillModal(false);
  };

  // Send Meta Approved Template
  const handleSendMetaTemplate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPhone) return;

    const finalTemplateName = templateNameToSend === "custom" ? customTemplateName.trim() : templateNameToSend;
    if (!finalTemplateName) {
      alert("Please enter the Meta template name.");
      return;
    }

    setIsSendingTemplate(true);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedPhone,
          type: "template",
          templateName: finalTemplateName,
          templateLanguage: templateLangCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowSendTemplateModal(false);
        fetchMessages(true);
      } else {
        alert(data.error || "Failed to send template. Ensure it is approved in Meta Business Suite.");
      }
    } catch (err: any) {
      alert("Error sending template: " + err.message);
    } finally {
      setIsSendingTemplate(false);
    }
  };

  // Start New Chat
  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim()) return;

    let cleanPhone = newChatPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
      cleanPhone = "233" + cleanPhone.slice(1);
    }

    const greeting = newChatMessage.trim() || "Hello from AKI ADUNI VENTURES! How can we assist you today?";

    // Select this phone and send initial greeting
    setSelectedPhone(cleanPhone);
    setShowNewChatModal(false);

    handleSendMessage({
      to: cleanPhone,
      text: greeting,
      type: "text",
    });

    setNewChatPhone("");
    setNewChatName("");
    setNewChatMessage("");
  };

  // Load and manage pinned chats
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aki_whatsapp_pinned");
      if (saved) setPinnedPhones(JSON.parse(saved));
    } catch {}
  }, []);

  const togglePinChat = (phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPinnedPhones((prev) => {
      const updated = prev.includes(phone) ? prev.filter((p) => p !== phone) : [phone, ...prev];
      try {
        localStorage.setItem("aki_whatsapp_pinned", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Copy message text helper
  const copyMessageToClipboard = (text: string, msgId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 1800);
  };

  // Image Upload & Dispatch
  const handleSelectImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setShowImageUploadModal(true);
    }
  };

  const handleSendUploadedImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImageFile || !selectedPhone) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedImageFile);
      formData.append("folder", "aki_enterprise/whatsapp");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload image");
      }

      await handleSendMessage({
        to: selectedPhone,
        type: "image",
        imageUrl: uploadData.url,
        text: imageCaption.trim() || undefined,
      });

      setShowImageUploadModal(false);
      setSelectedImageFile(null);
      setImagePreviewUrl("");
      setImageCaption("");
    } catch (err: any) {
      alert("Error sending image: " + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Staff private notes persistence
  useEffect(() => {
    if (!selectedPhone) return;
    try {
      const savedNote = localStorage.getItem(`aki_staff_note_${selectedPhone}`) || "";
      setStaffNote(savedNote);
    } catch {}
  }, [selectedPhone]);

  const handleSaveStaffNote = (val: string) => {
    setStaffNote(val);
    if (!selectedPhone) return;
    try {
      localStorage.setItem(`aki_staff_note_${selectedPhone}`, val);
    } catch {}
  };

  // Broadcast campaign
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setBroadcastSending(true);
    setBroadcastResult(null);

    // Determine target numbers
    const targetPhones = conversations
      .filter((c) => {
        if (broadcastTarget === "leads") return c.tags.some((t) => t.toLowerCase().includes("lead"));
        if (broadcastTarget === "buyers") return c.tags.some((t) => t.toLowerCase().includes("paid") || t.toLowerCase().includes("order"));
        return true;
      })
      .map((c) => c.phone);

    let sentCount = 0;
    for (const phone of targetPhones) {
      try {
        await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: phone,
            text: broadcastMessage,
            type: "text",
          }),
        });
        sentCount++;
      } catch (err) {
        console.warn(`Broadcast failed for ${phone}:`, err);
      }
    }

    setBroadcastSending(false);
    setBroadcastResult(`Successfully delivered broadcast to ${sentCount} active WhatsApp numbers!`);
    fetchMessages();
  };

  // Find matching customer orders for active phone
  const activeCustomerOrders = useMemo(() => {
    if (!selectedPhone || typeof selectedPhone !== "string") return [];
    const cleanCurrent = selectedPhone.replace(/\D/g, "").slice(-9);
    if (!cleanCurrent) return [];
    return (orders || []).filter((o) => {
      if (!o || !o.customer_phone) return false;
      const cleanOrderPhone = String(o.customer_phone).replace(/\D/g, "");
      return cleanOrderPhone.endsWith(cleanCurrent);
    });
  }, [orders, selectedPhone]);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-gray-100 overflow-hidden">
      {/* Top Engine Header Bar - hides on mobile when inside an active chat */}
      <header className={`${selectedPhone ? "hidden md:flex" : "flex"} bg-[#1f2c34] md:bg-slate-900 border-b border-slate-800 px-3 md:px-4 py-2.5 md:py-3 items-center justify-between shrink-0`}>
        <div className="flex items-center gap-2.5 md:gap-3">
          {/* Back to Admin Dashboard on Mobile */}
          <Link
            href="/admin/dashboard"
            className="md:hidden p-1.5 -ml-1 text-gray-300 hover:text-white rounded-lg active:bg-slate-800 transition shrink-0 flex items-center gap-1 text-xs font-bold"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Admin</span>
          </Link>

          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden shrink-0 border border-emerald-500/40 shadow-sm flex items-center justify-center bg-emerald-600">
            <img src="/images/social/whatsapp.jpg" alt="WhatsApp" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Aki WhatsApp
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] text-gray-400 truncate max-w-[200px] sm:max-w-none">
              Direct Sales, MoMo &amp; Customer Care • 055 124 3372
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 md:p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${soundEnabled
              ? "bg-slate-800 text-gray-300 hover:text-white"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}
            title={soundEnabled ? "Notification sound enabled" : "Sound muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Muted"}</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={() => fetchMessages(true)}
            disabled={isRefreshing}
            className="p-1.5 md:p-2 rounded-xl bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 transition"
            title="Refresh conversations"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-orange-400" : ""}`} />
          </button>

          {/* Meta Templates Guide button */}
          <button
            onClick={() => setShowTemplateGuideModal(true)}
            className="hidden sm:flex px-3 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-xs font-bold items-center gap-1.5 transition"
            title="Create & manage Meta promotional templates"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Templates</span>
          </button>

          {/* Broadcast button */}
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Broadcast</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl bg-[#00a884] hover:bg-[#029070] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: 3-column or 2-column flex */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= COLUMN 1: CONVERSATIONS LIST ================= */}
        <aside className={`${selectedPhone ? "hidden md:flex" : "flex"} w-full md:w-88 lg:w-96 bg-[#111b21] md:bg-slate-950 md:border-r border-slate-800 flex-col shrink-0 relative`}>
          {/* Search & Filter */}
          <div className="p-3 border-b border-slate-800/80 space-y-2.5 bg-[#1f2c34] md:bg-slate-900/40">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone, name or text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111b21] md:bg-slate-900 border border-slate-700/60 md:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[11px] font-semibold">
              <button
                onClick={() => setFilterTab("all")}
                className={`px-2.5 py-1 rounded-lg transition ${filterTab === "all"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-gray-400 hover:text-white hover:bg-slate-900"
                  }`}
              >
                All ({conversations.length})
              </button>
              <button
                onClick={() => setFilterTab("unread")}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${filterTab === "unread"
                  ? "bg-[#00a884] text-white font-bold"
                  : "text-gray-400 hover:text-white hover:bg-slate-900"
                  }`}
              >
                Unread
                {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#25D366] text-[#111b21] text-[9px] font-black flex items-center justify-center">
                    {conversations.filter((c) => c.unreadCount > 0).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterTab("orders")}
                className={`px-2.5 py-1 rounded-lg transition ${filterTab === "orders"
                  ? "bg-orange-600 text-white font-bold"
                  : "text-gray-400 hover:text-white hover:bg-slate-900"
                  }`}
              >
                Orders
              </button>
              <button
                onClick={() => setFilterTab("leads")}
                className={`px-2.5 py-1 rounded-lg transition ${filterTab === "leads"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-gray-400 hover:text-white hover:bg-slate-900"
                  }`}
              >
                Leads
              </button>
              <button
                onClick={() => setFilterTab("contacts")}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${filterTab === "contacts"
                  ? "bg-purple-600 text-white font-bold"
                  : "text-gray-400 hover:text-white hover:bg-slate-900"
                  }`}
              >
                <span>Customers</span>
                {storeCustomers.length > 0 && (
                  <span className="text-[9px] opacity-80">({storeCustomers.length})</span>
                )}
              </button>
            </div>
          </div>

          {/* Conversation list items OR Customers Directory */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filterTab === "contacts" ? (
              filteredStoreCustomers.length === 0 ? (
                <div className="p-8 text-center text-gray-500 space-y-2">
                  <User className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-xs font-semibold text-gray-400">No store customers found.</p>
                  <p className="text-[11px] text-gray-500">Customers who place orders on the website will appear here.</p>
                </div>
              ) : (
                filteredStoreCustomers.map((cust) => {
                  let cleanCustPhone = String(cust.phone || "").replace(/\D/g, "");
                  if (cleanCustPhone.startsWith("0") && cleanCustPhone.length === 10) {
                    cleanCustPhone = "233" + cleanCustPhone.slice(1);
                  }
                  const isSelected = selectedPhone && cleanCustPhone.endsWith(selectedPhone.slice(-9));

                  return (
                    <button
                      key={cust.id || cust.phone}
                      onClick={() => {
                        setSelectedPhone(cleanCustPhone);
                      }}
                      className={`w-full text-left p-3.5 flex items-center justify-between gap-3 transition ${isSelected
                        ? "bg-slate-800/90 border-l-4 border-emerald-500"
                        : "hover:bg-slate-900/60"
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                          {((cust.full_name || "C").slice(0, 2)).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{cust.full_name}</h4>
                          <p className="text-[11px] text-gray-400 font-mono truncate">{cust.phone}</p>
                          <p className="text-[10px] text-purple-400">
                            {cust.total_orders || 1} Orders • GH₵ {Number(cust.total_spent || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </div>
                    </button>
                  );
                })
              )
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-600" />
                <p className="text-xs">No conversations match your filter.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.phone === selectedPhone;
                const isPinned = pinnedPhones.includes(conv.phone);
                const convActiveOrders = (orders || []).filter((o) => {
                  const cleanOPhone = String(o?.customer_phone || "").replace(/\D/g, "");
                  return cleanOPhone && conv.phone.endsWith(cleanOPhone.slice(-9));
                });
                const topOrder = convActiveOrders[0];

                const formattedTime = new Date(conv.lastMessageTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <button
                    key={conv.phone}
                    onClick={() => setSelectedPhone(conv.phone)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition group ${isSelected
                      ? "bg-slate-800/90 border-l-4 border-emerald-500"
                      : "hover:bg-slate-900/60 active:bg-slate-800/50"
                      }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-linear-to-br from-emerald-600 to-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {((conv.name || "Customer").slice(0, 2)).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full overflow-hidden border border-slate-900 shadow">
                        <img src="/images/social/whatsapp.jpg" alt="WhatsApp" className="w-full h-full object-cover" />
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isPinned && (
                            <Pin className="w-3 h-3 text-emerald-400 fill-emerald-400 rotate-45 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-white truncate max-w-[130px]">
                            {conv.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] ${conv.unreadCount > 0 ? "text-[#25D366] font-bold" : "text-gray-400"}`}>
                            {formattedTime}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => togglePinChat(conv.phone, e)}
                            title={isPinned ? "Unpin conversation" : "Pin to top"}
                            className="opacity-40 group-hover:opacity-100 hover:text-emerald-400 p-0.5 transition"
                          >
                            <Pin className={`w-3 h-3 ${isPinned ? "text-emerald-400 fill-emerald-400 rotate-45" : "text-gray-500"}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs text-gray-400 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0 truncate">
                          {conv.lastDirection === "outgoing" && (
                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                          )}
                          <span className="truncate">{conv.lastMessage}</span>
                        </div>

                        {conv.unreadCount > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#25D366] text-[#111b21] text-[11px] font-black flex items-center justify-center shrink-0 shadow-xs">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Phone, Orders & Tags */}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-500 font-mono">
                          +{conv.phone}
                        </span>
                        <div className="flex items-center gap-1 overflow-hidden">
                          {topOrder && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 shrink-0">
                              <Package className="w-2.5 h-2.5 text-purple-400" />
                              #{topOrder.order_number}
                            </span>
                          )}
                          {(conv.tags || []).slice(0, 1).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-gray-300 border border-slate-700 truncate"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Mobile Floating Action Button (FAB) for New Chat */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="md:hidden absolute bottom-5 right-5 w-13 h-13 rounded-full bg-[#00a884] hover:bg-[#029070] text-white shadow-2xl flex items-center justify-center z-30 active:scale-95 transition"
            title="Start New Chat"
          >
            <Plus className="w-6 h-6" />
          </button>
        </aside>

        {/* ================= COLUMN 2: ACTIVE CHAT CONSOLE ================= */}
        <main className={`${!selectedPhone ? "hidden md:flex" : "flex"} flex-1 flex-col bg-[#0b141a] relative min-w-0 h-full`}>
          {activeConversation ? (
            <>
              {/* Chat Header (Real WhatsApp style with Back Button on mobile) */}
              <div className="bg-[#1f2c34] md:bg-slate-900 border-b border-slate-800 px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  {/* Back button (Mobile only) */}
                  <button
                    onClick={() => setSelectedPhone("")}
                    className="md:hidden p-1.5 -ml-1 text-gray-300 hover:text-white rounded-lg active:bg-slate-800 transition shrink-0"
                    title="Back to Chats list"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-200" />
                  </button>

                  <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-black flex items-center justify-center shrink-0">
                    {((activeConversation.name || "Customer").slice(0, 2)).toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full overflow-hidden border border-slate-900 shadow">
                      <img src="/images/social/whatsapp.jpg" alt="WhatsApp" className="w-full h-full object-cover" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <h2 className="text-xs md:text-sm font-bold text-white truncate max-w-[130px] sm:max-w-[200px]">
                        {activeConversation.name}
                      </h2>
                      <span className="text-[9px] md:text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono truncate">
                        +{activeConversation.phone}
                      </span>
                    </div>
                    <p className="text-[10px] md:text-[11px] text-gray-400 truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400">online on WhatsApp</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  {/* AI Bot Human Session Mode Toggle */}
                  <button
                    onClick={handleToggleAiBot}
                    className={`px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition flex items-center gap-1 border shadow-xs ${isAiPaused
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                      }`}
                    title={
                      isAiPaused
                        ? "Live Human Support session active (AI Bot paused for this customer). Click to resume bot."
                        : "AI Bot is active. Click to pause bot for 2 hours (Human Mode)."
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isAiPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"
                        }`}
                    />
                    <span className="hidden sm:inline">
                      {isAiPaused ? `Human (${remainingMinutes}m)` : "AI Bot"}
                    </span>
                    <span className="text-[9px] underline">
                      {isAiPaused ? "Resume" : "Pause"}
                    </span>
                  </button>

                  {/* Phone Call Link */}
                  <a
                    href={`tel:${activeConversation.phone}`}
                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-800 text-gray-300 hover:text-white transition"
                    title="Direct Phone Call"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  </a>

                  {/* Toggle Customer Info / Orders Drawer */}
                  <button
                    onClick={() => setShowRightDrawer(!showRightDrawer)}
                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition flex items-center gap-1"
                    title="Customer Details & Orders"
                  >
                    <User className="w-3.5 h-3.5 text-orange-400" />
                  </button>
                </div>
              </div>

              {/* Active Customer Order Tracking Alert Pill */}
              {activeCustomerOrders.length > 0 && (
                <div className="bg-purple-950/40 border-b border-purple-800/40 px-4 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-purple-200 truncate">
                      Active Customer Order <strong>#{activeCustomerOrders[0].order_number}</strong> • GH₵ {Number(activeCustomerOrders[0].total_amount).toLocaleString()} ({activeCustomerOrders[0].order_status})
                    </span>
                  </div>
                  <button
                    onClick={handleSendCustomerOrderCard}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[11px] shrink-0 flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Send Tracking Card</span>
                  </button>
                </div>
              )}

              {/* Message History Stream */}
              <div ref={chatContainerRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                {/* Security & Verification Banner */}
                <div className="max-w-md mx-auto text-center my-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-gray-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Official verified Meta WhatsApp Business connection for Aki Aduni Ventures.
                  </span>
                </div>

                {activeConversation.messages.map((msg) => {
                  const isOutgoing = msg.direction === "outgoing";
                  const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-md ${isOutgoing
                          ? "bg-[#005c4b] text-white rounded-tr-xs"
                          : "bg-[#202c33] text-gray-100 rounded-tl-xs"
                          }`}
                      >
                        {/* 1. PRODUCT RECOMMENDATION CARD BUBBLE */}
                        {msg.type === "product_card" && msg.metadata?.productCard && (
                          <div className="mb-2 bg-slate-900/70 border border-emerald-500/30 rounded-xl p-2.5 space-y-2">
                            <div className="flex gap-2.5 items-center">
                              {msg.metadata.productCard.imageUrl && (
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                                  <img
                                    src={msg.metadata.productCard.imageUrl}
                                    alt={msg.metadata.productCard.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                  Product Recommendation
                                </span>
                                <h4 className="text-xs font-bold text-white truncate">
                                  {msg.metadata.productCard.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-black text-white">
                                    GH₵ {Number(msg.metadata.productCard.price).toLocaleString()}
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                                    {msg.metadata.productCard.condition || "Grade A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                              <span className="text-gray-400">
                                🛡️ {msg.metadata.productCard.warranty || "6 Mo. Warranty"}
                              </span>
                              <Link
                                href={`/product/${msg.metadata.productCard.slug}`}
                                target="_blank"
                                className="text-emerald-400 hover:underline flex items-center gap-0.5 font-bold"
                              >
                                View Specs <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* 2. MOMO PAYMENT REQUEST BUBBLE */}
                        {msg.type === "momo_request" && msg.metadata?.momoRequest && (
                          <div className="mb-2 bg-slate-900/80 border border-yellow-500/40 rounded-xl p-3 space-y-2 text-white">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                                <CreditCard className="w-3.5 h-3.5" /> MoMo Payment Request
                              </span>
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 uppercase">
                                {msg.metadata.momoRequest.status || "Pending"}
                              </span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-lg space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Amount to Pay:</span>
                                <span className="font-extrabold text-emerald-400 text-sm">
                                  GH₵ {Number(msg.metadata.momoRequest.amount).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-[11px] text-gray-300">
                                <span>Network:</span>
                                <span className="font-bold">{msg.metadata.momoRequest.network} MoMo</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-gray-300">
                                <span>Merchant Account:</span>
                                <span className="font-mono text-orange-400">055 124 3372</span>
                              </div>
                              <div className="flex justify-between text-[10px] text-gray-400">
                                <span>Reference:</span>
                                <span className="font-mono">{msg.metadata.momoRequest.reference}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. DISPATCH & WAYBILL BUBBLE */}
                        {msg.type === "dispatch_waybill" && msg.metadata?.dispatchWaybill && (
                          <div className="mb-2 bg-slate-900/80 border border-blue-500/40 rounded-xl p-3 space-y-2 text-white">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" /> Order Dispatched &amp; Waybill
                              </span>
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                IN TRANSIT
                              </span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Bus Station:</span>
                                <span className="font-bold">{msg.metadata.dispatchWaybill.busStation}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Destination:</span>
                                <span className="font-bold text-emerald-400">{msg.metadata.dispatchWaybill.destination}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Driver Contact:</span>
                                <span className="font-mono text-orange-400 font-bold">{msg.metadata.dispatchWaybill.driverPhone}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Vehicle Plate:</span>
                                <span className="font-mono">{msg.metadata.dispatchWaybill.carRegistration}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Estimated Arrival:</span>
                                <span className="text-gray-300">{msg.metadata.dispatchWaybill.estimatedArrival}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Image bubble if type is image */}
                        {msg.type === "image" && (msg.metadata?.imageUrl || msg.text?.startsWith("http")) && (
                          <div className="mb-2 rounded-xl overflow-hidden bg-black/40 border border-slate-700/60 max-w-sm">
                            <img
                              src={msg.metadata?.imageUrl || msg.text}
                              alt="WhatsApp Image"
                              className="w-full max-h-64 object-contain rounded-lg"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        {/* Main text message content */}
                        {msg.text && (
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.text}
                          </p>
                        )}

                        {/* Timestamp, Copy & Delivery status */}
                        <div className="flex items-center justify-between gap-2 mt-1 text-[10px] text-gray-300/80">
                          <button
                            type="button"
                            onClick={() => copyMessageToClipboard(msg.text || "", msg.id)}
                            className="opacity-40 hover:opacity-100 flex items-center gap-1 hover:text-white transition"
                            title="Copy message text"
                          >
                            {copiedMsgId === msg.id ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Copied
                              </span>
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            <span>{timeFormatted}</span>
                            {isOutgoing && (
                              <span>
                                {msg.status === "sending" ? (
                                  <span className="w-2.5 h-2.5 rounded-full border border-gray-300 border-t-transparent animate-spin inline-block" />
                                ) : msg.status === "read" ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                                ) : (
                                  <CheckCheck className="w-3.5 h-3.5 text-gray-300" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />

                {/* Floating WhatsApp Scroll Down Button */}
                {showScrollBottomBtn && (
                  <button
                    onClick={() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                      isNearBottomRef.current = true;
                      setShowScrollBottomBtn(false);
                    }}
                    className="sticky bottom-3 float-right z-20 w-9 h-9 rounded-full bg-[#1f2c34] md:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-white shadow-2xl flex items-center justify-center transition active:scale-95"
                    title="Scroll down to latest messages"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Quick Actions Commerce Bar */}
              <div className="bg-[#1f2c34] md:bg-slate-900 border-t border-slate-800 p-2.5 space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {/* Quick Saved Replies */}
                  <button
                    onClick={() => setShowQuickRepliesModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 flex items-center gap-1.5 font-semibold shrink-0 border border-yellow-500/30"
                    title="Quick saved store replies"
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Quick Replies</span>
                  </button>

                  {/* Send Photo */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 flex items-center gap-1.5 font-semibold shrink-0 border border-blue-500/30"
                    title="Send a photo, receipt or waybill"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Send Photo</span>
                  </button>

                  {/* Send Product Card */}
                  <button
                    onClick={() => setShowProductModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 hover:text-white flex items-center gap-1.5 font-semibold shrink-0 border border-slate-700"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Send Product</span>
                  </button>

                  {/* Request MoMo Payment */}
                  <button
                    onClick={() => setShowMoMoModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 hover:text-white flex items-center gap-1.5 font-semibold shrink-0 border border-slate-700"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Request MoMo</span>
                  </button>

                  {/* Send Waybill */}
                  <button
                    onClick={() => setShowWaybillModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 hover:text-white flex items-center gap-1.5 font-semibold shrink-0 border border-slate-700"
                  >
                    <Truck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Send Waybill</span>
                  </button>

                  {/* Send Order Tracking */}
                  <button
                    onClick={handleSendCustomerOrderCard}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 hover:text-white flex items-center gap-1.5 font-semibold shrink-0 border border-slate-700"
                  >
                    <Package className="w-3.5 h-3.5 text-purple-400" />
                    <span>Send Order Status</span>
                  </button>

                  {/* Send Meta Template */}
                  <button
                    onClick={() => setShowSendTemplateModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 hover:text-white flex items-center gap-1.5 font-semibold shrink-0 border border-slate-700"
                    title="Send an approved Meta Template (e.g. Catalog showcase or promo)"
                  >
                    <FileText className="w-3.5 h-3.5 text-pink-400" />
                    <span>Meta Template</span>
                  </button>
                </div>

                {/* Message Input Box - WhatsApp authentic pill and circular button */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5 md:gap-2"
                >
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleSelectImageFile}
                    className="hidden"
                  />

                  {/* Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition shrink-0"
                    title="Attach Photo / Receipt / Waybill"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Quick Replies Trigger Icon */}
                  <button
                    type="button"
                    onClick={() => setShowQuickRepliesModal(true)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-slate-800 rounded-full transition shrink-0"
                    title="Open Quick Replies"
                  >
                    <Zap className="w-4 h-4" />
                  </button>

                  <div className="flex-1 bg-[#202c33] md:bg-slate-950 border border-slate-700/80 rounded-full px-4 py-2 md:py-2.5 flex items-center gap-2 focus-within:border-[#00a884]">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !inputText.trim()}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#00a884] hover:bg-[#029070] disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/40 active:scale-95 transition"
                    title="Send message"
                  >
                    {isSending ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-xl p-0.5 bg-emerald-600/20">
                <img src="/images/social/whatsapp.jpg" alt="WhatsApp" className="w-full h-full object-cover rounded-xl" />
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                Select a Customer Conversation
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Choose an active WhatsApp chat from the left or click &quot;New Chat&quot; to send a direct message, product card, or MoMo payment request to any phone number.
              </p>
            </div>
          )}
        </main>

        {/* ================= COLUMN 3: CUSTOMER CRM & ORDERS DRAWER ================= */}
        {showRightDrawer && activeConversation && (
          <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-88 lg:static lg:flex lg:w-80 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-400" /> Customer CRM &amp; Orders
              </h3>
              <button
                onClick={() => setShowRightDrawer(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-emerald-600 to-teal-800 text-white font-black text-lg mx-auto flex items-center justify-center shadow-lg">
                {((activeConversation.name || "Customer").slice(0, 2)).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{activeConversation.name || "Customer"}</h4>
                <p className="text-xs font-mono text-emerald-400">+{activeConversation.phone || ""}</p>
                <p className="text-[11px] text-gray-400">{activeConversation.city || "Accra, Ghana"}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 justify-center pt-1">
                {(activeConversation.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-orange-400 border border-orange-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Customer Orders from Supabase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  Store Orders ({activeCustomerOrders.length})
                </span>
                <Link
                  href="/admin/orders"
                  className="text-[10px] text-orange-400 hover:underline flex items-center gap-0.5"
                >
                  Manage <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {activeCustomerOrders.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center text-xs text-gray-500">
                  No active storefront order on file for this number. Use &quot;Request MoMo&quot; to initiate a transaction.
                </div>
              ) : (
                activeCustomerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">#{ord.order_number}</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${ord.payment_status === "paid"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}
                      >
                        {ord.payment_status}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-400 text-[11px]">
                      <span>Total Amount:</span>
                      <span className="text-white font-black">
                        GH₵ {Number(ord.total_amount).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-400 text-[11px]">
                      <span>Fulfillment:</span>
                      <span className="text-emerald-400 font-bold capitalize">
                        {ord.order_status}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setWaybillOrderId(ord.order_number);
                        setShowWaybillModal(true);
                      }}
                      className="w-full mt-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Truck className="w-3 h-3 text-blue-400" />
                      <span>Send Dispatch Waybill for this Order</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Staff Private Notes */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                  <span>📝 Staff Private Notes</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">Auto-saved</span>
              </div>
              <textarea
                rows={3}
                placeholder="Add private staff note (e.g. promised delivery by 3PM, agreed on GH₵ 50 discount, requested blue color)..."
                value={staffNote}
                onChange={(e) => handleSaveStaffNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
              />
              <p className="text-[10px] text-gray-500 italic">
                Notes are private to store staff and never visible to the customer.
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* ================= MODAL: QUICK SAVED REPLIES ================= */}
      {showQuickRepliesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Quick Saved Store Replies
              </h3>
              <button
                onClick={() => setShowQuickRepliesModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {QUICK_SAVED_REPLIES.map((reply) => (
                <div
                  key={reply.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {reply.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-yellow-300 border border-slate-700">
                      {reply.badge}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 whitespace-pre-wrap font-sans leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                    {reply.text}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setInputText(reply.text);
                        setShowQuickRepliesModal(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <span>Insert into Box</span>
                    </button>
                    <button
                      type="button"
                      disabled={!selectedPhone}
                      onClick={() => {
                        handleSendMessage({
                          to: selectedPhone,
                          text: reply.text,
                          type: "text",
                        });
                        setShowQuickRepliesModal(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Instantly</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowQuickRepliesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-gray-300 text-xs font-bold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMAGE ATTACHMENT UPLOAD ================= */}
      {showImageUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                Send Image via WhatsApp
              </h3>
              <button
                onClick={() => {
                  setShowImageUploadModal(false);
                  setSelectedImageFile(null);
                  setImagePreviewUrl("");
                  setImageCaption("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendUploadedImage} className="space-y-4">
              {imagePreviewUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black/50 max-h-60 flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="max-h-60 max-w-full object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {selectedImageFile?.name}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bus driver waybill receipt or phone photos..."
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-gray-400 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Delivered directly to customer&apos;s WhatsApp as a high-resolution media attachment.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageUploadModal(false);
                    setSelectedImageFile(null);
                    setImagePreviewUrl("");
                    setImageCaption("");
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-gray-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  {isUploadingImage ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Uploading &amp; Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW CHAT ================= */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Start New WhatsApp Chat
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartNewChat} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Customer Phone Number (Ghana) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 054 185 5969 or 233541855969"
                  required
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kofi Boateng"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Initial Message
                </label>
                <textarea
                  rows={3}
                  placeholder="Hello from AKI ADUNI VENTURES! How can we assist you with our phone stock today?"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-gray-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Start Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SELECT & SEND PRODUCT CARD ================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                Select Product to Send to Customer
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog (e.g. iPhone, Itel, Oraimo, Samsung)..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800 space-y-1">
              {(products || [])
                .filter((p) => (p?.title || "").toLowerCase().includes((productSearch || "").toLowerCase()))
                .slice(0, 40)
                .map((product) => {
                  const safePrice = Number(product?.price ?? (product as any)?.base_price ?? 0);
                  const safeImage = product?.image_url || (product as any)?.images?.[0] || "";
                  return (
                    <div
                      key={product.id || product.slug}
                      className="p-2.5 rounded-xl hover:bg-slate-800/70 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {safeImage ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-800 relative border border-slate-700">
                            <img
                              src={safeImage}
                              alt={product.title || "Product"}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/icons/logo-icon.webp";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-gray-500 border border-slate-700">
                            <ShoppingBag className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{product.title || "Store Item"}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400">
                            <span className="text-emerald-400 font-extrabold">
                              GH₵ {safePrice.toLocaleString()}
                            </span>
                            <span>•</span>
                            <span className="truncate">{product.condition || "Brand New"}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendProductCard(product)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition shadow-sm"
                      >
                        <span>Send Card</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

              {(products || []).filter((p) => (p?.title || "").toLowerCase().includes((productSearch || "").toLowerCase())).length === 0 && (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No products matched &quot;{productSearch}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REQUEST MOMO PAYMENT ================= */}
      {showMoMoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-yellow-400" />
                Request Mobile Money Payment
              </h3>
              <button
                onClick={() => setShowMoMoModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMoMoRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Amount in Ghana Cedis (GH₵) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 5200"
                  value={momoAmount || ""}
                  onChange={(e) => setMomoAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Network Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["MTN", "Telecel", "AT"] as const).map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setMomoNetwork(net)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${momoNetwork === net
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500"
                        : "bg-slate-950 text-gray-400 border-slate-800 hover:border-slate-700"
                        }`}
                    >
                      {net} MoMo
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Item / Order Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apple iPhone 13 128GB Midnight"
                  value={momoItemTitle}
                  onChange={(e) => setMomoItemTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={momoRef}
                  onChange={(e) => setMomoRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-gray-400">
                Customer will receive a formatted WhatsApp payment card with instruction to pay to{" "}
                <span className="text-orange-400 font-bold">055 124 3372</span>.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoMoModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-gray-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-yellow-600/30"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Send MoMo Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SEND DISPATCH & WAYBILL ================= */}
      {showWaybillModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                Dispatch &amp; Bus Waybill Details
              </h3>
              <button
                onClick={() => setShowWaybillModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendWaybill} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Order Ref
                  </label>
                  <input
                    type="text"
                    required
                    value={waybillOrderId}
                    onChange={(e) => setWaybillOrderId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kumasi Asafo"
                    value={waybillDestination}
                    onChange={(e) => setWaybillDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Bus Station / Dispatch Hub
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Jeoun Station, Circle"
                  value={waybillStation}
                  onChange={(e) => setWaybillStation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Driver Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="024 XXX XXXX"
                    value={waybillDriverPhone}
                    onChange={(e) => setWaybillDriverPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Car / Bus Reg Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AS-4182-24"
                    value={waybillCarReg}
                    onChange={(e) => setWaybillCarReg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Estimated Arrival Time (ETA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Today 4:30 PM"
                  value={waybillEta}
                  onChange={(e) => setWaybillEta(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWaybillModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-gray-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Send Waybill to Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SEND META TEMPLATE ================= */}
      {showSendTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Send Meta WhatsApp Template</h3>
                  <p className="text-[11px] text-gray-400">
                    Send an approved template to {activeConversation?.name || selectedPhone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSendTemplateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMetaTemplate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Select Approved Meta Template
                </label>
                <select
                  value={templateNameToSend}
                  onChange={(e) => setTemplateNameToSend(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="aki_catalog_showcase">aki_catalog_showcase (Official Catalog &amp; Shop)</option>
                  <option value="aki_device_promo">aki_device_promo (Device Flash Sale &amp; Stock)</option>
                  <option value="aki_keypad_promo">aki_keypad_promo (Keypad Phones Promo)</option>
                  <option value="aki_cart_recovery">aki_cart_recovery (Cart Recovery &amp; MoMo Follow-up)</option>
                  <option value="custom">✏️ Enter custom template name from Meta...</option>
                </select>
              </div>

              {templateNameToSend === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Exact Template Name in Meta WhatsApp Manager *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. aki_new_year_sale, catalog_template, hello_world"
                    value={customTemplateName}
                    onChange={(e) => setCustomTemplateName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Language Code
                  </label>
                  <select
                    value={templateLangCode}
                    onChange={(e) => setTemplateLangCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                  >
                    <option value="en_US">en_US (English - US)</option>
                    <option value="en">en (English generic)</option>
                    <option value="en_GB">en_GB (English - UK)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    24h Window Bypass
                  </label>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 h-[34px]">
                    <Check className="w-3.5 h-3.5" /> Delivered Anytime
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-gray-400 space-y-1">
                <p className="font-semibold text-gray-300">💡 Meta Cloud API Template Rule</p>
                <p>
                  Meta requires pre-approved templates when initiating outbound conversations or messaging past 24 hours. The template will be delivered directly to the customer&apos;s WhatsApp.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSendTemplateModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTemplate}
                  className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-pink-600/30 transition disabled:opacity-50"
                >
                  {isSendingTemplate ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSendingTemplate ? "Sending..." : "Send Template Now"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BROADCAST CAMPAIGN ================= */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-400" />
                WhatsApp Promotional Broadcast
              </h3>
              <button
                onClick={() => {
                  setShowBroadcastModal(false);
                  setBroadcastResult(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {broadcastResult ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-bold">{broadcastResult}</p>
                <button
                  onClick={() => {
                    setShowBroadcastModal(false);
                    setBroadcastResult(null);
                  }}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "all", label: `All Contacts (${conversations.length})` },
                      {
                        key: "leads",
                        label: `Hot Leads (${conversations.filter((c) => c.tags.some((t) => t.toLowerCase().includes("lead"))).length
                          })`,
                      },
                      {
                        key: "buyers",
                        label: `Paid Buyers (${conversations.filter((c) => c.tags.some((t) => t.toLowerCase().includes("paid"))).length
                          })`,
                      },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setBroadcastTarget(opt.key as any)}
                        className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${broadcastTarget === opt.key
                          ? "bg-orange-600/20 text-orange-400 border-orange-500 font-bold"
                          : "bg-slate-950 text-gray-400 border-slate-800"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Broadcast Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="🔥 Weekend Promo at Aki Aduni Ventures! Get 10% off original keypad phones (Itel, Villaon) and genuine UK-used iPhones. Visit https://www.akiaduniventures.com or reply here to reserve!"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-gray-300 text-xs font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcastSending}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/30"
                  >
                    {broadcastSending ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Broadcast Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* ================= MODAL: META TEMPLATES GUIDE ================= */}
      {showTemplateGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Meta WhatsApp Promotional Templates</h3>
                  <p className="text-xs text-gray-400">Step-by-step creation guide &amp; ready-to-copy marketing templates</p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplateGuideModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Link Banner */}
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-purple-200">Official Meta WhatsApp Manager Console</p>
                <p className="text-[11px] text-gray-400">Create, submit and view approval status of your templates in 1 click.</p>
              </div>
              <a
                href="https://business.facebook.com/wa/manage/message-templates/"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-md shadow-purple-600/30"
              >
                <span>Open Meta Templates</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 4-Step Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">How to Create in Meta (4 Quick Steps)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">1. Select Category</span>
                  <p className="text-gray-400 text-[11px]">Choose <strong>Marketing</strong> for product discounts, promos, or new stock announcements.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">2. Name Your Template</span>
                  <p className="text-gray-400 text-[11px]">Use lowercase and underscores only (e.g. <code className="text-white">aki_device_promo</code> or <code className="text-white">aki_keypad_stock</code>).</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">3. Paste Body with Variables</span>
                  <p className="text-gray-400 text-[11px]">Use <code className="text-white">{`{{1}}`}</code> for customer name, <code className="text-white">{`{{2}}`}</code> for product, and <code className="text-white">{`{{3}}`}</code> for price.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">4. Add Buttons &amp; Submit</span>
                  <p className="text-gray-400 text-[11px]">Add a <strong>Visit Website</strong> button linking to your shop. Meta AI approves in 1-5 minutes.</p>
                </div>
              </div>
            </div>

            {/* Ready-to-copy Templates */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Ready-to-Copy Promotion Templates</h4>

              {/* Template 1 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Template 1: Device Flash Sale &amp; New Stock</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-gray-300">aki_device_promo</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {`Hello {{1}}, exciting news from AKI ADUNI VENTURES! 🇬🇭

We have received fresh stock of original {{2}} starting from just GH₵ {{3}} with a full 6-Month Warranty.

✅ Tested & Grade A Certified
🚚 Nationwide VIP bus delivery available today!

Tap the button below or reply here to reserve yours.`}
                </div>
                <div className="text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Category: <strong>Marketing</strong> • Language: <strong>English (US)</strong></span>
                  <span className="text-purple-300">Button: Visit Website &rarr; https://www.akiaduniventures.com</span>
                </div>
              </div>

              {/* Template 2 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-400">Template 2: Keypad Phones Promotion</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-gray-300">aki_keypad_promo</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {`Hello {{1}}, need a durable long-battery phone? 🔋

Our brand-new keypad phones (Itel, Villaon, Ifinex, CALE) are now available at our Circle & Miaso shops starting from only GH₵ 70.00!

Dual SIM • Heavy Battery • Wireless FM • Super Torch

Reply "KEYPAD" to this message to see the full price list.`}
                </div>
                <div className="text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Category: <strong>Marketing</strong> • Language: <strong>English (US)</strong></span>
                  <span className="text-yellow-300">Button: Quick Reply &rarr; "I Want To Buy"</span>
                </div>
              </div>

              {/* Template 3 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Template 3: Abandoned Cart Follow-Up</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-gray-300">aki_cart_recovery</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {`Hello {{1}}, we noticed you were interested in {{2}} at AKI ADUNI VENTURES.

Do you have any questions regarding battery health, warranty, or delivery to your location?

Reply directly to this chat to complete your order via MoMo, or click below to finish checkout.`}
                </div>
                <div className="text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Category: <strong>Marketing</strong> • Language: <strong>English (US)</strong></span>
                  <span className="text-blue-300">Button: URL &rarr; https://www.akiaduniventures.com/cart</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowTemplateGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
