"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { Download } from "lucide-react";

interface AuthenticQRProps {
  value: string;
  size?: number;
  centerBadgeText?: string;
  showDownloadButton?: boolean;
  className?: string;
}

export function AuthenticQR({
  value,
  size = 240,
  centerBadgeText = "AKI",
  showDownloadButton = false,
  className = "",
}: AuthenticQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function generateMatrix() {
      try {
        // Generate high resolution QR code with High error correction (level 'H')
        // Level H permits up to 30% damage/logo occlusion while remaining 100% scannable by any phone
        const canvas = document.createElement("canvas");
        canvas.width = size * 2;
        canvas.height = size * 2;

        await QRCode.toCanvas(canvas, value, {
          errorCorrectionLevel: "H",
          width: size * 2,
          margin: 1,
          color: {
            dark: "#171717",
            light: "#FFFFFF",
          },
        });

        // Overlay central Aki Enterprise / TechHub brand badge
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const badgeSize = (size * 2) * 0.22;
          const center = (size * 2) / 2;
          const half = badgeSize / 2;

          // White rounded square background to clear QR dots in center
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(center - half - 4, center - half - 4, badgeSize + 8, badgeSize + 8, 12);
          ctx.fill();

          // Brand Orange gradient badge
          const grad = ctx.createLinearGradient(center - half, center - half, center + half, center + half);
          grad.addColorStop(0, "#F26A00");
          grad.addColorStop(1, "#FF8A24");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(center - half, center - half, badgeSize, badgeSize, 10);
          ctx.fill();

          // Brand Text
          ctx.fillStyle = "#FFFFFF";
          ctx.font = `900 ${Math.round(badgeSize * 0.44)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(centerBadgeText, center, center + 1);
        }

        if (!isCancelled) {
          setQrDataUrl(canvas.toDataURL("image/png"));
        }
      } catch (err) {
        console.error("Authentic QR generation error:", err);
      }
    }

    if (value) {
      generateMatrix();
    }

    return () => {
      isCancelled = true;
    };
  }, [value, size, centerBadgeText]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `aki-enterprise-qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="bg-white p-2.5 rounded-2xl border-2 border-slate-900 shadow-md flex items-center justify-center shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Scannable QR Code"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full animate-pulse bg-gray-100 rounded-xl" />
        )}
      </div>

      {showDownloadButton && qrDataUrl && (
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 hover:text-white font-bold text-[11px] transition"
        >
          <Download className="w-3.5 h-3.5 text-orange-400" />
          <span>Download High-Res PNG</span>
        </button>
      )}
    </div>
  );
}
