"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroBanner } from "@/types/ecommerce";
import {
  getStoredBanners,
  saveStoredBanners,
  addBanner,
  toggleBannerStatus,
  deleteBanner,
} from "@/lib/banner-store";
import {
  Image as ImageIcon,
  Plus,
  Eye,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Sliders,
  Layers,
  Palette,
  Globe,
  Upload,
} from "lucide-react";

const SAMPLE_PRESET_IMAGES = [
  {
    name: "Apple iPhone 15/16 Pro Titanium",
    url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "iPhone 14 Pro Deep Purple (UK-Used)",
    url: "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Anker GaN Charging & Power Banks",
    url: "https://images.unsplash.com/photo-1609592807963-394ff0073289?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "PC RAM & NVMe SSD Storage",
    url: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Smartwatches & Wireless Audio",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("Premium Electronics • Aki Enterprise");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [ctaLink, setCtaLink] = useState("/products?category=smartphones");
  const [secondaryCtaText, setSecondaryCtaText] = useState("Explore Deals");
  const [secondaryCtaLink, setSecondaryCtaLink] = useState("/products?featured=true");
  const [imageUrl, setImageUrl] = useState(SAMPLE_PRESET_IMAGES[0].url);
  const [accentColor, setAccentColor] = useState("#F26A00");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setBanners(getStoredBanners());

    const handleUpdate = () => {
      setBanners(getStoredBanners());
    };
    window.addEventListener("banners_updated", handleUpdate);
    return () => window.removeEventListener("banners_updated", handleUpdate);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggle = (id: string) => {
    const updated = toggleBannerStatus(id);
    setBanners(updated);
    showNotification("Banner status updated on public site.");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this banner from the public storefront?")) {
      const updated = deleteBanner(id);
      setBanners(updated);
      showNotification("Banner removed successfully.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert("Please provide both a Title and an Image URL.");
      return;
    }

    addBanner({
      title,
      subtitle,
      badge,
      cta_text: ctaText,
      cta_link: ctaLink,
      secondary_cta_text: secondaryCtaText,
      secondary_cta_link: secondaryCtaLink,
      image_url: imageUrl,
      accent_color: accentColor,
      display_order: Number(displayOrder),
      is_active: isActive,
    });

    setIsModalOpen(false);
    showNotification("New Hero Banner published to storefront!");

    // Reset Form
    setTitle("");
    setSubtitle("");
    setBadge("Premium Electronics • Aki Enterprise");
    setCtaText("Shop Now");
    setCtaLink("/products?category=smartphones");
    setImageUrl(SAMPLE_PRESET_IMAGES[0].url);
  };

  const activeBanners = banners.filter((b) => b.is_active);
  const previewBanner = banners.find((b) => b.id === activePreviewId) || activeBanners[0] || banners[0];

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-orange-500" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Homepage Hero Banners &amp; CMS
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage, upload and schedule the promotional hero banners displayed on the public storefront. Changes apply in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>View Public Site</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/20 transition flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Banner</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-black">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              Total Banners
            </span>
            <div className="text-xl font-black text-white">{banners.length}</div>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              Active on Public Site
            </span>
            <div className="text-xl font-black text-emerald-400">{activeBanners.length}</div>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-gray-400 flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              Draft / Hidden
            </span>
            <div className="text-xl font-black text-gray-400">
              {banners.length - activeBanners.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Banners Table & Live Public Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Banners List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              <span>Configured Hero Banners</span>
            </h2>
            <span className="text-[11px] text-gray-400">Click any card to preview</span>
          </div>

          <div className="space-y-3">
            {banners.map((b) => (
              <div
                key={b.id}
                onClick={() => setActivePreviewId(b.id)}
                className={`p-4 rounded-2xl bg-slate-950/80 border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  previewBanner?.id === b.id
                    ? "border-orange-500/80 ring-1 ring-orange-500/30"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <Image
                      src={b.image_url}
                      alt={b.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Title & Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-orange-400">
                        {b.badge}
                      </span>
                      {b.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Live</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-500">Hidden</span>
                      )}
                    </div>
                    <h3 className="font-bold text-xs text-white line-clamp-1">{b.title}</h3>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{b.subtitle}</p>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-2 self-end sm:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleToggle(b.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      b.is_active
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                        : "bg-slate-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {b.is_active ? "Active" : "Disabled"}
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Public Preview Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-400" />
              <span>Live Public Store Preview</span>
            </h2>
            <span className="text-[11px] text-emerald-400 font-semibold">Simulated Desktop View</span>
          </div>

          {previewBanner ? (
            <div className="rounded-3xl bg-[#171717] text-white p-6 relative overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between min-h-[380px]">
              {/* Background Glow */}
              <div
                className="absolute top-0 right-0 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: previewBanner.accent_color || "#F26A00" }}
              />

              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FF8A24] text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>{previewBanner.badge}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {previewBanner.title}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed max-w-xs">
                  {previewBanner.subtitle}
                </p>

                <div className="flex items-center gap-2.5 pt-2">
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
                    <span>{previewBanner.cta_text}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  {previewBanner.secondary_cta_text && (
                    <div className="px-4 py-2 rounded-full bg-white/10 text-white font-bold text-xs border border-white/10">
                      {previewBanner.secondary_cta_text}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Cluster Mock in preview */}
              <div className="relative w-full h-32 mt-4 rounded-xl overflow-hidden border border-white/10">
                <Image
                  src={previewBanner.image_url}
                  alt={previewBanner.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="text-[10px] text-gray-400 pt-2 border-t border-white/10 flex items-center justify-between">
                <span>Target: {previewBanner.cta_link}</span>
                <span className="font-mono text-orange-400">Order: #{previewBanner.display_order}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-gray-500">
              No banners currently created.
            </div>
          )}
        </div>
      </div>

      {/* Upload / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">Upload New Hero Banner</h2>
                <p className="text-xs text-gray-400">
                  Configure headline, photo, CTA destination and live visibility.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preset Image Chooser */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">
                  Select Banner Asset / Photography Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SAMPLE_PRESET_IMAGES.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setImageUrl(img.url)}
                      className={`relative aspect-16/10 rounded-xl overflow-hidden border transition ${
                        imageUrl === img.url
                          ? "border-orange-500 ring-2 ring-orange-500/40"
                          : "border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img.url} alt={img.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  Or Enter Custom Image URL (Supabase Storage / Web CDN)
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-gray-500 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              {/* Title & Pill Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Banner Headline</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. The Latest Technology. Better Prices."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-gray-500 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Pill Badge Text</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Flash Sale • In-Store Ready"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-gray-500 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Subtitle / Marketing Pitch */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Subtitle Description</label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Discover certified smartphones, original accessories, and everyday electronics at wholesale-direct retail prices in Ghana."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-gray-500 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              {/* Buttons Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Primary Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Primary Destination Link</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Accent Color & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Accent Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-gray-400">{accentColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-orange-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="isActive" className="text-xs text-gray-300 font-semibold cursor-pointer">
                  Publish immediately to public storefront hero slider
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
