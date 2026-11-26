"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatGHS } from "@/lib/utils";
import { getStoredProducts } from "@/lib/catalog-store";
import { Product, ProductVariant } from "@/types/ecommerce";
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  QrCode,
  ArrowUpRight,
  Plus,
  Package,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle2,
  Truck,
  ExternalLink,
  Users,
  MessageCircle,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

interface LiveOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  fulfillment_type: string;
  delivery_city?: string;
  created_at: string;
  items?: Array<{
    product_title: string;
    variant_sku?: string;
    quantity: number;
    unit_price: number;
    image_url?: string;
  }>;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live products from store
      const prods = getStoredProducts();
      setProducts(prods);

      // 2. Fetch live orders from Supabase API
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Dashboard data load notice:", err);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate dynamic metrics
  const totalPaidRevenue = orders
    .filter((o) => o.payment_status === "paid" || o.order_status === "delivered" || o.order_status === "completed")
    .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.order_status === "pending_payment" || o.order_status === "processing"
  ).length;

  const inTransitCount = orders.filter(
    (o) => o.order_status === "out_for_delivery" || o.order_status === "ready_for_pickup"
  ).length;

  // Flatten all variants from active products
  const allVariants: (ProductVariant & { productTitle: string; productImage?: string })[] =
    products.flatMap((p) =>
      p.variants.map((v) => ({
        ...v,
        productTitle: p.title,
        productImage: p.images?.[0],
      }))
    );

  const lowStockVariants = allVariants.filter((v) => v.stock_quantity <= 5);

  const recentOrders = orders.slice(0, 5);

  // Top products (most variants or featured)
  const topProducts = products.filter((p) => p.featured || p.best_seller).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* ==================================================================== */}
      {/* MOBILE SCREEN: Total Sales Banner, Orders Overview & Top Products */}
      {/* ==================================================================== */}
      <div className="md:hidden space-y-5">
        {/* Total Sales Orange Banner Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#FF8A24] via-[#F26A00] to-[#EA580C] text-white p-6 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-orange-100 font-semibold uppercase tracking-wider">
                <span>Total Live Revenue</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {formatGHS(totalPaidRevenue || 0)}
              </h2>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold mt-1">
                <span>{orders.length} Total Orders</span>
              </div>
            </div>

            {/* Visual Bar Chart Graphic */}
            <div className="flex items-end gap-1.5 h-14 pr-2">
              <div className="w-2.5 h-6 bg-white/40 rounded-t-sm" />
              <div className="w-2.5 h-8 bg-white/60 rounded-t-sm" />
              <div className="w-2.5 h-11 bg-white/80 rounded-t-sm" />
              <div className="w-2.5 h-14 bg-white rounded-t-sm shadow-sm" />
            </div>
          </div>
        </div>

        {/* WhatsApp Commerce Engine Quick Access */}
        <Link
          href="/admin/whatsapp"
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/40 hover:border-emerald-500 flex items-center justify-between transition group shadow-lg shadow-emerald-950/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-emerald-500/30 shadow-md">
              <img src="/images/social/whatsapp.jpg" alt="WhatsApp" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">WhatsApp Engine</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Customer chats, MoMo &amp; waybill cards</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
        </Link>

        {/* Orders Overview: 2 Cards Side-by-Side */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
            Orders Overview
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/orders"
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 hover:border-slate-700 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-white">{orders.length}</p>
                <p className="text-[11px] text-gray-400 font-medium">Total Orders</p>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 hover:border-slate-700 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-white">{pendingOrdersCount}</p>
                <p className="text-[11px] text-gray-400 font-medium">Pending Action</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Top Products Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Featured Catalog Items
            </h3>
            <Link href="/admin/products" className="text-xs text-orange-400 font-bold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {topProducts.map((p) => (
              <Link
                key={p.id}
                href="/admin/products"
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white line-clamp-1">{p.title}</h4>
                    <p className="text-[11px] text-orange-400 font-bold">{formatGHS(p.base_price)}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DESKTOP HEADER & LIVE SYNC STATUS */}
      {/* ==================================================================== */}
      <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Supabase Database Connected
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Synced: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Live Operations Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time business performance, revenue, orders &amp; inventory for Aki Enterprise (Ghana).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-semibold text-xs transition"
            title="Refresh live metrics from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/whatsapp"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Engine</span>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-semibold text-xs transition"
          >
            <Layers className="w-4 h-4 text-orange-400" />
            <span>Inventory</span>
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-semibold text-xs transition"
          >
            <Users className="w-4 h-4 text-orange-400" />
            <span>Customers</span>
          </Link>
        </div>
      </div>

      {/* WhatsApp Commerce Engine Highlight Banner */}
      <div className="hidden md:flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-950 border border-emerald-500/30 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-emerald-500/40 shadow-md">
            <img src="/images/social/whatsapp.jpg" alt="WhatsApp" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">WhatsApp Commerce Engine Active</h3>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Meta API
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Chat live with customers, send 1-click product cards from your catalog, request MoMo payments, and issue bus waybills.
            </p>
          </div>
        </div>

        <Link
          href="/admin/whatsapp"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition shrink-0"
        >
          <span>Open WhatsApp Hub</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ==================================================================== */}
      {/* 4 SUMMARY STAT CARDS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">Total Sales Revenue</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{formatGHS(totalPaidRevenue)}</p>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> From paid checkout transactions
          </span>
        </div>

        {/* Active Orders */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">Orders In Pipeline</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{orders.length} Total</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {pendingOrdersCount} pending • {inTransitCount} in fulfillment
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">Low Stock Alerts</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-3">{lowStockVariants.length} SKUs</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Stock level &le; 5 units remaining
          </span>
        </div>

        {/* Catalog Inventory Count */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">Live Catalog SKUs</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{allVariants.length} Variants</p>
          <span className="text-[11px] text-purple-400 font-medium mt-1 block">
            Across {products.length} product lines
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TWO COLUMN SECTION: RECENT ORDERS & LOW STOCK TABLE */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Recent Orders */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>Live Store Orders ({orders.length})</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <span>Manage All</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-orange-500" />
              <p className="font-semibold text-gray-400">No customer orders recorded yet.</p>
              <p className="text-[11px] mt-1 text-gray-500">
                Orders made on the storefront will appear here live.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentOrders.map((ord) => {
                const itemsSummary = ord.items && ord.items.length > 0
                  ? ord.items.map((i) => `${i.product_title} (${i.quantity}x)`).join(", ")
                  : "Order Items";

                return (
                  <div key={ord.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-orange-400">{ord.order_number}</span>
                        <span className="text-gray-300 font-medium">{ord.customer_name}</span>
                        <span className="text-gray-500 font-mono text-[10px]">{ord.customer_phone}</span>
                        {ord.customer_phone && (
                          <Link
                            href={`/admin/whatsapp?phone=${ord.customer_phone.replace(/\D/g, "")}&name=${encodeURIComponent(ord.customer_name)}`}
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold transition"
                            title="Open WhatsApp chat with customer"
                          >
                            <WhatsAppIcon className="w-2.5 h-2.5" />
                            <span>Chat</span>
                          </Link>
                        )}
                      </div>
                      <p className="text-gray-400 text-[11px] mt-0.5 line-clamp-1">{itemsSummary}</p>
                      <p className="text-gray-500 text-[10px] capitalize">
                        {ord.fulfillment_type.replace(/_/g, " ")} • {ord.payment_method.replace(/_/g, " ")}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                      <span className="font-extrabold text-white text-sm">
                        {formatGHS(ord.total_amount)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ord.payment_status === "paid"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                      >
                        {ord.order_status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Low Stock Watchlist */}
        <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Alerts ({lowStockVariants.length})</span>
            </h3>
            <Link
              href="/admin/inventory"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Restock →
            </Link>
          </div>

          {lowStockVariants.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
              <p className="font-semibold text-gray-400">All inventory items healthy!</p>
              <p className="text-[11px] mt-1 text-gray-500">No SKUs below 5 units threshold.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockVariants.slice(0, 6).map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    {v.productImage && (
                      <div className="relative w-9 h-9 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.productImage}
                          alt={v.productTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white line-clamp-1">{v.productTitle}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-gray-400 text-[11px]">
                        <span className="font-mono text-orange-400">{v.sku}</span>
                        <span>• {v.storage || v.color}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/30">
                      {v.stock_quantity} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
