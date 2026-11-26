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
} from "lucide-react";

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
  items?: any[];
}

export default function AdminWhatsAppEnginePage() {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "orders" | "leads">("all");
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
            // If new incoming messages arrived, play sound
            if (prev.length > 0 && data.messages.length > prev.length) {
              const latestNew = data.messages.slice(prev.length);
              const hasIncoming = latestNew.some((m: StoredMessage) => m.direction === "incoming");
              if (hasIncoming) playChime();
            }
            return data.messages;
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
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(() => {});

    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(() => {});
  }, []);

  // Group messages into conversations
  const conversations: Conversation[] = useMemo(() => {
    const map = new Map<string, StoredMessage[]>();
    for (const msg of messages) {
      // Identify contact phone (either incoming 'from' or outgoing 'to')
      const contactPhone = msg.direction === "incoming" ? msg.from : msg.to;
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
      // Sort messages by timestamp asc
      const sorted = msgs.sort((a, b) => a.timestamp - b.timestamp);
      const last = sorted[sorted.length - 1];
      const known = knownNames[phone] || {
        name: `Customer ${phone.slice(-4)}`,
        city: "Ghana",
        tags: ["Active Inquiry"],
      };

      convList.push({
        phone,
        name: known.name,
        city: known.city,
        tags: known.tags,
        lastMessage: last.text || "[Attachment / Card]",
        lastMessageTime: last.timestamp,
        lastDirection: last.direction,
        unreadCount: sorted.filter((m) => m.direction === "incoming" && m.status !== "read").length,
        messages: sorted,
      });
    });

    // Sort conversations by latest message time desc
    return convList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  }, [messages]);

  // Set default selected phone
  useEffect(() => {
    if (!selectedPhone && conversations.length > 0) {
      setSelectedPhone(conversations[0].phone);
    }
  }, [conversations, selectedPhone]);

  // Current active conversation
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.phone === selectedPhone) || null;
  }, [conversations, selectedPhone]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterTab === "unread") return c.unreadCount > 0;
      if (filterTab === "orders")
        return c.tags.some((t) => t.toLowerCase().includes("order") || t.toLowerCase().includes("paid"));
      if (filterTab === "leads")
        return c.tags.some((t) => t.toLowerCase().includes("lead") || t.toLowerCase().includes("inquiry"));
      return true;
    });
  }, [conversations, searchQuery, filterTab]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // Send message handler
  const handleSendMessage = async (payloadOverride?: {
    text?: string;
    type?: any;
    metadata?: any;
  }) => {
    if (!selectedPhone) return;
    const textToSend = payloadOverride?.text !== undefined ? payloadOverride.text : inputText.trim();
    const typeToSend = payloadOverride?.type || "text";
    const metadataToSend = payloadOverride?.metadata;

    if (!textToSend && !metadataToSend) return;

    setIsSending(true);
    setInputText("");

    // Optimistic UI update
    const optimisticMsg: StoredMessage = {
      id: `temp-${Date.now()}`,
      from: "233551243372",
      to: selectedPhone,
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
          to: selectedPhone,
          text: textToSend,
          type: typeToSend,
          metadata: metadataToSend,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
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

  // Quick replies
  const handleQuickReply = (text: string) => {
    handleSendMessage({ text, type: "text" });
  };

  // Send Product Card
  const handleSendProductCard = (product: ProductItem) => {
    const productCard = {
      title: product.title,
      price: product.price,
      condition: product.condition || "Brand New (Factory Sealed)",
      specs: product.category?.name || "Original Storefront Item",
      warranty: "6 Months Warranty",
      imageUrl: product.image_url || "/icons/logo-icon.webp",
      slug: product.slug,
    };

    handleSendMessage({
      text: `📱 *${product.title}*\nPrice: GH₵ ${product.price.toLocaleString()}\nCondition: ${productCard.condition}\nLink: https://www.akiaduniventures.com/product/${product.slug}`,
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

  // Start New Chat
  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim()) return;

    let cleanPhone = newChatPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
      cleanPhone = "233" + cleanPhone.slice(1);
    }

    const greeting = newChatMessage.trim() || "Hello from AKI ADUNI VENTURES! How can we assist you today?";

    // Select this phone
    setSelectedPhone(cleanPhone);
    setShowNewChatModal(false);

    // Send greeting
    handleSendMessage({
      text: greeting,
      type: "text",
    });

    setNewChatPhone("");
    setNewChatName("");
    setNewChatMessage("");
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
    if (!selectedPhone) return [];
    const cleanCurrent = selectedPhone.replace(/\D/g, "").slice(-9);
    return orders.filter((o) => {
      const cleanOrderPhone = (o.customer_phone || "").replace(/\D/g, "");
      return cleanOrderPhone.endsWith(cleanCurrent);
    });
  }, [orders, selectedPhone]);

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-32px)] flex flex-col bg-slate-950 text-gray-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Engine Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight">
                WhatsApp Commerce Engine
              </h1>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Meta Cloud API Live
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Direct Sales, MoMo Requests &amp; Real-Time Customer Chat • +233 55 124 3372
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              soundEnabled
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
            className="p-2 rounded-xl bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 transition"
            title="Refresh conversations"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-orange-400" : ""}`} />
          </button>

          {/* Meta Templates Guide button */}
          <button
            onClick={() => setShowTemplateGuideModal(true)}
            className="px-3 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
            title="Create & manage Meta promotional templates"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Meta Templates</span>
          </button>

          {/* Broadcast button */}
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Broadcast</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: 3-column or 2-column flex */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= COLUMN 1: CONVERSATIONS LIST ================= */}
        <aside className="w-full sm:w-80 md:w-88 lg:w-96 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
          {/* Search & Filter */}
          <div className="p-3 border-b border-slate-800/80 space-y-2.5 bg-slate-900/40">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone, name or text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
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
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterTab === "all"
                    ? "bg-slate-800 text-white font-bold"
                    : "text-gray-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                All ({conversations.length})
              </button>
              <button
                onClick={() => setFilterTab("unread")}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                  filterTab === "unread"
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-gray-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                Unread
                {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-[9px] text-white flex items-center justify-center">
                    {conversations.filter((c) => c.unreadCount > 0).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterTab("orders")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterTab === "orders"
                    ? "bg-orange-600 text-white font-bold"
                    : "text-gray-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setFilterTab("leads")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterTab === "leads"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-gray-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                Leads
              </button>
            </div>
          </div>

          {/* Conversation list items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-600" />
                <p className="text-xs">No conversations match your filter.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.phone === selectedPhone;
                const formattedTime = new Date(conv.lastMessageTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <button
                    key={conv.phone}
                    onClick={() => setSelectedPhone(conv.phone)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition ${
                      isSelected
                        ? "bg-slate-800/90 border-l-4 border-emerald-500"
                        : "hover:bg-slate-900/60"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-linear-to-br from-emerald-600 to-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {conv.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white truncate max-w-[140px]">
                          {conv.name}
                        </span>
                        <span className="text-[10px] text-gray-400">{formattedTime}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 truncate">
                        {conv.lastDirection === "outgoing" && (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="truncate">{conv.lastMessage}</span>
                      </div>

                      {/* Phone & Tags */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-mono">
                          +{conv.phone}
                        </span>
                        <div className="flex items-center gap-1">
                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[10px] font-black text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                          {conv.tags.slice(0, 1).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-gray-300 border border-slate-700"
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
        </aside>

        {/* ================= COLUMN 2: ACTIVE CHAT CONSOLE ================= */}
        <main className="flex-1 flex flex-col bg-[#0b141a] relative min-w-0">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-black flex items-center justify-center shrink-0">
                    {activeConversation.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white truncate">
                        {activeConversation.name}
                      </h2>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                        +{activeConversation.phone}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate flex items-center gap-2">
                      <span>{activeConversation.city || "Ghana"}</span>
                      <span>•</span>
                      <span className="text-emerald-400">Online on WhatsApp</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Phone Call Link */}
                  <a
                    href={`tel:${activeConversation.phone}`}
                    className="p-2 rounded-xl bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 transition"
                    title="Direct Phone Call"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </a>

                  {/* Native WhatsApp Link */}
                  <a
                    href={`https://wa.me/${activeConversation.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
                    title="Open in WhatsApp Web App"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open WA</span>
                  </a>

                  {/* Toggle Right CRM Drawer */}
                  <button
                    onClick={() => setShowRightDrawer(!showRightDrawer)}
                    className={`p-2 rounded-xl transition ${
                      showRightDrawer
                        ? "bg-slate-800 text-orange-400"
                        : "bg-slate-800 text-gray-400 hover:text-white"
                    }`}
                    title="Toggle Customer & Orders Drawer"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message History Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-md ${
                          isOutgoing
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

                        {/* Main text message content */}
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.text}
                        </p>

                        {/* Timestamp & Delivery status */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-300/80">
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
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions Commerce Bar */}
              <div className="bg-slate-900 border-t border-slate-800 p-2.5 space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
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

                  <div className="h-4 w-px bg-slate-700 shrink-0" />

                  {/* Quick Reply: Shop Location */}
                  <button
                    onClick={() =>
                      handleQuickReply(
                        "📍 *Aki Aduni Ventures Store Locations:*\n1. Circle Shop: Near Vodafone / Siaka Phones, Circle, Accra.\n2. Miaso Hub: Miaso Main Junction.\nOpen Mon - Sat 8:00 AM - 7:00 PM. Nationwide bus delivery available!"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white text-[11px] shrink-0"
                  >
                    📍 Shop Location
                  </button>

                  {/* Quick Reply: MoMo Account */}
                  <button
                    onClick={() =>
                      handleQuickReply(
                        "💳 *Official MoMo Payment Details:*\n• MTN MoMo: *055 124 3372*\n• Account Name: *Aki Aduni Ventures*\n• Please send screenshot / transaction ID after payment for instant verification!"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white text-[11px] shrink-0"
                  >
                    💳 MoMo Account
                  </button>

                  {/* Quick Reply: Battery Health */}
                  <button
                    onClick={() =>
                      handleQuickReply(
                        "🔋 *Battery Health & Grade A Guarantee:*\nAll our UK-used iPhones have 85%+ original battery health, 100% genuine components, no iCloud lock, and come with a 6-month written warranty certificate!"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white text-[11px] shrink-0"
                  >
                    🔋 Battery Health
                  </button>
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type message to send to customer on WhatsApp... (Press Enter to Send)"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition shrink-0"
                  >
                    {isSending ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Select a Customer Conversation</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Choose an active WhatsApp chat from the left or click &quot;New Chat&quot; to send a direct message, product card, or MoMo payment request to any phone number.
              </p>
            </div>
          )}
        </main>

        {/* ================= COLUMN 3: CUSTOMER CRM & ORDERS DRAWER ================= */}
        {showRightDrawer && activeConversation && (
          <aside className="hidden lg:flex w-80 bg-slate-950 border-l border-slate-800 flex-col shrink-0 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-400" /> Customer CRM &amp; Orders
              </h3>
              <button
                onClick={() => setShowRightDrawer(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-emerald-600 to-teal-800 text-white font-black text-lg mx-auto flex items-center justify-center shadow-lg">
                {activeConversation.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{activeConversation.name}</h4>
                <p className="text-xs font-mono text-emerald-400">+{activeConversation.phone}</p>
                <p className="text-[11px] text-gray-400">{activeConversation.city || "Accra, Ghana"}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 justify-center pt-1">
                {activeConversation.tags.map((tag) => (
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
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                          ord.payment_status === "paid"
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

            {/* Quick Customer Notes */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-bold text-gray-300">Staff Notes</span>
              <p className="text-[11px] text-gray-400 italic">
                Prefers payment via MTN MoMo. Delivery address at Circle VIP station or Kumasi Asafo Bus.
              </p>
            </div>
          </aside>
        )}
      </div>

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
              {products
                .filter((p) => p.title.toLowerCase().includes(productSearch.toLowerCase()))
                .slice(0, 30)
                .map((product) => (
                  <div
                    key={product.id}
                    className="p-2.5 rounded-xl hover:bg-slate-800/70 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {product.image_url ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-800 relative">
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-gray-500">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <span className="text-emerald-400 font-extrabold">
                            GH₵ {product.price.toLocaleString()}
                          </span>
                          <span>•</span>
                          <span className="truncate">{product.condition || "Brand New"}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendProductCard(product)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition"
                    >
                      <span>Send Card</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        momoNetwork === net
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
                        label: `Hot Leads (${
                          conversations.filter((c) => c.tags.some((t) => t.toLowerCase().includes("lead"))).length
                        })`,
                      },
                      {
                        key: "buyers",
                        label: `Paid Buyers (${
                          conversations.filter((c) => c.tags.some((t) => t.toLowerCase().includes("paid"))).length
                        })`,
                      },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setBroadcastTarget(opt.key as any)}
                        className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                          broadcastTarget === opt.key
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
