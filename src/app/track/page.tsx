"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatGHS } from "@/lib/utils";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  PhoneCall,
} from "lucide-react";

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const mockTrackResult = {
    orderNumber: orderQuery || "TH-2026-4819",
    status: "processing",
    date: "November 20, 2026",
    customer: "Kwame Asante",
    fulfillment: "Courier Delivery (East Legon, Accra)",
    items: [
      { title: "Apple iPhone 15 Pro Max (256GB - Natural Titanium)", qty: 1, price: 14800 },
      { title: "Anker 20,000mAh 22.5W Power Bank", qty: 1, price: 650 },
    ],
    total: 15485,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderQuery.trim()) {
      setSearched(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-orange-600 mb-3">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Track Your Order</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Enter your Aki Enterprise order number (e.g. TH-2026-...) to view live delivery and preparation status.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="e.g. TH-2026-4819"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:border-orange-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Track Status
          </button>
        </div>
      </form>

      {/* Result Card */}
      {searched && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-400">Order Number</span>
              <h2 className="text-lg font-bold text-slate-900 font-mono">
                {mockTrackResult.orderNumber}
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Status: In Preparation</span>
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
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center mx-auto">
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-bold text-orange-600">Packaging</span>
              </div>

              <div className="space-y-1.5 opacity-40">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mx-auto">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-500">Dispatched</span>
              </div>

              <div className="space-y-1.5 opacity-40">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mx-auto">
                  <Store className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-500">Delivered</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Customer:</span>
              <span className="font-medium text-gray-900">{mockTrackResult.customer}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Fulfillment:</span>
              <span className="font-medium text-gray-900">{mockTrackResult.fulfillment}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Order Date:</span>
              <span className="font-medium text-gray-900">{mockTrackResult.date}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
              <span>Total:</span>
              <span className="text-orange-600 font-extrabold">{formatGHS(mockTrackResult.total)}</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/233551243372"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition"
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
