"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStoreSettings, StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings-store";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  Store,
  ShieldCheck,
  Truck,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Order Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSettings(getStoreSettings());
    const handleUpdate = () => setSettings(getStoreSettings());
    window.addEventListener("settings_updated", handleUpdate);
    return () => window.removeEventListener("settings_updated", handleUpdate);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const whatsAppDirectUrl = `https://wa.me/233551243372?text=${encodeURIComponent(
    `Hello Aki Enterprise, my name is ${formData.name || "a customer"}. Subject: ${formData.subject}. ${
      formData.message ? `Message: ${formData.message}` : "I would like to inquire about devices and delivery."
    }`
  )}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      {/* Schema.org LocalBusiness & ContactPage for Google Merchant Center */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact Aki Enterprise",
            url: "https://akienterprise.com/contact",
            mainEntity: {
              "@type": "LocalBusiness",
              name: "Aki Enterprise",
              telephone: "+233551243372",
              email: "support@akienterprise.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Miaso",
                addressLocality: "Kwahu East",
                addressRegion: "Eastern Region",
                addressCountry: "GH",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  opens: "08:00",
                  closes: "19:00",
                },
              ],
            },
          }),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Header Breadcrumbs & Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 text-[#F26A00] text-xs font-black tracking-wide border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F26A00] animate-pulse" />
            <span>Customer Care &amp; Store Coordinates</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Get in Touch with <span className="text-[#F26A00]">Aki Enterprise</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Have questions about smartphone stock, battery health verification, delivery to your town, or placing a wholesale order? Reach our team in Miaso, Kwahu East.
          </p>
        </div>

        {/* 3 Direct Quick-Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Phone & Calls */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 shadow-xs hover:shadow-lg transition-all space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#F26A00] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Direct Calls
              </span>
              <h3 className="text-base font-black text-slate-900">0551243372</h3>
              <p className="text-xs text-gray-500 mt-1">
                Mon - Sat: 8:00 AM - 7:00 PM for live inventory &amp; order updates.
              </p>
            </div>
            <a
              href="tel:0551243372"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F26A00] hover:text-[#d95e00] pt-1"
            >
              <span>Call Store Line</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 2. WhatsApp Direct */}
          <div className="p-5 sm:p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs hover:shadow-lg transition-all space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-semibold block">
                Instant Chat &amp; Photos
              </span>
              <h3 className="text-base font-black text-slate-900">WhatsApp Support</h3>
              <p className="text-xs text-gray-600 mt-1">
                Request live photos of UK-used devices, battery health screens, or MoMo payment receipts.
              </p>
            </div>
            <a
              href="https://wa.me/233551243372"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-1"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 3. Physical Store Coordinates */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 shadow-xs hover:shadow-lg transition-all space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Store Location
              </span>
              <h3 className="text-base font-black text-slate-900">Miaso, Kwahu East</h3>
              <p className="text-xs text-gray-500 mt-1">
                Eastern Region, Ghana. Certified pick-up point &amp; nationwide courier dispatch.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 pt-1">
              <span>Ghana Nationwide Dispatch</span>
            </span>
          </div>
        </div>

        {/* Main Content: Contact Form + Store Information */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Send Us a Message
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fill out the form below and our operations desk will reply within 30 minutes during shop hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Message Received!</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  Thank you, <span className="font-bold text-slate-900">{formData.name}</span>. We have logged your inquiry regarding &ldquo;{formData.subject}&rdquo;.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={whatsAppDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Also Send to WhatsApp (0551243372)</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        phone: "",
                        email: "",
                        subject: "Order Inquiry",
                        message: "",
                      });
                    }}
                    className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
                  >
                    Send Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kwame Mensah"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F26A00]/20 focus:border-[#F26A00] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Phone Number (Calls / WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0551243372"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F26A00]/20 focus:border-[#F26A00] transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. customer@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F26A00]/20 focus:border-[#F26A00] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Inquiry Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F26A00]/20 focus:border-[#F26A00] transition"
                    >
                      <option value="Order Inquiry">Order Status &amp; Tracking</option>
                      <option value="Product Availability">Device Stock &amp; Battery Health</option>
                      <option value="Delivery to My Town">Delivery Cost &amp; Timeline</option>
                      <option value="Warranty & Returns">Warranty Claim / Return</option>
                      <option value="Wholesale & Bulk">Wholesale &amp; Bulk Purchasing</option>
                      <option value="Other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Specify the iPhone model, laptop specs, power bank capacity, or delivery destination you are asking about..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F26A00]/20 focus:border-[#F26A00] transition"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] hover:to-[#F26A00] text-white font-black text-xs shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Sending Message..." : "Submit Message"}</span>
                  </button>

                  <a
                    href="https://wa.me/233551243372"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Or Chat on WhatsApp Directly</span>
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* Right: Operational Details & FAQs (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Store Hours & Dispatch Schedule */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-[#FF8A24] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black tracking-tight">Hours &amp; Courier Dispatch</h3>
              </div>

              <div className="space-y-2.5 text-xs border-y border-white/10 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Monday - Friday</span>
                  <span className="font-bold text-white">8:00 AM - 7:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Saturday</span>
                  <span className="font-bold text-white">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sunday</span>
                  <span className="font-bold text-orange-400">WhatsApp Inquiries Only</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-[#FF8A24] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Accra Delivery:</strong> Same-day dispatch for orders confirmed before 2:00 PM.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Ghana Nationwide:</strong> 24 to 48 hours via VIP, OA, and tracked regional parcel services.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Answers Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#F26A00]" />
                <h4 className="text-sm font-black text-slate-900">Frequently Asked Questions</h4>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="font-bold text-slate-900 mb-0.5">Can I test before paying?</p>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Yes! In-person pickup at Miaso or doorstep delivery in selected Accra zones permits package inspection before signing.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="font-bold text-slate-900 mb-0.5">What is the warranty period?</p>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Brand-new devices carry 12 months manufacturer warranty. Grade-A UK-used iPhones carry a 3-month shop warranty covering logic boards, face ID, and components.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
