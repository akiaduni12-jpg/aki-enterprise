"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Smartphone,
  Zap,
  Tag,
  Package,
  Heart,
  MessageCircle,
  Phone,
  HelpCircle,
  Star,
  Download,
  X,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Layers,
} from "lucide-react";

export function MobileAppLauncher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Brief native-feeling splash animation on first mobile load per session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const seenSplash = sessionStorage.getItem("aki_splash_shown");
      if (isMobile && !seenSplash) {
        setShowSplash(true);
        sessionStorage.setItem("aki_splash_shown", "true");
        const timer = setTimeout(() => setShowSplash(false), 900);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <>
      {/* 1. Mobile App Splash Launch Screen (First open per session) */}
      {showSplash && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#0F1115] text-white flex flex-col items-center justify-center p-6 animate-out fade-out duration-300">
          <div className="relative w-20 h-20 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/30 mb-4 animate-in zoom-in-75 duration-300">
            <Image
              src="/icons/icon-192.png"
              alt="AKI ADUNI VENTURES"
              fill
              priority
              className="object-cover"
            />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white font-sans animate-in fade-in duration-300">
            AKI <span className="text-[#F26A00]">ADUNI</span> VENTURES
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Authentic Electronics &amp; Smart Devices • Ghana
          </p>
          <div className="w-32 h-1 bg-gray-800 rounded-full mt-6 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[#F26A00] to-[#FF8A24] animate-pulse" />
          </div>
        </div>
      )}

      {/* 2. Floating Quick Launcher Trigger Pill (Mobile screens only, above bottom nav) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-20 right-3.5 z-35 flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#171717] text-white border border-orange-500/40 shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
        aria-label="Open App Launcher"
      >
        <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
          <Image
            src="/icons/icon-192.png"
            alt="Launcher"
            fill
            className="object-cover"
          />
        </div>
        <span className="text-[11px] font-black text-[#FF8A24] tracking-tight">Launcher</span>
      </button>

      {/* 3. Full Mobile App Launcher Bottom Sheet / Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Launcher Panel */}
          <div className="relative z-10 bg-[#12141A] text-white rounded-t-3xl border-t border-white/10 p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Top Drag Handle & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm">
                  <Image
                    src="/icons/icon-192.png"
                    alt="AKI ADUNI VENTURES"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white tracking-tight">
                    AKI ADUNI VENTURES
                  </h3>
                  <p className="text-[10px] text-gray-400">Mobile App Launcher</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Launcher App Grid (9 Essential Shortcuts) */}
            <div className="grid grid-cols-3 gap-2.5 pt-4">
              {/* Shortcut 1: Smartphones */}
              <Link
                href="/products?category=smartphones"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF8A24] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-200">Smartphones</span>
              </Link>

              {/* Shortcut 2: Chargers & Cables */}
              <Link
                href="/products?category=power-banks-chargers"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-200">Power &amp; PD</span>
              </Link>

              {/* Shortcut 3: Deals & Flash Sales */}
              <Link
                href="/products?featured=true"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-200">Deals</span>
              </Link>

              {/* Shortcut 4: Track Order */}
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-200">Track Order</span>
              </Link>

              {/* Shortcut 5: Wishlist */}
              <Link
                href="/wishlist"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-200">Wishlist</span>
              </Link>

              {/* Shortcut 6: FAQ */}
              <Link
                href="/faq"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-200">FAQ</span>
              </Link>

              {/* Shortcut 7: Customer Reviews */}
              <Link
                href="/reviews"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-200">Reviews</span>
              </Link>

              {/* Shortcut 8: WhatsApp Sales */}
              <a
                href="https://wa.me/233551243372?text=Hello%20AKI%20ADUNI%20VENTURES%2C%20I%20am%20inquirying%20about%20device%20stock."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/40 text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-200">WhatsApp</span>
              </a>

              {/* Shortcut 9: Direct Call */}
              <a
                href="tel:0551243372"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-200">Call Shop</span>
              </a>
            </div>

            {/* In-Store Counter Info Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-[#FF8A24] shrink-0" />
                <div>
                  <span className="font-bold text-white block">Miaso Shop Counter</span>
                  <span className="text-[10px] text-gray-400">Kwahu East, Eastern Region</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Open Mon-Sat
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
