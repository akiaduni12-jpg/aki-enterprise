"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface SocialIconProps {
  platform: "facebook" | "instagram" | "tiktok" | "x" | "whatsapp";
  href: string;
  className?: string;
  title?: string;
}

const PLATFORM_CONFIG = {
  facebook: {
    name: "Facebook",
    short: "f",
    imagePath: "/images/social/facebook.jpg",
    defaultHover: "hover:text-blue-400 hover:border-blue-400/40",
  },
  instagram: {
    name: "Instagram",
    short: "ig",
    imagePath: "/images/social/ig.jpg",
    defaultHover: "hover:text-pink-400 hover:border-pink-400/40",
  },
  tiktok: {
    name: "TikTok",
    short: "tk",
    imagePath: "/images/social/tiktok.jpg",
    defaultHover: "hover:text-cyan-400 hover:border-cyan-400/40",
  },
  x: {
    name: "X (Twitter)",
    short: "𝕏",
    imagePath: "/images/social/x.jpg",
    defaultHover: "hover:text-white hover:border-white/40",
  },
  whatsapp: {
    name: "WhatsApp",
    short: "wa",
    imagePath: "/images/social/whatsapp.jpg",
    defaultHover: "hover:text-emerald-400 hover:border-emerald-400/40",
  },
};

export function SocialIcon({ platform, href, className = "", title }: SocialIconProps) {
  const config = PLATFORM_CONFIG[platform];
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition overflow-hidden ${config.defaultHover} ${className}`}
      title={title || config.name}
    >
      {!imgError ? (
        <span className="relative w-4 h-4 flex items-center justify-center">
          <Image
            src={config.imagePath}
            alt={config.name}
            width={16}
            height={16}
            className="object-contain"
            onError={() => setImgError(true)}
          />
        </span>
      ) : (
        <span className="font-bold text-xs select-none">{config.short}</span>
      )}
    </a>
  );
}
