"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getStoreSettings, StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings-store";
import { PaymentBadge } from "@/components/ui/payment-badge";
import { SocialIcon } from "@/components/ui/social-icon";
import {
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Truck,
  RefreshCw,
  QrCode,
  ArrowRight,
  Send,
  CheckCircle2,
  Lock,
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  React.useEffect(() => {
    const updateSettings = () => {
      setSettings(getStoreSettings());
    };
    updateSettings();
    window.addEventListener("settings_updated", updateSettings);
    return () => window.removeEventListener("settings_updated", updateSettings);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-[#171717] text-gray-300 overflow-hidden">
      {/* 1. TOP NEWSLETTER STRIP (Flowing wave transition inspired by desktop mockup) */}
      <div className="relative z-10 border-b border-white/10 bg-[#121212]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: Icon & Callout */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F26A00] to-[#FF8A24] text-white flex items-center justify-center shadow-lg shadow-orange-600/30 shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Join Our Newsletter
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Get flash sales, restock alerts and exclusive deals straight to your inbox.
                </p>
              </div>
            </div>

            {/* Center: Subscribe Form */}
            <form
              onSubmit={handleSubscribe}
              className="w-full max-w-md relative flex items-center"
            >
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-32 py-3 rounded-full bg-[#1c1c1c] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] hover:to-[#F26A00] text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <span>{subscribed ? "Subscribed!" : "Subscribe"}</span>
                {subscribed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </form>

            {/* Right: Brand Lockup */}
            <div className="hidden xl:flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F26A00]/15 border border-[#F26A00]/30 flex items-center justify-center text-[#FF8A24] font-black text-xs">
                AKI
              </div>
              <div>
                <div className="text-sm font-black text-white tracking-tight">
                  AKI <span className="text-[#FF8A24]">ENTERPRISE</span>
                </div>
                <div className="text-[10px] text-gray-400 -mt-0.5 uppercase tracking-wider font-semibold">
                  Shop Smart. Live Better.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="relative bg-[#141414] overflow-hidden">
        {/* Subtle Ambient CSS Glows (Lightweight & High Performance) */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F26A00]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#FF8A24]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-12 pointer-events-auto">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            {/* Column 1: Brand Info & Contact (4 Cols) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="space-y-2">
                <Link href="/" className="inline-flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F26A00] to-[#FF8A24] flex items-center justify-center text-white font-black text-base shadow-md shadow-orange-600/30">
                    A
                  </div>
                  <div>
                    <span className="text-xl font-black tracking-tight text-white font-sans">
                      AKI <span className="text-[#FF8A24]">ENTERPRISE</span>
                    </span>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                      Original Electronics &amp; Accessories • Ghana
                    </span>
                  </div>
                </Link>
                <p className="text-xs text-gray-400 leading-relaxed max-w-sm pt-2">
                  Your certified destination for genuine smartphones, original PD chargers, high-capacity power banks, and computer electronics. Every device includes transparent battery health ratings and shop warranty.
                </p>
              </div>

              {/* Direct Store Coordinates */}
              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#FF8A24] shrink-0 mt-0.5" />
                  <span>Physical Store: {settings.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#FF8A24] shrink-0" />
                  <span>{settings.phone} (Direct &amp; WhatsApp)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#FF8A24] shrink-0" />
                  <span>{settings.email}</span>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
                  Connect With Us
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <SocialIcon platform="facebook" href={settings.socials.facebook} />
                  <SocialIcon platform="instagram" href={settings.socials.instagram} />
                  <SocialIcon platform="tiktok" href={settings.socials.tiktok} />
                  <SocialIcon platform="x" href={settings.socials.x} />
                  <SocialIcon platform="whatsapp" href={settings.socials.whatsapp} />
                </div>
              </div>
            </div>

            {/* Column 2: Electronics Categories (3 Cols) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A24]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Shop Categories
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>
                  <Link href="/products?category=smartphones" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>Smartphones (iPhone & Android)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=smartphones&condition=uk_used" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>Tested UK-Used Grade A</span>
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=power-banks-chargers" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>Power Banks & 20W/65W PD</span>
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=audio-earbuds" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>Earbuds & Bluetooth Speakers</span>
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=smartwatches" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>Smart Watches & Fitness Bands</span>
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=computer-accessories" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>Computer RAM, SSD & Cables</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Care & Services (2.5 Cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A24]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Customer Hub
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>
                  <Link href="/orders" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>Track Your Order</span>
                  </Link>
                </li>
                <li>
                  <Link href="/policies/returns" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 text-[#F26A00]" />
                    <span>Return &amp; Refund Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/policies/warranty" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-[#F26A00]" />
                    <span>Warranty &amp; Authenticity</span>
                  </Link>
                </li>
                <li>
                  <Link href="/policies/delivery" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <Truck className="w-3 h-3 text-[#F26A00]" />
                    <span>Delivery &amp; Pickup</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>About Aki Enterprise</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/dashboard" className="hover:text-[#FF8A24] transition flex items-center gap-1.5 text-orange-400/90 font-medium">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>Staff Portal</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Payment Badges & Security (2.5 Cols) */}
            <div className="lg:col-span-3 space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A24]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Payment Channels
                </h4>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Fast, verified checkouts powered by Paystack for Ghana:
              </p>

              {/* Payment Tags */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <PaymentBadge channel="mtn" />
                <PaymentBadge channel="telecel" />
                <PaymentBadge channel="airtel" />
                <PaymentBadge channel="card" />
              </div>

              {/* Security Shield */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-white/5 to-white/2 border border-white/10 flex items-center gap-3 text-[11px] text-gray-300">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <p className="leading-snug">
                  <strong className="text-white block font-semibold">256-Bit SSL Encrypted</strong>
                  Safe online payments. Cash & POS accepted for shop pickup.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>
              © 2026 <strong className="text-gray-300">Aki Enterprise</strong>. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
              <Link href="/about" className="hover:text-gray-300 transition">
                About Us
              </Link>
              <span>•</span>
              <Link href="/policies/returns" className="hover:text-gray-300 transition">
                Return &amp; Refund Policy
              </Link>
              <span>•</span>
              <Link href="/policies/delivery" className="hover:text-gray-300 transition">
                Delivery Policy
              </Link>
              <span>•</span>
              <Link href="/policies/warranty" className="hover:text-gray-300 transition">
                Warranty Protection
              </Link>
              <span>•</span>
              <Link href="/policies/terms" className="hover:text-gray-300 transition">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/policies/privacy" className="hover:text-gray-300 transition">
                Privacy Notice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
