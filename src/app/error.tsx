"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, MessageSquare } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-[#0E1117] text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="max-w-lg w-full mx-auto text-center relative z-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-[#FF8A24] flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Something Went Wrong
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            We encountered a temporary technical glitch while loading this page. Please try refreshing or return to the main storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] hover:to-[#F26A00] text-white text-xs font-black flex items-center gap-2 transition active:scale-95 shadow-lg shadow-orange-600/25 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition active:scale-95"
          >
            <Home className="w-4 h-4 text-[#FF8A24]" />
            <span>Back to Home</span>
          </Link>

          <a
            href="https://wa.me/233551243372?text=Hello%20Aki%20Enterprise,%20I%20noticed%20an%20error%20on%20the%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 transition active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Help</span>
          </a>
        </div>
      </div>
    </div>
  );
}
