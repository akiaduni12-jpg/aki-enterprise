"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatGHS } from "@/lib/utils";
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  X,
  ChevronRight,
  ShieldCheck,
  Award,
  Filter,
  Save,
  UserPlus,
} from "lucide-react";

interface CustomerOrderSummary {
  order_number: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  fulfillment_type: string;
  created_at: string;
  items_count: number;
  items_summary?: string;
}

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string;
  address: string | null;
  total_orders: number;
  total_spent: number;
  paid_orders_count: number;
  first_order_at: string;
  last_order_at: string;
  tier: "vip" | "regular" | "new";
  status: "active" | "flagged";
  notes?: string;
  orders: CustomerOrderSummary[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit / Notes state inside drawer
  const [editingNotes, setEditingNotes] = useState("");
  const [editingTier, setEditingTier] = useState<"vip" | "regular" | "new">("regular");
  const [editingStatus, setEditingStatus] = useState<"active" | "flagged">("active");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Fetch customers from backend
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.success && Array.isArray(json.customers)) {
        setCustomers(json.customers);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // When opening a customer drawer, sync editable fields
  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setEditingNotes(c.notes || "");
    setEditingTier(c.tier);
    setEditingStatus(c.status);
  };

  // Save notes & tier updates
  const handleSaveCustomerUpdates = async () => {
    if (!selectedCustomer) return;
    setIsSavingNotes(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          notes: editingNotes,
          tier: editingTier,
          status: editingStatus,
        }),
      });

      const updated = {
        ...selectedCustomer,
        notes: editingNotes,
        tier: editingTier,
        status: editingStatus,
      };

      setSelectedCustomer(updated);
      setCustomers((prev) =>
        prev.map((c) => (c.id === selectedCustomer.id ? updated : c))
      );

      setNotification("Customer profile and notes updated successfully.");
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      console.error("Failed to save updates:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Export CSV for WhatsApp / SMS marketing campaigns
  const handleExportCSV = () => {
    if (customers.length === 0) return;

    const headers = [
      "Full Name",
      "Phone",
      "Email",
      "City",
      "Total Orders",
      "Total Spent (GHS)",
      "Tier",
      "Status",
      "Last Order Date",
    ];

    const rows = customers.map((c) => [
      `"${c.full_name}"`,
      `"${c.phone}"`,
      `"${c.email || ""}"`,
      `"${c.city}"`,
      c.total_orders,
      c.total_spent,
      c.tier,
      c.status,
      `"${new Date(c.last_order_at).toLocaleDateString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aki_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification("Customer directory exported to CSV.");
    setTimeout(() => setNotification(null), 3000);
  };

  // Clean Ghana phone number for WhatsApp link
  const getWhatsAppLink = (phone: string, name: string) => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "233" + clean.slice(1);
    } else if (!clean.startsWith("233")) {
      clean = "233" + clean;
    }
    const message = encodeURIComponent(
      `Hello ${name}, this is Aki Enterprise (Miaso, Kwahu East). How can we assist you with your tech orders today?`
    );
    return `https://wa.me/${clean}?text=${message}`;
  };

  // Filter and search logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.full_name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.city.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterTier === "vip") return c.tier === "vip";
      if (filterTier === "repeat") return c.total_orders >= 2;
      if (filterTier === "flagged") return c.status === "flagged";
      if (filterTier === "active") return c.status === "active";

      return true;
    });
  }, [customers, searchQuery, filterTier]);

  // High-level CRM metrics
  const totalSpendSum = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.total_spent, 0);
  }, [customers]);

  const repeatBuyerCount = useMemo(() => {
    return customers.filter((c) => c.total_orders >= 2).length;
  }, [customers]);

  const vipCount = useMemo(() => {
    return customers.filter((c) => c.tier === "vip").length;
  }, [customers]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Store CRM &amp; Client Registry
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Customer Management</h1>
          <p className="text-xs text-gray-400 mt-1">
            Track customer purchase history, manage store VIPs, log staff notes, and initiate direct WhatsApp support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
            title="Download CSV of customer phone numbers and spend"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchCustomers}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Total Customers</span>
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-black text-white">{customers.length}</div>
          <p className="text-[10px] text-gray-500 mt-0.5">Unique buyers registered</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Customer Lifetime Spend</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">GHS</span>
          </div>
          <div className="text-xl font-black text-emerald-400">
            {formatGHS(totalSpendSum)}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Cumulative revenue</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Repeat Buyers</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-black text-white">
            {repeatBuyerCount}{" "}
            <span className="text-xs font-medium text-gray-400">
              ({customers.length > 0 ? ((repeatBuyerCount / customers.length) * 100).toFixed(0) : 0}%)
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">&ge; 2 completed orders</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">VIP Clients</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">{vipCount}</div>
          <p className="text-[10px] text-gray-500 mt-0.5">High-spend verified shoppers</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, phone (e.g. 055...), city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-orange-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "all", label: "All Customers" },
            { id: "vip", label: "VIP Only" },
            { id: "repeat", label: "Repeat Buyers" },
            { id: "flagged", label: "Flagged" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTier(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                filterTier === tab.id
                  ? "bg-orange-600 text-white"
                  : "bg-slate-950 border border-slate-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-gray-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Tier &amp; Status</th>
                <th className="py-3.5 px-4 text-right">Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spent</th>
                <th className="py-3.5 px-4">Last Order</th>
                <th className="py-3.5 px-4 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-orange-500 mb-2" />
                    Loading customer directory...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No customers found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isVip = c.tier === "vip";
                  const isFlagged = c.status === "flagged";

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="hover:bg-slate-900/60 transition cursor-pointer group"
                    >
                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                              isVip
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : isFlagged
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-slate-800 text-gray-300"
                            }`}
                          >
                            {c.full_name.charAt(0) || "C"}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-orange-400 transition flex items-center gap-1.5">
                              <span>{c.full_name}</span>
                              {isVip && (
                                <span title="VIP Customer">
                                  <Award className="w-3.5 h-3.5 text-amber-400" />
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                              <span>{c.phone}</span>
                              {c.email && (
                                <span className="text-gray-500">• {c.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-gray-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{c.city}</span>
                        </span>
                      </td>

                      {/* Tier & Status */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          {isVip ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              VIP Buyer
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-gray-300">
                              Regular
                            </span>
                          )}

                          {isFlagged ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-red-500/20 text-red-400">
                              Flagged Risk
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Order Count */}
                      <td className="py-3.5 px-4 text-right font-semibold text-white">
                        {c.total_orders}{" "}
                        <span className="text-gray-500 text-[11px]">
                          ({c.paid_orders_count} paid)
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatGHS(c.total_spent)}
                      </td>

                      {/* Last Order Date */}
                      <td className="py-3.5 px-4 text-gray-400">
                        <span className="block text-gray-200">
                          {new Date(c.last_order_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(c.last_order_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Quick Communication Actions */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Internal Admin WhatsApp Chat */}
                          <Link
                            href={`/admin/whatsapp?phone=${c.phone.replace(/\D/g, "")}&name=${encodeURIComponent(c.full_name)}`}
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition flex items-center gap-1 text-[11px] font-bold"
                            title="Chat in Admin WhatsApp Engine"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Chat</span>
                          </Link>

                          {/* Direct External WhatsApp */}
                          <a
                            href={getWhatsAppLink(c.phone, c.full_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition"
                            title="Open in WhatsApp Web"
                          >
                            <span className="text-[10px] font-mono">WA</span>
                          </a>

                          {/* Direct Phone Call */}
                          <a
                            href={`tel:${c.phone}`}
                            className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 transition"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* Open Drawer */}
                          <button
                            onClick={() => handleSelectCustomer(c)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 transition"
                            title="View Full Profile"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Slide-over Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-xl bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl space-y-6">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F26A00] to-[#FF8A24] flex items-center justify-center font-bold text-white text-sm shadow-md">
                    {selectedCustomer.full_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>{selectedCustomer.full_name}</span>
                      {selectedCustomer.tier === "vip" && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          VIP
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">{selectedCustomer.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Direct Communication Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/admin/whatsapp?phone=${selectedCustomer.phone.replace(/\D/g, "")}&name=${encodeURIComponent(selectedCustomer.full_name)}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Admin WhatsApp Chat</span>
                </Link>

                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>Call Customer</span>
                </a>
              </div>

              {/* Customer Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Spent</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                    {formatGHS(selectedCustomer.total_spent)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Orders</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {selectedCustomer.total_orders} Orders
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">First Seen</span>
                  <span className="text-xs font-semibold text-gray-300 mt-0.5 block">
                    {new Date(selectedCustomer.first_order_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Customer Details & Location */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-gray-300 text-[11px] uppercase tracking-wider">
                  Delivery &amp; Contact Information
                </h4>
                <div className="space-y-1.5 text-gray-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-200">{selectedCustomer.city}</strong>
                      {selectedCustomer.address && ` — ${selectedCustomer.address}`}
                    </span>
                  </div>
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span>Email: {selectedCustomer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Staff Notes & Tier Settings */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    <span>Staff CRM Controls &amp; Notes</span>
                  </h4>
                  <button
                    onClick={handleSaveCustomerUpdates}
                    disabled={isSavingNotes}
                    className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs rounded-lg shadow-sm hover:opacity-90 transition cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isSavingNotes ? "Saving..." : "Save"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">
                      Customer Tier
                    </label>
                    <select
                      value={editingTier}
                      onChange={(e) => setEditingTier(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    >
                      <option value="regular">Regular Shopper</option>
                      <option value="vip">VIP Buyer</option>
                      <option value="new">New Customer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">
                      Risk / Status
                    </label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    >
                      <option value="active">Active &amp; Verified</option>
                      <option value="flagged">Flagged / Unreliable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">
                    Staff Internal Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="e.g. Prefers Miaso shop pickup on weekends. Always calls before ordering."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder-gray-500 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Order History Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center justify-between">
                  <span>Order History ({selectedCustomer.orders.length})</span>
                  <span className="text-[11px] text-gray-400 font-normal">All time</span>
                </h4>

                <div className="space-y-2.5">
                  {selectedCustomer.orders.map((ord) => (
                    <div
                      key={ord.order_number}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-xs">
                          {ord.order_number}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {formatGHS(ord.total_amount)}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-400 flex items-center justify-between">
                        <span className="truncate max-w-[240px]">
                          {ord.items_summary || `${ord.items_count} items`}
                        </span>
                        <span className="text-[10px] capitalize px-1.5 py-0.5 rounded bg-slate-800 text-gray-300">
                          {ord.order_status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <span>Fulfillment: {ord.fulfillment_type.replace(/_/g, " ")}</span>
                        <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Close */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold text-xs transition"
              >
                Close Customer Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
