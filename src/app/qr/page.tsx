"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthenticQR } from "@/components/ui/authentic-qr";
import { ChevronLeft, Download, ShoppingBag, Sparkles } from "lucide-react";

export default function ScanAndShopQRPage() {
  const router = useRouter();
  const storeUrl = typeof window !== "undefined" ? window.location.origin : "https://techhubghana.com";

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Golden-orange ambient glow effects matching Screen 9 */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F26A00]/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#FF8A24]/20 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-[#F26A00]/25 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">
          In-Store Express
        </span>

        <div className="w-10" />
      </div>

      {/* Center QR Showcase */}
      <div className="relative z-10 max-w-sm mx-auto text-center space-y-6 my-auto py-4">
        {/* Title & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-[#FF8A24] border border-orange-500/30 text-[11px] font-black uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart QR Retail</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            Scan &amp; Shop
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xs mx-auto leading-relaxed">
            Use this QR code to visit our store and order instantly!
          </p>
        </div>

        {/* Authentic Scannable QR Code Card */}
        <div className="p-5 rounded-3xl bg-white text-slate-900 shadow-2xl shadow-orange-500/20 inline-block border-4 border-orange-500/30">
          <AuthenticQR
            value={storeUrl}
            size={220}
            centerBadgeText="TH"
            showDownloadButton={false}
          />
        </div>

        {/* Download QR Button */}
        <div>
          <button
            onClick={() => {
              // Trigger QR code download
              const canvas = document.querySelector("canvas");
              if (canvas) {
                const a = document.createElement("a");
                a.href = canvas.toDataURL("image/png");
                a.download = "techhub-scan-and-shop-qr.png";
                a.click();
              }
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] hover:to-[#F26A00] text-white font-black text-sm shadow-xl shadow-orange-600/40 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download QR</span>
          </button>
        </div>
      </div>

      {/* Screen 9 Footer: Powered by TechHub */}
      <div className="relative z-10 text-center pb-2">
        <p className="text-xs font-semibold text-gray-400">
          Powered by <span className="text-[#FF8A24] font-bold">TechHub</span> • Aki Enterprise
        </p>
      </div>
    </div>
  );
}
