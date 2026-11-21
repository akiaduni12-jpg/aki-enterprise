"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatGHS } from "@/lib/utils";
import { getCustomerOrders } from "@/lib/customer-store";
import { Order } from "@/types/ecommerce";
import { ChevronLeft, ArrowRight, Package, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function MyOrdersPage() {
  const [filter, setFilter] = useState<"All" | "Processing" | "Delivered" | "Cancelled">("All");
  const [customerOrders, setCustomerOrders] = useState<Partial<Order>[]>([]);

  // Default demo orders matching Screen 8 mockup perfectly
  const DEMO_ORDERS = [
    {
      order_number: "#AKI-2025-1047",
      created_at: "16 Nov, 2025",
      items_count: 2,
      total_amount: 24999,
      order_status: "Delivered",
      status_color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    {
      order_number: "#AKI-2025-1046",
      created_at: "14 Nov, 2025",
      items_count: 1,
      total_amount: 7499,
      order_status: "Processing",
      status_color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      order_number: "#AKI-2025-1045",
      created_at: "12 Nov, 2025",
      items_count: 1,
      total_amount: 4999,
      order_status: "Cancelled",
      status_color: "bg-gray-100 text-gray-600 border-gray-200",
    },
  ];

  useEffect(() => {
    const saved = getCustomerOrders();
    if (saved && saved.length > 0) {
      setCustomerOrders(saved);
    }
  }, []);

  // Format saved customer orders into display list
  const formattedRealOrders = customerOrders.map((ord) => {
    const status = ord.order_status === "delivered" ? "Delivered" : ord.order_status === "cancelled" ? "Cancelled" : "Processing";
    const statusColor =
      status === "Delivered"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : status === "Processing"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-gray-100 text-gray-600 border-gray-200";

    const dateStr = ord.created_at
      ? new Date(ord.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Today";

    return {
      order_number: ord.order_number?.startsWith("#") ? ord.order_number : `#${ord.order_number}`,
      created_at: dateStr,
      items_count: ord.items ? ord.items.reduce((acc, i) => acc + i.quantity, 0) : 1,
      total_amount: ord.total_amount || 0,
      order_status: status,
      status_color: statusColor,
    };
  });

  const allOrders = [...formattedRealOrders, ...DEMO_ORDERS];

  const filteredOrders = allOrders.filter((ord) => {
    if (filter === "All") return true;
    return ord.order_status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">
      {/* Top Header (Screen 8 Match) */}
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:text-black transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">My Orders</h1>
      </div>

      {/* Filter Pills (Screen 8 Match) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["All", "Processing", "Delivered"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
              filter === tab
                ? "bg-[#F26A00] text-white shadow-md shadow-orange-500/30"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Order Cards List (Screen 8 Match) */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 space-y-3">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-sm text-gray-900">No {filter} Orders</h3>
            <p className="text-xs text-gray-400">You don't have any orders with this status right now.</p>
          </div>
        ) : (
          filteredOrders.map((ord, idx) => (
            <div
              key={`${ord.order_number}-${idx}`}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs hover:border-orange-200 transition space-y-3"
            >
              {/* Order Top Row: Number & Status Badge */}
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 font-mono tracking-tight">
                  {ord.order_number}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-[11px] font-bold border ${ord.status_color}`}
                >
                  {ord.order_status}
                </span>
              </div>

              {/* Date & Items Count */}
              <p className="text-xs text-gray-400 font-medium">
                {ord.created_at} • {ord.items_count} {ord.items_count === 1 ? "item" : "items"}
              </p>

              {/* Bottom Row: Total & "View Details ->" */}
              <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                <span className="text-base font-black text-slate-900">
                  {formatGHS(ord.total_amount)}
                </span>

                <Link
                  href={`/track?order=${ord.order_number.replace("#", "")}`}
                  className="px-4 py-1.5 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white text-xs font-bold shadow-xs flex items-center gap-1 transition active:scale-95"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
