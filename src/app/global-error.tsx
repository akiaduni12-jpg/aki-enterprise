"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Fatal App Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0E1117] text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">System Error</h1>
            <p className="text-xs text-gray-400">
              An unexpected system interruption occurred. Please click below to reset or reload.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-[#F26A00] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset &amp; Reload</span>
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Storefront</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
