import React from "react";
import Link from "next/link";
import { formatGHS } from "@/lib/utils";
import { PRODUCTS, INITIAL_QR_CAMPAIGNS } from "@/lib/mock-data";
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  QrCode,
  ArrowUpRight,
  Plus,
  Package,
  Layers,
} from "lucide-react";

export default function AdminDashboardPage() {
  // Aggregate stats
  const totalVariants = PRODUCTS.reduce((acc, p) => acc + p.variants.length, 0);
  const lowStockVariants = PRODUCTS.flatMap((p) =>
    p.variants.filter((v) => v.stock_quantity <= 5).map((v) => ({ ...v, productTitle: p.title }))
  );
  const totalQRScans = INITIAL_QR_CAMPAIGNS.reduce((acc, qr) => acc + qr.scans_count, 0);
  const totalQROrders = INITIAL_QR_CAMPAIGNS.reduce((acc, qr) => acc + qr.orders_count, 0);
  const totalQRRevenue = INITIAL_QR_CAMPAIGNS.reduce((acc, qr) => acc + qr.total_revenue, 0);

  const mockRecentOrders = [
    {
      id: "TH-2026-9042",
      customer: "Kofi Boateng",
      phone: "0244 881 290",
      items: "iPhone 15 Pro Max 256GB (Natural Titanium)",
      amount: 14800,
      fulfillment: "Courier (East Legon)",
      status: "processing",
    },
    {
      id: "TH-2026-9041",
      customer: "Ama Serwaa",
      phone: "0501 329 881",
      items: "iPhone 13 UK-Used (Midnight) + Oraimo FreePods",
      amount: 5620,
      fulfillment: "Shop Pickup (Aki Enterprise)",
      status: "ready_for_pickup",
    },
    {
      id: "TH-2026-9040",
      customer: "Emmanuel Doe",
      phone: "0202 991 402",
      items: "Anker 20,000mAh Power Bank (x2)",
      amount: 1300,
      fulfillment: "Courier (Kumasi)",
      status: "out_for_delivery",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Operations Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time business performance for Aki Enterprise (Ghana)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-semibold text-xs transition"
          >
            <Layers className="w-4 h-4 text-orange-400" />
            <span>Quick Stock-In</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">Total Sales (M-T-D)</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{formatGHS(143550)}</p>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% from last month
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
          <p className="text-2xl font-black text-white mt-3">14 Active</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            4 for shop pickup • 10 dispatched
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
          <p className="text-2xl font-black text-amber-400 mt-3">{lowStockVariants.length} Items</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Needs restock in shop showcase
          </span>
        </div>

        {/* QR Scan Performance */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">In-Store QR Scans</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{totalQRScans} Scans</p>
          <span className="text-[11px] text-purple-400 font-medium mt-1 block">
            {totalQROrders} attributed orders ({formatGHS(totalQRRevenue)})
          </span>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>Recent Orders</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
            >
              View All Orders →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {mockRecentOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-orange-400">{ord.id}</span>
                    <span className="text-gray-300 font-medium">{ord.customer}</span>
                  </div>
                  <p className="text-gray-400 text-[11px] mt-0.5">{ord.items}</p>
                  <p className="text-gray-500 text-[10px]">{ord.fulfillment}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                  <span className="font-extrabold text-white text-sm">
                    {formatGHS(ord.amount)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {ord.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Watchlist</span>
            </h3>
            <Link
              href="/admin/inventory"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Restock →
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockVariants.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-white line-clamp-1">{v.productTitle}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-gray-400 text-[11px]">
                    <span className="font-mono text-orange-400">{v.sku}</span>
                    <span>• {v.storage || v.color}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/30">
                    {v.stock_quantity} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
