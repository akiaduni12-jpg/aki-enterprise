"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroBanner } from "@/types/ecommerce";
import {
  getStoredBanners,
  saveStoredBanners,
  addBanner,
  updateBanner,
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
  Monitor,
  Smartphone,
  Tablet,
  Check,
  X,
  Edit3,
} from "lucide-react";

const SAMPLE_16_9_PRESETS = [
  {
    name: "Apple Flagship Showcase (16:9 Widescreen)",
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1920&q=80",
    color: "#F26A00",
  },
  {
    name: "UK-Used Premium Flagships (16:9 Widescreen)",
    url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1920&q=80",
    color: "#EA580C",
  },
  {
    name: "Fast Charging & Power Tech (16:9 Widescreen)",
    url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1920&q=80",
    color: "#2563EB",
  },
  {
    name: "High-Performance Workstation & Laptops (16:9)",
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=80",
    color: "#7C3AED",
  },
  {
    name: "Smart Audio & Wireless Accessories (16:9)",
    url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1920&q=80",
    color: "#059669",
  },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("Premium Electronics • Aki Enterprise");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [ctaLink, setCtaLink] = useState("/products?category=smartphones");
  const [secondaryCtaText, setSecondaryCtaText] = useState("Explore Deals");
  const [secondaryCtaLink, setSecondaryCtaLink] = useState("/products?featured=true");
  const [imageUrl, setImageUrl] = useState(SAMPLE_16_9_PRESETS[0].url);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      showNotification("16:9 image file loaded into preview!");
    };
    reader.readAsDataURL(file);
  };

  const handleToggle = (id: string) => {
    const updated = toggleBannerStatus(id);
    setBanners(updated);
    showNotification("Banner status updated on public storefront.");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this 16:9 hero banner?")) {
      const updated = deleteBanner(id);
      setBanners(updated);
      showNotification("Banner removed successfully.");
    }
  };

  const handleOpenNewBanner = () => {
    setEditingBannerId(null);
    setTitle("The Latest Technology. Better Prices.");
    setSubtitle("Discover certified smartphones, original accessories, and everyday electronics at wholesale-direct retail prices in Ghana.");
    setBadge("Premium Electronics • Aki Enterprise");
    setCtaText("Shop Now");
    setCtaLink("/products?category=smartphones");
    setSecondaryCtaText("Explore Deals");
    setSecondaryCtaLink("/products?featured=true");
    setImageUrl(SAMPLE_16_9_PRESETS[0].url);
    setAccentColor("#F26A00");
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleEditBanner = (b: HeroBanner) => {
    setEditingBannerId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setBadge(b.badge);
    setCtaText(b.cta_text);
    setCtaLink(b.cta_link);
    setSecondaryCtaText(b.secondary_cta_text || "");
    setSecondaryCtaLink(b.secondary_cta_link || "");
    setImageUrl(b.image_url);
    setAccentColor(b.accent_color || "#F26A00");
    setDisplayOrder(b.display_order);
    setIsActive(b.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert("Please provide both a Title and an Image URL.");
      return;
    }

    if (editingBannerId) {
      updateBanner(editingBannerId, {
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
      showNotification("Hero Banner updated successfully!");
    } else {
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
      showNotification("New 16:9 Hero Banner published to storefront!");
    }

    setIsModalOpen(false);
  };

  const activeBanners = banners.filter((b) => b.is_active);
  const previewBanner =
    banners.find((b) => b.id === activePreviewId) || activeBanners[0] || banners[0];

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] border border-orange-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#FF8A24]" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Header and Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600/20 text-[#FF8A24] border border-orange-600/30">
              Homepage CMS
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              16:9 Widescreen Standard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            16:9 Hero Banner Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Upload full-width 16:9 widescreen banners (1920×1080) for the public homepage slider. Configure headlines, badges, and CTA routes.
          </p>
        </div>

        <button
          onClick={handleOpenNewBanner}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New 16:9 Banner</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 1. LIVE 16:9 STOREFRONT BANNER SIMULATOR */}
      {/* ==================================================================== */}
      {previewBanner && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FF8A24]" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Storefront 16:9 Live Preview Simulator
              </h2>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                  previewDevice === "desktop"
                    ? "bg-orange-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 Desktop</span>
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                  previewDevice === "tablet"
                    ? "bg-orange-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet</span>
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                  previewDevice === "mobile"
                    ? "bg-orange-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="flex justify-center bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-800/80 overflow-hidden">
            <div
              className={`transition-all duration-300 w-full ${
                previewDevice === "desktop"
                  ? "max-w-5xl"
                  : previewDevice === "tablet"
                  ? "max-w-2xl"
                  : "max-w-sm"
              }`}
            >
              {/* TRUE 16:9 RATIO CONTAINER */}
              <div className="relative aspect-16/9 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                {/* 16:9 Edge-to-Edge Banner Image */}
                <Image
                  src={previewBanner.image_url}
                  alt={previewBanner.title}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Cinematic Gradient Scrim Overlay for Crystal-Clear Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
                <div
                  className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
                  style={{ backgroundColor: previewBanner.accent_color || "#F26A00" }}
                />

                {/* Overlay Text & Controls */}
                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[#FF8A24] text-[10px] sm:text-xs font-black tracking-wide">
                      <Sparkles className="w-3 h-3 text-[#FF8A24]" />
                      <span>{previewBanner.badge}</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-white/80 text-[10px] font-mono border border-white/10">
                      16:9 High-Res Mode
                    </span>
                  </div>

                  {/* Headline & Body */}
                  <div className="max-w-lg space-y-2.5 sm:space-y-3">
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      {previewBanner.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-md drop-shadow-sm">
                      {previewBanner.subtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs shadow-lg shadow-orange-600/40 flex items-center gap-1.5">
                        <span>{previewBanner.cta_text}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      {previewBanner.secondary_cta_text && (
                        <span className="px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/25 font-bold text-xs">
                          {previewBanner.secondary_cta_text}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Pagination Simulator */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-7 h-1.5 rounded-full bg-[#F26A00]" />
                      <span className="w-2 h-1.5 rounded-full bg-white/40" />
                      <span className="w-2 h-1.5 rounded-full bg-white/40" />
                    </div>
                    <span className="text-[10px] text-gray-300 font-mono">
                      Aki Enterprise TechHub • 16:9 Showcase
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. BANNERS LIST & CRUD TABLE */}
      {/* ==================================================================== */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Active 16:9 Banners Queue</h3>
            <p className="text-xs text-gray-400">
              Drag, activate, or edit slider banners displayed on the homepage
            </p>
          </div>
          <span className="text-xs font-bold text-[#FF8A24] bg-orange-600/10 px-3 py-1 rounded-full border border-orange-600/20">
            {activeBanners.length} Live on Storefront
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Banner Preview (16:9)</th>
                <th className="py-3 px-4">Headline &amp; Badge</th>
                <th className="py-3 px-4">CTA Routes</th>
                <th className="py-3 px-4">Public Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {banners.map((b) => (
                <tr
                  key={b.id}
                  className={`hover:bg-slate-900/50 transition ${
                    activePreviewId === b.id ? "bg-slate-900/80" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-gray-400">
                    #{b.display_order}
                  </td>

                  {/* 16:9 Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="relative w-36 aspect-16/9 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-sm shrink-0">
                      <Image src={b.image_url} alt={b.title} fill className="object-cover" />
                      <div
                        className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white/50"
                        style={{ backgroundColor: b.accent_color || "#F26A00" }}
                      />
                    </div>
                  </td>

                  {/* Title & Badge */}
                  <td className="py-3 px-4 max-w-xs">
                    <span className="text-[10px] font-bold text-[#FF8A24] uppercase tracking-wider block">
                      {b.badge}
                    </span>
                    <p className="font-bold text-white line-clamp-1 text-sm">{b.title}</p>
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{b.subtitle}</p>
                  </td>

                  {/* CTA Details */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-white">{b.cta_text}</span>
                    <span className="text-[10px] text-gray-500 block font-mono">{b.cta_link}</span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(b.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                        b.is_active
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                      }`}
                    >
                      {b.is_active ? "● Live on Site" : "Hidden"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActivePreviewId(b.id)}
                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Preview in 16:9 Simulator"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditBanner(b)}
                        className="p-1.5 text-gray-400 hover:text-[#FF8A24] rounded-lg hover:bg-slate-800 transition"
                        title="Edit Banner"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MODAL: UPLOAD / EDIT 16:9 BANNER */}
      {/* ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  {editingBannerId ? "Edit 16:9 Banner" : "Upload Full 16:9 Hero Banner"}
                </h2>
                <p className="text-xs text-gray-400">
                  Recommended size: 1920×1080 px (16:9 Aspect Ratio) for edge-to-edge clarity.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Preview & File Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-300 block">
                  16:9 Banner Image (Upload File or URL) *
                </label>

                {/* 16:9 Aspect Ratio Live Preview in Form */}
                <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-inner">
                  {imageUrl ? (
                    <Image src={imageUrl} alt="Banner preview" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <span className="text-xs">No image selected</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-black/70 text-white font-mono text-[10px]">
                    16:9 Widescreen
                  </div>
                </div>

                {/* Upload File & URL Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="url"
                    required
                    placeholder="Paste direct 16:9 image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />

                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shrink-0">
                    <Upload className="w-4 h-4 text-[#FF8A24]" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Presets Gallery */}
                <div>
                  <span className="text-[11px] font-bold text-gray-400 block mb-2">
                    Or pick from high-definition 16:9 curated presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SAMPLE_16_9_PRESETS.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setImageUrl(p.url);
                          setAccentColor(p.color);
                        }}
                        className={`relative aspect-16/9 rounded-lg overflow-hidden border transition ${
                          imageUrl === p.url
                            ? "border-orange-500 ring-2 ring-orange-500/30"
                            : "border-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <Image src={p.url} alt={p.name} fill className="object-cover" />
                        {imageUrl === p.url && (
                          <div className="absolute inset-0 bg-orange-600/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Banner Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Latest Technology. Better Prices."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Top Pill Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Electronics • Aki Enterprise"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Supporting promotional text, guarantee details, or delivery highlights..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 resize-none"
                />
              </div>

              {/* Call-to-Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 block">
                    Primary CTA (Button Text &amp; URL)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Shop Now"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                    <input
                      type="text"
                      placeholder="/products?category=smartphones"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 block">
                    Secondary CTA (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Explore Deals"
                      value={secondaryCtaText}
                      onChange={(e) => setSecondaryCtaText(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                    <input
                      type="text"
                      placeholder="/products?featured=true"
                      value={secondaryCtaLink}
                      onChange={(e) => setSecondaryCtaLink(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Accent Color & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Glow Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                    />
                    <span className="text-xs font-mono text-gray-400">{accentColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-orange-600 focus:ring-orange-500 bg-slate-900 border-slate-700"
                    />
                    <span>Make Active on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-gray-400 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs shadow-lg shadow-orange-600/30 hover:from-[#d95e00] transition active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingBannerId ? "Save Changes" : "Publish 16:9 Banner"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
