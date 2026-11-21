"use client";

import React, { useState } from "react";
import { formatGHS } from "@/lib/utils";
import { OrderStatus } from "@/types/ecommerce";
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Clock,
  Truck,
  Store,
  Phone,
  Filter,
} from "lucide-react";

interface MockAdminOrder {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  itemsSummary: string;
  total: number;
  fulfillment: string;
  status: OrderStatus;
  paymentMethod: string;
}

const INITIAL_ORDERS: MockAdminOrder[] = [
  {
    id: "AKI-2026-9042",
    customerName: "Kofi Boateng",
    phone: "0244 881 290",
    email: "kofi.b@gmail.com",
    date: "Nov 20, 2026 • 15:42",
    itemsSummary: "Apple iPhone 15 Pro Max (256GB - Natural Titanium) × 1",
    total: 14835,
    fulfillment: "Courier Delivery (East Legon, Accra)",
    status: "processing",
    paymentMethod: "Paystack MTN MoMo",
  },
  {
    id: "AKI-2026-9041",
    customerName: "Ama Serwaa",
    phone: "0501 329 881",
    email: "ama.s@yahoo.com",
    date: "Nov 20, 2026 • 14:15",
    itemsSummary: "Apple iPhone 13 UK-Used (Midnight 128GB) × 1, Oraimo FreePods 4 × 1",
    total: 5620,
    fulfillment: "Shop Pickup (Aki Enterprise Counter)",
    status: "ready_for_pickup",
    paymentMethod: "Pay at Shop Counter",
  },
  {
    id: "AKI-2026-9040",
    customerName: "Emmanuel Doe",
    phone: "0202 991 402",
    email: "edoe@outlook.com",
    date: "Nov 20, 2026 • 11:30",
    itemsSummary: "Anker 20,000mAh Power Bank (Phantom Black) × 2",
    total: 1360,
    fulfillment: "Courier Delivery (Kumasi Adum)",
    status: "out_for_delivery",
    paymentMethod: "Paystack Telecel Cash",
  },
  {
    id: "AKI-2026-9038",
    customerName: "Dr. Selorm Mensah",
    phone: "0243 002 993",
    email: "selorm@clinic.gh",
    date: "Nov 19, 2026 • 17:05",
    itemsSummary: "Samsung Galaxy S24 Ultra (Titanium Gray 256GB) × 1",
    total: 14200,
    fulfillment: "Shop Pickup (Aki Enterprise Counter)",
    status: "delivered",
    paymentMethod: "Paystack Visa/Mastercard",
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<MockAdminOrder[]>(INITIAL_ORDERS);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

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
      default:
        return "bg-slate-800 text-gray-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Order Operations & Fulfillment</h1>
          <p className="text-xs text-gray-400 mt-1">
            Process incoming sales, dispatch couriers, and manage customer pickup readiness
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === "all" ? "bg-orange-600 text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700"
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === "processing" ? "bg-orange-600 text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setStatusFilter("ready_for_pickup")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === "ready_for_pickup" ? "bg-orange-600 text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700"
            }`}
          >
            Ready for Pickup
          </button>
          <button
            onClick={() => setStatusFilter("out_for_delivery")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === "out_for_delivery" ? "bg-orange-600 text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700"
            }`}
          >
            Out for Delivery
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-base text-orange-400">
                  {order.id}
                </span>
                <span className="text-xs text-gray-400">• {order.date}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getStatusBadge(order.status)}`}>
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Update Status:</span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Customer */}
              <div className="space-y-1">
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                  Customer
                </span>
                <p className="font-bold text-white text-sm">{order.customerName}</p>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  <span>{order.phone}</span>
                </div>
                <p className="text-gray-500 text-[11px]">{order.email}</p>
              </div>

              {/* Items */}
              <div className="space-y-1">
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                  Items Purchased
                </span>
                <p className="text-gray-200 leading-relaxed font-medium">
                  {order.itemsSummary}
                </p>
                <p className="text-[11px] text-gray-400">
                  Payment: <strong className="text-emerald-400">{order.paymentMethod}</strong>
                </p>
              </div>

              {/* Fulfillment & Total */}
              <div className="space-y-1 md:text-right">
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                  Fulfillment & Total
                </span>
                <p className="text-gray-300 font-medium">{order.fulfillment}</p>
                <p className="text-xl font-black text-orange-400 pt-1">
                  {formatGHS(order.total)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
