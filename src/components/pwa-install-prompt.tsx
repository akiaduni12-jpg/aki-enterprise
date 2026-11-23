"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Smartphone, Check } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Aki Enterprise PWA Service Worker active:", reg.scope))
        .catch((err) => console.warn("PWA Service Worker notice:", err));
    }

    // Check if app is already running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Capture Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = localStorage.getItem("techhub_pwa_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If on iOS and not dismissed, show prompt after 4 seconds
    if (isAppleDevice && !localStorage.getItem("techhub_pwa_dismissed")) {
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("techhub_pwa_dismissed", "true");
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 bg-[#171717] text-white p-4 rounded-3xl shadow-2xl border border-orange-500/40 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-md">
            <Image
              src="/icons/logo-icon.webp"
              alt="Aki Enterprise"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black tracking-tight text-white">
                Install Aki Enterprise App
              </h4>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-orange-500/20 text-[#FF8A24] border border-orange-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-gray-300 mt-0.5 leading-tight">
              {isIOS
                ? "Tap Share [⎋] then select 'Add to Home Screen [+]'"
                : "Fast 1-tap ordering, offline receipts & MoMo checkout"}
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white p-1"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isIOS && deferredPrompt && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Web App</span>
          </button>
          <button
            onClick={handleDismiss}
            className="py-2 px-3 text-xs text-gray-400 hover:text-white font-medium"
          >
            Later
          </button>
        </div>
      )}
    </div>
  );
}
