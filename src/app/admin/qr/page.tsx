"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function AdminQRPage() {
  const [campaigns, setCampaigns] = useState<QRCampaign[]>(INITIAL_QR_CAMPAIGNS);
  const [selectedForPrint, setSelectedForPrint] = useState<QRCampaign>(campaigns[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    slug: "",
    destination: "/products?category=smartphones",
    location: "Shop Showcase Counter",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: QRCampaign = {
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
    setCampaigns([created, ...campaigns]);
    setSelectedForPrint(created);
    setShowCreateModal(false);
    setNewCampaign({ name: "", slug: "", destination: "/products", location: "" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">In-Store QR Shopping Campaigns</h1>
          <p className="text-xs text-gray-400 mt-1">
            Connect physical shop displays to instant mobile checkout with dynamic redirect attribution
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New QR Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Campaign Table & Performance */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Active QR Shelf & Banner Campaigns</h3>
              <span className="text-xs text-gray-400">{campaigns.length} Active</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {campaigns.map((camp) => {
                const isSelected = selectedForPrint?.id === camp.id;
                const conversionRate = camp.scans_count > 0
                  ? ((camp.orders_count / camp.scans_count) * 100).toFixed(1)
                  : "0.0";

                return (
                  <div
                    key={camp.id}
                    className={`p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected ? "bg-slate-900/90 border-l-4 border-orange-500" : "hover:bg-slate-900/40"
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
                        <span className="font-mono text-gray-500">→ {camp.destination_path}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="font-bold text-white text-sm block">{camp.scans_count} Scans</span>
                        <span className="text-[11px] text-gray-400">
                          {camp.orders_count} orders ({conversionRate}% conv.)
                        </span>
                        <span className="text-[11px] text-orange-400 font-bold block">
                          {formatGHS(camp.total_revenue)}
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
                        Preview Artwork
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-orange-500" />
                <span>Printable Shelf / Poster Artwork</span>
              </h3>
              <button
                onClick={handlePrint}
                className="px-3 py-1 bg-white hover:bg-gray-100 text-slate-900 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
            </div>

            {/* Printable Graphic Card */}
            <div
              id="printable-qr-card"
              className="bg-white text-slate-950 p-6 rounded-2xl border-4 border-slate-900 flex flex-col items-center text-center shadow-inner"
            >
              {/* Brand Header */}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xl font-black tracking-tight text-slate-950">
                  AKI <span className="text-orange-600">ENTERPRISE</span>
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                In-Store Scan &amp; Buy • Ghana
              </p>

              {/* Tag / Location */}
              <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
                Location: {selectedForPrint.location_tag}
              </div>

              {/* Authentic Scannable QR Code Matrix */}
              <div className="mb-4 flex flex-col items-center">
                <AuthenticQR
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/qr/${selectedForPrint.slug}`
                      : `https://akienterprise.com/qr/${selectedForPrint.slug}`
                  }
                  size={190}
                  centerBadgeText="AKI"
                  showDownloadButton={true}
                />
                <span className="text-[10px] font-mono text-gray-400 mt-2 uppercase tracking-wider">
                  SCAN WITH ANY SMARTPHONE CAMERA
                </span>
              </div>

              {/* Scan Call to Action */}
              <h4 className="font-black text-sm text-slate-900 uppercase">
                {selectedForPrint.campaign_name}
              </h4>
              <p className="text-xs text-gray-600 mt-1 max-w-xs leading-relaxed">
                Scan now to view battery health, warranty terms & pay instantly via MTN MoMo, Telecel Cash or Card!
              </p>

              <div className="mt-4 pt-3 border-t border-gray-200 w-full flex items-center justify-around text-[10px] font-bold text-gray-500 uppercase">
                <span>Shop Warranty</span>
                <span>Pay with MoMo</span>
                <span>Instant Pickup</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-gray-400 space-y-1">
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
                  placeholder="e.g. iPhone 15 Showcase Flyer"
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
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Generate QR Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
