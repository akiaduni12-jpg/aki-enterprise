"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatGHS } from "@/lib/utils";
import { getCustomerOrders, recordCustomerOrder } from "@/lib/customer-store";
import { Order } from "@/types/ecommerce";
import { ChevronLeft, ArrowRight, Package, Search, ShoppingBag, Truck } from "lucide-react";

export default function MyOrdersPage() {
  const [filter, setFilter] = useState<"All" | "Processing" | "Delivered">("All");
  const [customerOrders, setCustomerOrders] = useState<Partial<Order>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  useEffect(() => {
    const saved = getCustomerOrders();
    if (saved && saved.length > 0) {
      setCustomerOrders(saved);
    }
  }, []);

  // Live cloud search by phone or order number from database
  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchFeedback(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok && data.success && data.order) {
        const foundOrder: Partial<Order> = {
          order_number: data.order.order_number,
          order_status: data.order.order_status,
          created_at: data.order.created_at,
          total_amount: data.order.total_amount,
          payment_status: data.order.payment_status,
          payment_method: data.order.payment_method,
          fulfillment_type: data.order.fulfillment_type,
          customer: {
            full_name: data.order.customer_name,
            phone: data.order.customer_phone,
            email: data.order.customer_email,
            delivery_address: data.order.delivery_address,
            city: data.order.delivery_city,
          },
          items: data.order.items || [],
        };

        // Save into local store so it persists on this device
        recordCustomerOrder(foundOrder);
        setCustomerOrders(getCustomerOrders());
        setSearchFeedback(`Order ${foundOrder.order_number} loaded successfully!`);
        setSearchQuery("");
      } else {
        setSearchFeedback("No order found with that Order ID or Phone Number.");
      }
    } catch {
      setSearchFeedback("Unable to search orders at the moment. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Format saved customer orders into display list
  const formattedRealOrders = customerOrders.map((ord) => {
    const status =
      ord.order_status === "delivered"
        ? "Delivered"
        : ord.order_status === "cancelled"
        ? "Cancelled"
        : "Processing";

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
      : "Recent";

    const orderNum = ord.order_number || "ORD-PENDING";

    return {
      order_number: orderNum.startsWith("#") ? orderNum : `#${orderNum}`,
      raw_number: orderNum.replace("#", ""),
      created_at: dateStr,
      items_count: ord.items ? ord.items.reduce((acc, i) => acc + i.quantity, 0) : 1,
      total_amount: ord.total_amount || 0,
      order_status: status,
      status_color: statusColor,
    };
  });

  const filteredOrders = formattedRealOrders.filter((ord) => {
    if (filter === "All") return true;
    return ord.order_status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:text-black transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">My Orders</h1>
        </div>
        <Link
          href="/track"
          className="text-xs font-bold text-[#F26A00] hover:underline flex items-center gap-1"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Live Tracking</span>
        </Link>
      </div>

      {/* Cross-Device Cloud Lookup Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2">
        <label className="text-[11px] font-bold text-gray-700 block">
          Ordered on another phone or computer? Look up by Phone or Order ID:
        </label>
        <form onSubmit={handleSearchOrder} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. 0241234567 or ORD-2026-..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition disabled:opacity-50 shrink-0"
          >
            {isSearching ? "Searching..." : "Find"}
          </button>
        </form>
        {searchFeedback && (
          <p className="text-[11px] font-semibold text-orange-600 animate-in fade-in">
            {searchFeedback}
          </p>
        )}
      </div>

      {/* Filter Pills */}
      {formattedRealOrders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(["All", "Processing", "Delivered"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                filter === tab
                  ? "bg-[#F26A00] text-white shadow-md shadow-orange-500/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Order Cards List */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 space-y-3">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-sm text-gray-900">
              {formattedRealOrders.length === 0 ? "No orders found on this device" : `No ${filter} Orders`}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {formattedRealOrders.length === 0
                ? "When you order phones, chargers, or electronics with MoMo or Cash on Delivery, your receipts and order updates show up here automatically."
                : "You don't have any orders with this status right now."}
            </p>
            {formattedRealOrders.length === 0 && (
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F26A00] text-white text-xs font-bold shadow-md hover:bg-[#d95e00] transition active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Start Shopping</span>
                </Link>
              </div>
            )}
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
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold border ${ord.status_color}`}>
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
                  href={`/track?order=${ord.raw_number}`}
                  className="px-4 py-1.5 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white text-xs font-bold shadow-xs flex items-center gap-1 transition active:scale-95"
                >
                  <span>Track Delivery</span>
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
