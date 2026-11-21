"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatGHS } from "@/lib/utils";
import { lookupOrder } from "@/lib/customer-store";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  PhoneCall,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderQuery.trim();
    if (!query) return;

    setLoading(true);
    setSearched(true);
    setNotFound(false);

    // 1. Try local customer store first
    const localMatch = lookupOrder(query);
    if (localMatch) {
      setOrderResult({
        orderNumber: localMatch.order_number,
        status: localMatch.order_status || "processing",
        date: localMatch.created_at
          ? new Date(localMatch.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Today",
        customer: localMatch.customer?.full_name || "Customer",
        phone: localMatch.customer?.phone || "",
        fulfillment:
          localMatch.fulfillment_type === "shop_pickup"
            ? "In-Store Pickup (Aki Enterprise - Miaso, Kwahu East)"
            : `Courier Delivery to ${localMatch.customer?.city || "Ghana"}`,
        items: localMatch.items || [],
        total: localMatch.total_amount || 0,
        paymentStatus: localMatch.payment_status || "paid",
        paystackReference: localMatch.paystack_reference,
      });
      setLoading(false);
      return;
    }

    // 2. Try API lookup
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok && data.success && data.order) {
        const o = data.order;
        setOrderResult({
          orderNumber: o.order_number,
          status: o.order_status || "processing",
          date: o.created_at
            ? new Date(o.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recent",
          customer: o.customer_name || "Customer",
          phone: o.customer_phone || "",
          fulfillment:
            o.fulfillment_type === "shop_pickup"
              ? "In-Store Pickup (Aki Enterprise - Miaso, Kwahu East)"
              : `Courier Delivery to ${o.delivery_city || "Ghana"}`,
          items: o.items || [],
          total: o.total_amount || 0,
          paymentStatus: o.payment_status || "paid",
          paystackReference: o.paystack_reference,
        });
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-orange-600 mb-3">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Enter your official order ID (e.g. AKI-2026-...) or registered phone number to track live status.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="e.g. AKI-2026-4819 or 0551243372"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:border-orange-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#F26A00] hover:bg-[#d95e00] text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
          >
            {loading ? "Searching..." : "Track Status"}
          </button>
        </div>
      </form>

      {/* Not Found Notice */}
      {searched && notFound && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No order found matching &quot;{orderQuery}&quot;</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Please double-check your order number or phone number. If you just placed your order, it may take a few moments to synchronize.
          </p>
          <a
            href="https://wa.me/233551243372"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp (0551243372)</span>
          </a>
        </div>
      )}

      {/* Result Card */}
      {searched && orderResult && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-400">Official Order Number</span>
              <h2 className="text-xl font-bold text-slate-900 font-mono">
                {orderResult.orderNumber}
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span className="capitalize">Status: {orderResult.status.replace(/_/g, " ")}</span>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="py-2">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-900">Received</span>
              </div>

              <div className="space-y-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    orderResult.status === "processing" ||
                    orderResult.status === "ready_for_pickup" ||
                    orderResult.status === "out_for_delivery" ||
                    orderResult.status === "delivered"
                      ? "bg-[#F26A00] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900">Packaging</span>
              </div>

              <div
                className={`space-y-1.5 ${
                  orderResult.status === "out_for_delivery" || orderResult.status === "delivered"
                    ? ""
                    : "opacity-40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    orderResult.status === "out_for_delivery" || orderResult.status === "delivered"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-700">Dispatched</span>
              </div>

              <div className={`space-y-1.5 ${orderResult.status === "delivered" ? "" : "opacity-40"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    orderResult.status === "delivered"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Store className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-700">Delivered</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Customer:</span>
              <span className="font-semibold text-gray-900">
                {orderResult.customer} ({orderResult.phone})
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Fulfillment:</span>
              <span className="font-semibold text-gray-900">{orderResult.fulfillment}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Order Date:</span>
              <span className="font-semibold text-gray-900">{orderResult.date}</span>
            </div>
            {orderResult.paystackReference && (
              <div className="flex justify-between text-gray-600">
                <span>Paystack Reference:</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {orderResult.paystackReference}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
              <span>Total Amount:</span>
              <span className="text-[#F26A00] font-black text-base">
                {formatGHS(orderResult.total)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://wa.me/233551243372?text=${encodeURIComponent(
                `Hello Aki Enterprise, I am tracking my order ${orderResult.orderNumber}. Could you provide an update on dispatch?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Need help? Chat with Store Staff on WhatsApp (0551243372)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
