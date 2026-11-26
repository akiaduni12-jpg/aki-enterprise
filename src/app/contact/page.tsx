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
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Device Stock & Availability",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    }, 500);
  };

  const whatsAppDirectUrl = `https://wa.me/233551243372?text=${encodeURIComponent(
    `Hello Aki Enterprise, my name is ${formData.name || "Customer"}. I am inquiring about: ${formData.subject}. ${
      formData.message ? `Details: ${formData.message}` : ""
    }`
  )}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Schema.org LocalBusiness & ContactPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact AKI ADUNI VENTURES",
            url: "https://akiaduniventures.com/contact",
            mainEntity: {
              "@type": "LocalBusiness",
              name: "AKI ADUNI VENTURES",
              telephone: "+233551243372",
              email: "support@akiaduniventures.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Miaso Near The Market",
                addressLocality: "Kwahu East",
                addressRegion: "Eastern Region",
                postalCode: "EF35051780",
                addressCountry: "GH",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  opens: "07:30",
                  closes: "22:30",
                },
              ],
            },
          }),
        }}
      />

      {/* Header Banner */}
      <div className="bg-[#141414] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-white font-medium">Contact</span>
          </nav>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
              Contact AKI ADUNI VENTURES
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Official customer care for AKI ADUNI VENTURES (Trading as Aki Enterprise • Reg ID: 2118270). Inquire about device stock, battery health verification, express delivery across Ghana, or warranty service.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Quick Contact Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Phone */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Call Us
              </span>
              <a
                href="tel:0551243372"
                className="text-sm font-black text-slate-900 hover:text-[#F26A00] transition block mt-0.5"
              >
                0551243372
              </a>
              <span className="text-[11px] text-gray-500 block mt-0.5">Mon–Sat, 8am – 7pm</span>
            </div>
          </div>

          {/* 2. WhatsApp */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                WhatsApp Chat
              </span>
              <a
                href="https://wa.me/233551243372"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-black text-slate-900 hover:text-emerald-600 transition block mt-0.5"
              >
                0551243372
              </a>
              <span className="text-[11px] text-gray-500 block mt-0.5">Fastest response</span>
            </div>
          </div>

          {/* 3. Location */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Store Location
              </span>
              <span className="text-sm font-black text-slate-900 block mt-0.5">
                Miaso, Kwahu East
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">Eastern Region, Ghana</span>
            </div>
          </div>

          {/* 4. Email */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Email
              </span>
              <a
                href="mailto:support@akiaduniventures.com"
                className="text-sm font-black text-slate-900 hover:text-[#F26A00] transition block mt-0.5 truncate max-w-[200px]"
              >
                support@akiaduniventures.com
              </a>
              <span className="text-[11px] text-gray-500 block mt-0.5">Orders &amp; inquiries</span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Inquiry Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Send an Inquiry
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fill in the details below and we will get back to you shortly.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">Message Sent</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  Thank you, <span className="font-bold text-slate-900">{formData.name}</span>. We have received your message regarding &ldquo;{formData.subject}&rdquo;.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={whatsAppDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Also Open in WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        phone: "",
                        email: "",
                        subject: "Device Stock & Availability",
                        message: "",
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
                  >
                    Send Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kwame Mensah"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0551243372"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="customer@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition"
                    >
                      <option value="Device Stock & Availability">Device Stock &amp; Availability</option>
                      <option value="Battery Health & Condition">Battery Health &amp; Condition Photos</option>
                      <option value="Delivery to My Town">Delivery Cost &amp; Timeline</option>
                      <option value="Order Status & Tracking">Order Status &amp; Tracking</option>
                      <option value="Warranty Claim or Return">Warranty Claim or Return</option>
                      <option value="Other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what phone, charger, or accessory you are looking for..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition resize-y"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
                  </button>

                  <a
                    href="https://wa.me/233551243372"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Chat on WhatsApp Directly</span>
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Store Hours & Delivery Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct WhatsApp Action Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Need Quick Photos or Video?</h3>
                  <p className="text-xs text-gray-400">Chat with our sales team on WhatsApp</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Before purchasing a UK-used iPhone or laptop, you can ask for physical photos, 3uTools battery health test screenshots, and exact serial numbers.
              </p>

              <a
                href="https://wa.me/233551243372"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-98 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp (0551243372)</span>
              </a>
            </div>

            {/* Business Hours Table */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <Clock className="w-4 h-4 text-[#F26A00]" />
                <h3 className="text-sm font-black text-slate-900">Store Hours</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Sunday – Friday</span>
                  <span className="font-bold text-slate-900">7:30 AM – 10:30 PM</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500">Saturday</span>
                  <span className="font-bold text-red-600">Closed</span>
                </div>
              </div>
            </div>

            {/* Delivery & Dispatch Summary */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <Truck className="w-4 h-4 text-[#F26A00]" />
                <h3 className="text-sm font-black text-slate-900">Delivery Information</h3>
              </div>

              <div className="space-y-2">
                <p>
                  <strong className="text-slate-900">Accra &amp; Regional Capitals:</strong> Same-day dispatch for orders confirmed before 2:00 PM.
                </p>
                <p>
                  <strong className="text-slate-900">Nationwide Ghana:</strong> 24–48 hours via VIP, OA, and tracked regional couriers.
                </p>
                <p>
                  <strong className="text-slate-900">In-Store Pickup:</strong> Available free of charge at our shop in Miaso, Kwahu East.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
