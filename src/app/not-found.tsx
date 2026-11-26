import React from "react";
import Link from "next/link";
import { Search, ShoppingBag, ArrowLeft, Home, MessageSquare, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-[#0E1117] text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#F26A00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full mx-auto text-center relative z-10 space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF8A24] text-xs font-black tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Error 404 • Page Not Found</span>
        </div>

        {/* 404 Huge Typography */}
        <div className="relative">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-gray-200 to-gray-600 bg-clip-text text-transparent select-none">
            404
          </h1>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Product or Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            The item or page you are looking for might have been moved, renamed, or is temporarily unavailable in our live inventory.
          </p>
        </div>

        {/* Search Bar for Direct Catalog Discovery */}
        <div className="max-w-md mx-auto">
          <form action="/products" method="GET" className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search phones, laptops, power banks, accessories..."
              className="w-full pl-11 pr-24 py-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition shadow-xl"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white text-xs font-bold transition active:scale-95 shadow-md"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick Nav Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition active:scale-95"
          >
            <Home className="w-4 h-4 text-[#FF8A24]" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] hover:to-[#F26A00] text-white text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-orange-600/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>

          <a
            href="https://wa.me/233551243372?text=Hello%20Aki%20Enterprise,%20I%20am%20looking%20for%20a%20product%20on%20your%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 transition active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Us</span>
          </a>
        </div>
      </div>
    </div>
  );
}
