"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  StoreSettings,
  getStoreSettings,
  saveStoreSettings,
  DEFAULT_STORE_SETTINGS,
} from "@/lib/settings-store";
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileText,
  RotateCcw,
  Truck,
  CheckCircle2,
  Save,
  Globe,
  Share2,
  DollarSign,
  Info,
  ExternalLink,
  Copy,
  Check,
  Download,
  Rss,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [activeTab, setActiveTab] = useState<"general" | "policies" | "google">("general");
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [activePolicy, setActivePolicy] = useState<
    | "aboutUs"
    | "returnRefundPolicy"
    | "privacyPolicy"
    | "termsConditions"
    | "deliveryPolicy"
    | "warrantyPolicy"
  >("returnRefundPolicy");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(getStoreSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset all settings and policies to system defaults?")) {
      saveStoreSettings(DEFAULT_STORE_SETTINGS);
      setSettings(DEFAULT_STORE_SETTINGS);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-[#F26A00]">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Store Settings &amp; Policies CMS
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage contact information, top announcement banner, social handles, and Google Merchant-compliant policy documents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-gray-300 transition"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] hover:to-[#F26A00] text-white text-xs font-black shadow-lg shadow-orange-600/20 active:scale-95 transition"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Saved Changes!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "general"
              ? "bg-slate-800 text-white border-b-2 border-[#F26A00]"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Store className="w-4 h-4 text-[#F26A00]" />
          <span>General &amp; Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "policies"
              ? "bg-slate-800 text-white border-b-2 border-[#F26A00]"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <FileText className="w-4 h-4 text-[#F26A00]" />
          <span>Policy Documents &amp; About Us</span>
        </button>

        <button
          onClick={() => setActiveTab("google")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "google"
              ? "bg-slate-800 text-white border-b-2 border-[#F26A00]"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#F26A00]" />
          <span>Google Merchant Requirements</span>
        </button>
      </div>

      {/* Tab 1: General & Contacts */}
      {activeTab === "general" && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Store Announcement */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white">Top Bar Announcement Banner</h2>
                <p className="text-xs text-gray-400">Displays at the very top of the desktop &amp; mobile storefront.</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.announcementEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, announcementEnabled: e.target.checked })
                  }
                  className="rounded text-[#F26A00] focus:ring-0 bg-slate-900 border-slate-700 w-4 h-4"
                />
                <span className="font-bold">Active</span>
              </label>
            </div>
            <div>
              <input
                type="text"
                value={settings.announcementText}
                onChange={(e) =>
                  setSettings({ ...settings, announcementText: e.target.value })
                }
                placeholder="e.g. Free Delivery on Orders Above GH₵ 500 across Ghana | Genuine Warranty"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
              />
            </div>
          </div>

          {/* Section 2: Store Identity & Contact */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h2 className="text-sm font-black text-white">Business Coordinates &amp; Support Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Store Display Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Store Tagline / Subtitle</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Business Phone (Calls &amp; SMS)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  WhatsApp Support Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Support Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Physical Store Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Charges & Thresholds */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h2 className="text-sm font-black text-white">Delivery Fees &amp; Thresholds (Ghana Cedis)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Standard Nationwide Delivery Fee (GH₵)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.deliveryFee}
                  onChange={(e) =>
                    setSettings({ ...settings, deliveryFee: Number(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Free Delivery Threshold (GH₵)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.freeDeliveryThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      freeDeliveryThreshold: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social Media Links */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white">Social Media Profile Links</h2>
              <span className="text-[11px] text-gray-400">
                Shows in top navigation bar and footer
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={settings.socials.facebook}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, facebook: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={settings.socials.instagram}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, instagram: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">TikTok URL</label>
                <input
                  type="url"
                  value={settings.socials.tiktok}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, tiktok: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">X (Twitter) URL</label>
                <input
                  type="url"
                  value={settings.socials.x}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, x: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Policy Documents & About Us CMS */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <p>
              These documents are publicly published at their dedicated URLs (e.g.{" "}
              <code className="text-blue-200">/policies/returns</code>,{" "}
              <code className="text-blue-200">/policies/privacy</code>,{" "}
              <code className="text-blue-200">/about</code>). You can edit them at any time to keep
              your terms updated.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "returnRefundPolicy", label: "Return & Refund Policy", href: "/policies/returns" },
              { key: "privacyPolicy", label: "Privacy Policy", href: "/policies/privacy" },
              { key: "deliveryPolicy", label: "Shipping & Delivery", href: "/policies/delivery" },
              { key: "warrantyPolicy", label: "Shop Warranty Policy", href: "/policies/warranty" },
              { key: "termsConditions", label: "Terms & Conditions", href: "/policies/terms" },
              { key: "aboutUs", label: "About Us Page", href: "/about" },
            ].map((p) => (
              <div key={p.key} className="flex items-center gap-1">
                <button
                  onClick={() => setActivePolicy(p.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activePolicy === p.key
                      ? "bg-[#F26A00] text-white shadow-md shadow-orange-600/30"
                      : "bg-slate-950 border border-slate-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
                <Link
                  href={p.href}
                  target="_blank"
                  className="p-1.5 text-gray-500 hover:text-orange-400 transition"
                  title="Preview Public Page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-white uppercase tracking-wider">
                Document Content
              </label>
              <span className="text-[11px] text-gray-400">
                {settings.policies[activePolicy]?.length || 0} characters
              </span>
            </div>
            <textarea
              rows={14}
              value={settings.policies[activePolicy] || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  policies: { ...settings.policies, [activePolicy]: e.target.value },
                })
              }
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-gray-200 text-xs font-mono leading-relaxed focus:outline-hidden focus:border-[#F26A00]"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Google Merchant Requirements */}
      {activeTab === "google" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white">Google Merchant Center Compliance Active</h3>
              <p className="mt-0.5 text-gray-300 leading-relaxed">
                Google Merchant Center requires explicit declaration of return windows, shipping cost responsibility, restocking fees, and accepted payment methods. These parameters are dynamically injected into your site&apos;s Schema.org JSON-LD structured data.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h2 className="text-sm font-black text-white">Merchant Return Policy Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Return Window (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={settings.googleMerchant.returnWindowDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleMerchant: {
                        ...settings.googleMerchant,
                        returnWindowDays: Number(e.target.value) || 14,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Restocking Fee (%)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.googleMerchant.restockingFeePercentage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleMerchant: {
                        ...settings.googleMerchant,
                        restockingFeePercentage: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Return Shipping Cost Responsibility
                </label>
                <select
                  value={settings.googleMerchant.returnShippingPayer}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleMerchant: {
                        ...settings.googleMerchant,
                        returnShippingPayer: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                >
                  <option value="seller_on_defect">Seller covers on defect / Buyer on remorse</option>
                  <option value="seller">Seller always covers return shipping</option>
                  <option value="buyer">Buyer always covers return shipping</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Order Handling Time (Days)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.googleMerchant.handlingTimeDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleMerchant: {
                        ...settings.googleMerchant,
                        handlingTimeDays: Number(e.target.value) || 1,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Official Physical Return Address
              </label>
              <input
                type="text"
                value={settings.googleMerchant.returnAddress}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    googleMerchant: {
                      ...settings.googleMerchant,
                      returnAddress: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-[#F26A00]"
              />
            </div>
          </div>

          {/* Section 2: Live Google Merchant Center Product Feed */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-orange-500/10 text-[#F26A00]">
                    <Rss className="w-4 h-4" />
                  </span>
                  <h2 className="text-sm font-black text-white">Live Google Merchant Product Feed</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Automatic XML/TSV catalog feed with live inventory, Ghana Cedis (GHS) pricing, and product variants.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                RSS 2.0 / XML Valid
              </span>
            </div>

            {/* Feed URL Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block">
                Primary Scheduled Fetch URL (Submit to Google Merchant Center)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/feed/google-merchant.xml`
                      : "https://akiaduniventures.com/feed/google-merchant.xml"
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-orange-400 font-mono text-xs select-all focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = typeof window !== "undefined"
                      ? `${window.location.origin}/feed/google-merchant.xml`
                      : "https://akiaduniventures.com/feed/google-merchant.xml";
                    navigator.clipboard.writeText(url);
                    setCopiedFeed(true);
                    setTimeout(() => setCopiedFeed(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition active:scale-95"
                >
                  {copiedFeed ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Feed URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Download & Direct View Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="/feed/google-merchant.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-gray-200 hover:text-white text-xs font-bold transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#F26A00]" />
                <span>Open Live XML Feed</span>
              </a>

              <a
                href="/api/feed/google?format=tsv"
                download="google-merchant-feed.tsv"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-gray-200 hover:text-white text-xs font-bold transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Spreadsheet Feed (.tsv)</span>
              </a>
            </div>

            {/* Quick 3-Step Setup Instructions */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-gray-300">
              <span className="font-bold text-white block">How to connect in Google Merchant Center:</span>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Log in to <span className="text-white font-medium">Google Merchant Center</span> and navigate to <span className="text-white font-medium">Products &gt; Feeds</span>.</li>
                <li>Click <span className="text-white font-medium">Add products (+)</span> and select your target country (<span className="text-white font-medium">Ghana</span>) and language (<span className="text-white font-medium">English</span>).</li>
                <li>Choose <span className="text-white font-medium">Scheduled Fetch</span>, paste the Feed URL copied above, and set the fetch frequency to <span className="text-white font-medium">Daily</span>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
