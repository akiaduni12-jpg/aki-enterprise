"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StoreSettings, getStoreSettings } from "@/lib/settings-store";
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  policyKey:
    | "aboutUs"
    | "returnRefundPolicy"
    | "privacyPolicy"
    | "termsConditions"
    | "deliveryPolicy"
    | "warrantyPolicy"
    | "cancellationPolicy";
  lastUpdated?: string;
}

export function PolicyLayout({
  title,
  subtitle,
  badge = "Official Store Policy",
  policyKey,
  lastUpdated = "November 2026",
}: PolicyLayoutProps) {
  const [settings, setSettings] = useState<StoreSettings>(getStoreSettings());

  useEffect(() => {
    const refresh = () => setSettings(getStoreSettings());
    refresh();
    window.addEventListener("settings_updated", refresh);
    return () => window.removeEventListener("settings_updated", refresh);
  }, []);

  const content = settings.policies[policyKey] || "";

  // Schema.org structured data for Google Merchant Center
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${title} - ${settings.storeName}`,
    description: subtitle,
    publisher: {
      "@type": "OnlineStore",
      name: settings.storeName,
      telephone: settings.phone,
      email: settings.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressLocality: settings.city,
        addressRegion: settings.region,
        addressCountry: "GH",
      },
    },
    ...(policyKey === "returnRefundPolicy"
      ? {
          merchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "GH",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: settings.googleMerchant.returnWindowDays,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
            refundType: "https://schema.org/FullRefund",
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      {/* JSON-LD for Search Engines & Google Merchant Center */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <div className="bg-[#171717] text-white py-10 sm:py-14 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/policies/returns" className="hover:text-white transition">
              Policies
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-orange-400 font-semibold">{title}</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-[#FF8A24] text-[11px] font-bold border border-orange-500/30">
              {badge}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Effective: {lastUpdated}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Document Body */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
            <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
              {content.split("\n\n").map((para, i) => {
                if (para.match(/^[0-9]\./)) {
                  const [heading, ...rest] = para.split("\n");
                  return (
                    <div key={i} className="pt-2">
                      <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                        {heading}
                      </h2>
                      {rest.length > 0 && (
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1.5 whitespace-pre-line">
                          {rest.join("\n")}
                        </p>
                      )}
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Google Merchant Assurance Note */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-3 bg-orange-50/50 p-4 rounded-xl border-orange-100">
              <ShieldCheck className="w-5 h-5 text-[#F26A00] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-700">
                <strong className="font-bold text-slate-900 block mb-0.5">
                  Google Merchant Certified Transparency
                </strong>
                All terms and return conditions are strictly maintained and honored at our verified physical shop in Miaso, Kwahu East, Ghana.
              </div>
            </div>
          </div>

          {/* Sidebar Info & Contact Box */}
          <div className="lg:col-span-4 space-y-5">
            {/* Store Coordinates Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#F26A00] flex items-center justify-center font-black text-sm">
                  AKI
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">{settings.storeName}</h3>
                  <p className="text-[10px] text-gray-500">Verified Ghana Electronics Store</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#F26A00] shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#F26A00] shrink-0" />
                  <span>{settings.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#F26A00] shrink-0" />
                  <span>{settings.email}</span>
                </div>
              </div>

              <a
                href={settings.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Quick Links to Other Policies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                All Store Policies
              </h4>
              {[
                { title: "Return & Refund Policy", href: "/policies/returns" },
                { title: "Cancellation Policy", href: "/policies/cancellation" },
                { title: "Shipping & Delivery", href: "/policies/delivery" },
                { title: "Warranty Protection", href: "/policies/warranty" },
                { title: "Terms & Conditions", href: "/policies/terms" },
                { title: "Privacy Policy", href: "/policies/privacy" },
                { title: "About AKI ADUNI VENTURES", href: "/about" },
                { title: "Frequently Asked Questions", href: "/faq" },
                { title: "Customer Feedback & Reviews", href: "/reviews" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between py-1.5 text-xs text-gray-600 hover:text-[#F26A00] transition"
                >
                  <span>{link.title}</span>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
