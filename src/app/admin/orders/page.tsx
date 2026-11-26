"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatGHS } from "@/lib/utils";
import { OrderStatus } from "@/types/ecommerce";
import { getCustomerOrders, recordCustomerOrder } from "@/lib/customer-store";
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Clock,
  Truck,
  Store,
  Phone,
  Filter,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

interface AdminOrderDisplay {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  itemsSummary: string;
  itemsDetail?: any[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  fulfillment: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  paystackReference?: string;
  deliveryAddress?: string;
}

const INITIAL_DEMO_ORDERS: AdminOrderDisplay[] = [
  {
    id: "demo-1",
    orderNumber: "AKI-2026-9042",
    customerName: "Kofi Boateng",
    phone: "0244 881 290",
    email: "kofi.b@gmail.com",
    date: "Nov 20, 2026 • 15:42",
    itemsSummary: "Apple iPhone 15 Pro Max (256GB - Natural Titanium) × 1",
    subtotal: 14805,
    deliveryFee: 30,
    total: 14835,
    fulfillment: "Courier Delivery (East Legon, Accra)",
    status: "processing",
    paymentMethod: "Paystack MTN MoMo",
    paymentStatus: "paid",
    paystackReference: "ref_aki_9042_1732117320000",
    deliveryAddress: "House 14, Boundary Road, East Legon, Accra",
  },
  {
    id: "demo-2",
    orderNumber: "AKI-2026-9041",
    customerName: "Ama Serwaa",
    phone: "0501 329 881",
    email: "ama.s@yahoo.com",
    date: "Nov 20, 2026 • 14:15",
    itemsSummary: "Apple iPhone 13 UK-Used (Midnight 128GB) × 1, Oraimo FreePods 4 × 1",
    subtotal: 5620,
    deliveryFee: 0,
    total: 5620,
    fulfillment: "Shop Pickup (Aki Enterprise Counter - Miaso)",
    status: "ready_for_pickup",
    paymentMethod: "Pay at Shop Counter",
    paymentStatus: "pending",
    deliveryAddress: "Miaso, Kwahu East, Ghana",
  },
  {
    id: "demo-3",
    orderNumber: "AKI-2026-9040",
    customerName: "Emmanuel Doe",
    phone: "0202 991 402",
    email: "edoe@outlook.com",
    date: "Nov 20, 2026 • 11:30",
    itemsSummary: "Anker 20,000mAh Power Bank (Phantom Black) × 2",
    subtotal: 1330,
    deliveryFee: 30,
    total: 1360,
    fulfillment: "Courier Delivery (Kumasi Adum)",
    status: "out_for_delivery",
    paymentMethod: "Paystack Telecel Cash",
    paymentStatus: "paid",
    paystackReference: "ref_aki_9040_1732102200000",
    deliveryAddress: "Near Central Market, Adum, Kumasi",
  },
  {
    id: "demo-4",
    orderNumber: "AKI-2026-9038",
    customerName: "Dr. Selorm Mensah",
    phone: "0243 002 993",
    email: "selorm@clinic.gh",
    date: "Nov 19, 2026 • 17:05",
    itemsSummary: "Samsung Galaxy S24 Ultra (Titanium Gray 256GB) × 1",
    subtotal: 14200,
    deliveryFee: 0,
    total: 14200,
    fulfillment: "Shop Pickup (Aki Enterprise Counter - Miaso)",
    status: "delivered",
    paymentMethod: "Paystack Visa/Mastercard",
    paymentStatus: "paid",
    paystackReference: "ref_aki_9038_1732035900000",
    deliveryAddress: "Miaso, Kwahu East, Ghana",
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderDisplay[]>(INITIAL_DEMO_ORDERS);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDisplay | null>(null);
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  // Load orders from API and Local Customer Store
  const loadOrders = async () => {
    let combined: AdminOrderDisplay[] = [...INITIAL_DEMO_ORDERS];

    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        const apiMapped: AdminOrderDisplay[] = data.orders.map((o: any) => ({
          id: o.id || o.order_number,
          orderNumber: o.order_number,
          customerName: o.customer_name || "Customer",
          phone: o.customer_phone || "",
          email: o.customer_email || "",
          date: o.created_at
            ? new Date(o.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recent",
          itemsSummary: Array.isArray(o.items) && o.items.length > 0
            ? o.items.map((i: any) => `${i.quantity}× ${i.product_title}`).join(", ")
            : "Products Ordered",
          itemsDetail: o.items || [],
          subtotal: Number(o.subtotal) || 0,
          deliveryFee: Number(o.delivery_fee) || 0,
          total: Number(o.total_amount) || 0,
          fulfillment:
            o.fulfillment_type === "shop_pickup"
              ? "Shop Pickup (Aki Enterprise - Miaso)"
              : `Courier Delivery (${o.delivery_city || "Ghana"})`,
          status: (o.order_status as OrderStatus) || "processing",
          paymentMethod: o.payment_method?.replace(/_/g, " ").toUpperCase() || "Paystack",
          paymentStatus: o.payment_status || "paid",
          paystackReference: o.paystack_reference,
          deliveryAddress: o.delivery_address,
        }));

        // Merge by orderNumber to avoid duplicates
        const seen = new Set(apiMapped.map((x) => x.orderNumber));
        combined = [...apiMapped, ...INITIAL_DEMO_ORDERS.filter((x) => !seen.has(x.orderNumber))];
      }
    } catch (err) {
      console.warn("Could not load from API, reading localStorage fallback:", err);
    }

    // Also merge any browser-stored orders
    const local = getCustomerOrders();
    if (local && local.length > 0) {
      const existing = new Set(combined.map((x) => x.orderNumber));
      const localMapped: AdminOrderDisplay[] = local
        .filter((l) => l.order_number && !existing.has(l.order_number))
        .map((l: any) => ({
          id: l.order_number,
          orderNumber: l.order_number,
          customerName: l.customer?.full_name || "Customer",
          phone: l.customer?.phone || "",
          email: l.customer?.email || "",
          date: l.created_at
            ? new Date(l.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Today",
          itemsSummary: Array.isArray(l.items)
            ? l.items.map((i: any) => `${i.quantity}× ${i.product_title}`).join(", ")
            : "Electronics Order",
          itemsDetail: l.items || [],
          subtotal: Number(l.subtotal) || 0,
          deliveryFee: Number(l.delivery_fee) || 0,
          total: Number(l.total_amount) || 0,
          fulfillment:
            l.fulfillment_type === "shop_pickup"
              ? "Shop Pickup (Aki Enterprise - Miaso)"
              : `Courier Delivery to ${l.customer?.city || "Ghana"}`,
          status: (l.order_status as OrderStatus) || "processing",
          paymentMethod: l.payment_method?.replace(/_/g, " ").toUpperCase() || "PAYSTACK MOMO",
          paymentStatus: l.payment_status || "paid",
          paystackReference: l.paystack_reference,
          deliveryAddress: l.customer?.delivery_address,
        }));

      combined = [...localMapped, ...combined];
    }

    setOrders(combined);
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener("orders_updated", loadOrders);
    return () => window.removeEventListener("orders_updated", loadOrders);
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    // 1. Update UI optimistically
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    // 2. Persist to API
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: newStatus }),
      });
    } catch (e) {
      console.warn("Could not patch status to API:", e);
    }

    // 3. Update localStorage copy if present
    const local = getCustomerOrders();
    const match = local.find((o) => o.order_number === orderId);
    if (match) {
      match.order_status = newStatus;
      recordCustomerOrder(match);
    }
  };

  // Live Paystack Verification from Admin
  const handleVerifyPaystack = async (order: AdminOrderDisplay) => {
    if (!order.paystackReference) return;
    setVerifyingRef(order.paystackReference);
    setVerifyMessage(null);

    try {
      const res = await fetch(
        `/api/orders/verify?reference=${encodeURIComponent(
          order.paystackReference
        )}&order=${encodeURIComponent(order.orderNumber)}`
      );
      const data = await res.json();

      if (data.success && data.verified) {
        setVerifyMessage({
          id: order.id,
          text: `Verified via Paystack! (GH₵ ${data.payment?.amount || order.total} - ${data.payment?.channel || "MoMo"})`,
          ok: true,
        });

        // Mark as paid
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, paymentStatus: "paid" } : o
          )
        );
      } else {
        setVerifyMessage({
          id: order.id,
          text: `Paystack: ${data.error || "Payment not completed"}`,
          ok: false,
        });
      }
    } catch (err: any) {
      setVerifyMessage({
        id: order.id,
        text: `Error verifying: ${err.message}`,
        ok: false,
      });
    } finally {
      setVerifyingRef(null);
      setTimeout(() => setVerifyMessage(null), 5000);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery.trim()) ||
      (o.paystackReference && o.paystackReference.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "ready_for_pickup":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "out_for_delivery":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "delivered":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-800 text-gray-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-[#F26A00]">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Order Operations &amp; Paystack Fulfillment
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time sales, live Paystack transaction verification, dispatch logistics, and customer communications.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-bold transition w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, phone, or Paystack ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-500 focus:outline-hidden focus:border-[#F26A00]"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {[
            { key: "all", label: "All Orders" },
            { key: "processing", label: "Processing" },
            { key: "ready_for_pickup", label: "Ready for Pickup" },
            { key: "out_for_delivery", label: "Out for Delivery" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ].map((pill) => (
            <button
              key={pill.key}
              onClick={() => setStatusFilter(pill.key)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                statusFilter === pill.key
                  ? "bg-[#F26A00] text-white shadow-md shadow-orange-600/30"
                  : "bg-slate-950 border border-slate-800 text-gray-400 hover:text-white"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl">
            <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-300">No orders found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-sm"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-black text-base text-orange-400">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-gray-400">• {order.date}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                  {order.paymentStatus === "paid" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Payment Verified</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Payment Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-gray-200 font-semibold transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-orange-400" />
                    <span>View Details</span>
                  </button>

                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                    className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-orange-500 font-semibold"
                  >
                    <option value="pending_payment">Pending Payment</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* 3-Column Content Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Column 1: Customer */}
                <div className="space-y-1.5">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Customer Info
                  </span>
                  <p className="font-bold text-white text-sm">{order.customerName}</p>
                  <div className="flex flex-wrap items-center gap-2 text-gray-300">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-orange-400" />
                      <span>{order.phone}</span>
                    </span>
                    <Link
                      href={`/admin/whatsapp?phone=${order.phone.replace(/\D/g, "")}&name=${encodeURIComponent(order.customerName)}`}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition shadow-xs"
                      title="Open chat in Admin WhatsApp Engine"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>WhatsApp Chat</span>
                    </Link>
                  </div>
                  {order.email && <p className="text-gray-500 text-[11px] truncate">{order.email}</p>}
                  {order.deliveryAddress && (
                    <p className="text-gray-400 text-[11px] mt-1 line-clamp-2">
                      📍 {order.deliveryAddress}
                    </p>
                  )}
                </div>

                {/* Column 2: Items & Paystack Reference */}
                <div className="space-y-1.5">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Items &amp; Paystack Reference
                  </span>
                  <p className="text-gray-200 leading-relaxed font-medium line-clamp-2">
                    {order.itemsSummary}
                  </p>
                  <div className="pt-1 space-y-1">
                    <p className="text-[11px] text-gray-400">
                      Payment Channel: <strong className="text-emerald-400">{order.paymentMethod}</strong>
                    </p>
                    {order.paystackReference ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-gray-300 truncate max-w-[170px]">
                          {order.paystackReference}
                        </span>
                        <button
                          onClick={() => handleVerifyPaystack(order)}
                          disabled={verifyingRef === order.paystackReference}
                          className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1 transition"
                          title="Verify live on Paystack API"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>
                            {verifyingRef === order.paystackReference ? "Verifying..." : "Verify"}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-500">In-Store Manual Payment</span>
                    )}

                    {/* Verification result alert */}
                    {verifyMessage && verifyMessage.id === order.id && (
                      <p
                        className={`text-[11px] font-bold mt-1 ${
                          verifyMessage.ok ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {verifyMessage.text}
                      </p>
                    )}
                  </div>
                </div>

                {/* Column 3: Fulfillment & Total */}
                <div className="space-y-1.5 md:text-right">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Fulfillment &amp; Total
                  </span>
                  <p className="text-gray-300 font-medium">{order.fulfillment}</p>
                  <p className="text-xl font-black text-orange-400 pt-1">
                    {formatGHS(order.total)}
                  </p>
                  {order.deliveryFee > 0 ? (
                    <span className="text-[10px] text-gray-500 block">
                      Incl. {formatGHS(order.deliveryFee)} delivery
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold block">
                      Free Nationwide Delivery
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-Over Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs no-print"
            onClick={() => setSelectedOrder(null)}
          />
          <div id="printable-invoice" className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative w-36 h-9 shrink-0">
                  <Image
                    src="/icons/logo-store.webp"
                    alt="Aki Enterprise"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="border-l border-slate-800 pl-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Official Receipt
                  </span>
                  <h3 className="text-sm font-black text-white font-mono">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl bg-slate-900 text-gray-400 hover:text-white transition no-print"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Fulfillment Breakdown */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-gray-400 font-bold block">Customer</span>
                <p className="text-white font-bold">{selectedOrder.customerName}</p>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-gray-300">{selectedOrder.phone}</p>
                  <Link
                    href={`/admin/whatsapp?phone=${selectedOrder.phone.replace(/\D/g, "")}&name=${encodeURIComponent(selectedOrder.customerName)}`}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </Link>
                </div>
                {selectedOrder.email && <p className="text-gray-500 truncate">{selectedOrder.email}</p>}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-gray-400 font-bold block">Fulfillment</span>
                <p className="text-white font-bold">{selectedOrder.fulfillment}</p>
                {selectedOrder.deliveryAddress && (
                  <p className="text-gray-300 text-[11px]">{selectedOrder.deliveryAddress}</p>
                )}
              </div>
            </div>

            {/* Paystack Payment Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-300">Paystack Transaction</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedOrder.paymentStatus === "paid"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <p className="text-gray-400">
                Channel: <strong className="text-white">{selectedOrder.paymentMethod}</strong>
              </p>
              {selectedOrder.paystackReference && (
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-xs text-orange-400">
                    Ref: {selectedOrder.paystackReference}
                  </span>
                  <button
                    onClick={() => handleVerifyPaystack(selectedOrder)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                  >
                    Verify on Paystack
                  </button>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-gray-300 uppercase tracking-wider text-[10px]">
                Items in this Order
              </h4>
              <div className="divide-y divide-slate-800 border-t border-b border-slate-800 py-1">
                {selectedOrder.itemsDetail && selectedOrder.itemsDetail.length > 0 ? (
                  selectedOrder.itemsDetail.map((item: any, idx: number) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{item.product_title}</p>
                        <p className="text-[10px] text-gray-400">
                          Qty: {item.quantity} {item.variant_sku && `• SKU: ${item.variant_sku}`}
                        </p>
                      </div>
                      <span className="font-bold text-orange-400">
                        {formatGHS(item.total_price || item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-gray-400">{selectedOrder.itemsSummary}</p>
                )}
              </div>
            </div>

            {/* Total Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="font-bold text-gray-200">{formatGHS(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-200">
                  {selectedOrder.deliveryFee === 0 ? "Free" : formatGHS(selectedOrder.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-orange-400 font-mono text-base">
                  {formatGHS(selectedOrder.total)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold text-xs transition"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
