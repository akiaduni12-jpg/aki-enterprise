"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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

import AeroShards from "@/components/ui/AeroShards";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [shardsActive, setShardsActive] = useState(true);

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
              <div className="w-9 h-9 rounded-xl bg-[#F26A00]/15 border border-[#F26A00]/30 flex items-center justify-center text-[#FF8A24] font-black text-sm">
                TH
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

      {/* 2. MAIN FOOTER CANVAS WITH AERO SHARDS 3D ANIMATION */}
      <div className="relative min-h-[560px] bg-[#141414]">
        {/* Interactive AeroShards 3D Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <AeroShards
            shardColor="#F26A00"
            accentColor="#FF8A24"
            count={150}
            shardSize={1.8}
            speed={1.0}
            mouseInteraction={true}
            mouseStrength={0.85}
          />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12 pointer-events-auto">
          {/* AeroShards Live Indicator & Interactive Prompt */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#F26A00] animate-pulse" />
              <span className="font-bold text-white">AeroShards 3D</span>
              <span className="text-gray-400">• Move cursor to tilt crystal shards, click to ripple</span>
            </div>

            <div className="text-[10px] text-gray-500 font-mono hidden sm:block">
              React Bits 3D Crystal Shard Engine
            </div>
          </div>
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
                      TechHub Electronics • Ghana
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
                  <span>Physical Store: Accra, Greater Accra Region, Ghana</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#FF8A24] shrink-0" />
                  <span>+233 24 123 4567 / +233 50 000 0000</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#FF8A24] shrink-0" />
                  <span>support@techhubghana.com</span>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
                  Connect With Us
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#F26A00]/20 hover:text-[#FF8A24] border border-white/10 flex items-center justify-center transition"
                    title="Facebook"
                  >
                    f
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#F26A00]/20 hover:text-[#FF8A24] border border-white/10 flex items-center justify-center transition"
                    title="Instagram"
                  >
                    ig
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#F26A00]/20 hover:text-[#FF8A24] border border-white/10 flex items-center justify-center transition"
                    title="TikTok"
                  >
                    tk
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#F26A00]/20 hover:text-[#FF8A24] border border-white/10 flex items-center justify-center transition"
                    title="X (Twitter)"
                  >
                    𝕏
                  </a>
                  <a
                    href="https://wa.me/233241234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition"
                    title="WhatsApp Direct Support"
                  >
                    wa
                  </a>
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
                  <Link href="/track" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#F26A00]" />
                    <span>Track Your Order</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/qr" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <QrCode className="w-3 h-3 text-[#F26A00]" />
                    <span>Scan & Shop in Store</span>
                  </Link>
                </li>
                <li>
                  <Link href="/policies/warranty" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-[#F26A00]" />
                    <span>Warranty & Returns</span>
                  </Link>
                </li>
                <li>
                  <Link href="/policies/delivery" className="hover:text-[#FF8A24] transition flex items-center gap-1.5">
                    <Truck className="w-3 h-3 text-[#F26A00]" />
                    <span>Delivery & Pickup</span>
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
                <div className="p-2 rounded-xl bg-[#222222] border border-white/5 flex items-center gap-2 text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span>MTN MoMo</span>
                </div>
                <div className="p-2 rounded-xl bg-[#222222] border border-white/5 flex items-center gap-2 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Telecel Cash</span>
                </div>
                <div className="p-2 rounded-xl bg-[#222222] border border-white/5 flex items-center gap-2 text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>ATMoney</span>
                </div>
                <div className="p-2 rounded-xl bg-[#222222] border border-white/5 flex items-center gap-2 text-gray-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Visa / Card</span>
                </div>
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
              © 2026 <strong className="text-gray-300">Aki Enterprise</strong> ("TechHub"). All rights reserved.
            </p>

            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/policies/terms" className="hover:text-gray-300 transition">
                Terms & Conditions
              </Link>
              <span>•</span>
              <Link href="/policies/privacy" className="hover:text-gray-300 transition">
                Privacy Notice
              </Link>
              <span>•</span>
              <Link href="/policies/warranty" className="hover:text-gray-300 transition">
                Ghana Warranty Protection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
