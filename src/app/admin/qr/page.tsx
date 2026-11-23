"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { INITIAL_QR_CAMPAIGNS } from "@/lib/mock-data";
import { QRCampaign } from "@/types/ecommerce";
import { formatGHS } from "@/lib/utils";
import { AuthenticQR } from "@/components/ui/authentic-qr";
import {
  QrCode,
  Plus,
  ExternalLink,
  Printer,
  TrendingUp,
  MapPin,
  CheckCircle,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

export default function AdminQRPage() {
  const [campaigns, setCampaigns] = useState<QRCampaign[]>(INITIAL_QR_CAMPAIGNS);
  const [selectedForPrint, setSelectedForPrint] = useState<QRCampaign>(INITIAL_QR_CAMPAIGNS[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    slug: "",
    destination: "/products?category=smartphones",
    location: "Shop Showcase Counter",
  });

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/qr");
      const data = await res.json();
      if (data.success && Array.isArray(data.campaigns) && data.campaigns.length > 0) {
        setCampaigns(data.campaigns);
        setSelectedForPrint(data.campaigns[0]);
      }
    } catch (err) {
      console.error("Failed to load QR campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) return;

    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: newCampaign.name,
          slug: newCampaign.slug,
          destination_path: newCampaign.destination,
          location_tag: newCampaign.location,
        }),
      });

      const data = await res.json();
      if (data.success && data.campaign) {
        setCampaigns((prev) => [data.campaign, ...prev]);
        setSelectedForPrint(data.campaign);
        setNotification("New QR Campaign created & saved to Supabase!");
      }
    } catch (err) {
      console.error("Error creating QR campaign:", err);
      // Local fallback
      const fallbackCampaign: QRCampaign = {
        id: `qr-${Date.now()}`,
        campaign_name: newCampaign.name,
        slug: newCampaign.slug || newCampaign.name.toLowerCase().replace(/\s+/g, "-"),
        destination_path: newCampaign.destination,
        location_tag: newCampaign.location,
        is_active: true,
        scans_count: 0,
        orders_count: 0,
        total_revenue: 0,
        created_at: new Date().toISOString(),
      };
      setCampaigns((prev) => [fallbackCampaign, ...prev]);
      setSelectedForPrint(fallbackCampaign);
      setNotification("QR Campaign created locally.");
    } finally {
      setShowCreateModal(false);
      setNewCampaign({ name: "", slug: "", destination: "/products", location: "" });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the QR campaign "${name}"?`)) return;

    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (selectedForPrint.id === id && campaigns.length > 1) {
      setSelectedForPrint(campaigns.find((c) => c.id !== id) || campaigns[0]);
    }

    try {
      await fetch(`/api/qr?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setNotification("Campaign deleted from Supabase.");
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintStoreStand = () => {
    const counterCamp =
      campaigns.find((c) => c.slug === "store-catalog" || c.destination_path === "/products") ||
      campaigns[0];
    if (counterCamp) {
      setSelectedForPrint(counterCamp);
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Supabase QR Tracking
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">In-Store QR Shopping Campaigns</h1>
          <p className="text-xs text-gray-400 mt-1">
            Connect physical shop displays to instant mobile checkout with dynamic redirect attribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrintStoreStand}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-slate-900 font-bold text-xs shadow-md transition cursor-pointer"
            title="Print ready-to-display counter table-tent flyer"
          >
            <Printer className="w-4 h-4 text-orange-600" />
            <span>Print Store Counter Stand</span>
          </button>
          <button
            onClick={fetchCampaigns}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New QR Campaign</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-in fade-in no-print">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Campaign Table & Performance (Hidden on print) */}
        <div className="lg:col-span-7 space-y-4 no-print">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Active QR Shelf &amp; Poster Campaigns</h3>
              <span className="text-xs text-gray-400">{campaigns.length} Active</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {campaigns.map((camp) => {
                const isSelected = selectedForPrint?.id === camp.id;
                const conversionRate =
                  camp.scans_count > 0
                    ? ((camp.orders_count / camp.scans_count) * 100).toFixed(1)
                    : "0.0";

                return (
                  <div
                    key={camp.id}
                    className={`p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-slate-900/90 border-l-4 border-orange-500"
                        : "hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{camp.campaign_name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-400" />
                          {camp.location_tag}
                        </span>
                        <span className="font-mono text-gray-500">&rarr; {camp.destination_path}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-right">
                        <span className="font-bold text-white text-sm block">
                          {camp.scans_count} Scans
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {camp.orders_count} orders ({conversionRate}% conv.)
                        </span>
                        <span className="text-[11px] text-orange-400 font-bold block">
                          {formatGHS(camp.total_revenue || 0)}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedForPrint(camp)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                          isSelected
                            ? "bg-orange-600 text-white"
                            : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                        }`}
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => handleDelete(camp.id, camp.campaign_name)}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition"
                        title="Delete campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Print-Ready Shelf Banner Asset Preview */}
        <div className="lg:col-span-5">
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-orange-500" />
                <span>Printable Shelf / Poster Artwork</span>
              </h3>
              <button
                onClick={handlePrint}
                className="px-3 py-1 bg-white hover:bg-gray-100 text-slate-900 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-orange-600" />
                <span>Print Poster</span>
              </button>
            </div>

            {/* Printable Graphic Card (Isolated for print) */}
            <div
              id="printable-qr-card"
              className="bg-white text-slate-950 p-6 sm:p-8 rounded-3xl border-4 border-slate-900 flex flex-col items-center text-center shadow-inner"
            >
              {/* Brand Header with Real Store Logo */}
              <div className="relative w-48 h-12 mb-2">
                <Image
                  src="/icons/logo-store.webp"
                  alt="Aki Enterprise"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                Official Retail Store • Ghana
              </p>

              {/* Tag / Location */}
              <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
                Location: {selectedForPrint.location_tag}
              </div>

              {/* Action Headline */}
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                Scan to Explore &amp; Order on Phone
              </h3>

              {/* Authentic Scannable QR Code Matrix */}
              <div className="mb-3 flex flex-col items-center">
                <AuthenticQR
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/qr/${selectedForPrint.slug}`
                      : `https://akienterprise.com/qr/${selectedForPrint.slug}`
                  }
                  size={200}
                  centerBadgeText="AKI"
                  showDownloadButton={true}
                />
                <span className="text-[9px] font-mono text-gray-400 mt-1 uppercase tracking-wider">
                  SCAN WITH ANY SMARTPHONE CAMERA
                </span>
              </div>

              {/* Campaign Destination & Instructions */}
              <div className="w-full bg-gray-50 rounded-2xl p-3 border border-gray-100 text-left space-y-1.5 my-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  How to Shop in Store:
                </span>
                <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside font-medium">
                  <li>Open Camera or Scanner on your phone</li>
                  <li>Scan the QR code above to browse our live inventory</li>
                  <li>Order online or pay instantly with MoMo or Cash at counter</li>
                </ol>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 w-full flex items-center justify-around text-[10px] font-bold text-gray-600 uppercase">
                <span>100% Genuine</span>
                <span>Shop Warranty</span>
                <span>Instant Pickup</span>
              </div>

              <p className="mt-3 text-[10px] text-gray-400 border-t border-gray-100 pt-2 w-full">
                Aki Enterprise • Miaso, Kwahu East, Ghana • Phone / WhatsApp: 0551243372
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-gray-400 space-y-1 no-print">
              <p className="font-semibold text-gray-200">Dynamic Redirect Active:</p>
              <p className="text-[11px]">
                Target: <code className="text-orange-400 font-mono">{selectedForPrint.destination_path}</code>. You can change this destination at any time without needing to reprint this physical poster.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New In-Store QR Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 16 Pro Showcase Flyer"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Physical Location / Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Glass Showcase Counter 2"
                  value={newCampaign.location}
                  onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Destination Path *</label>
                <input
                  type="text"
                  required
                  placeholder="/products?category=smartphones"
                  value={newCampaign.destination}
                  onChange={(e) => setNewCampaign({ ...newCampaign, destination: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-gray-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold"
                >
                  Save &amp; Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
