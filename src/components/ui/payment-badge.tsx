"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface PaymentBadgeProps {
  channel: "mtn" | "telecel" | "airtel" | "card";
  label?: string;
  className?: string;
}

const CHANNEL_DEFAULTS = {
  mtn: {
    name: "MTN MoMo",
    dotColor: "bg-yellow-400",
    textColor: "text-yellow-400",
    alt: "MTN Mobile Money Ghana",
    imagePath: "/images/payments/mtn.jpg",
  },
  telecel: {
    name: "Telecel Cash",
    dotColor: "bg-red-400",
    textColor: "text-red-400",
    alt: "Telecel Cash Ghana",
    imagePath: "/images/payments/telecel.jpg",
  },
  airtel: {
    name: "ATMoney",
    dotColor: "bg-blue-400",
    textColor: "text-blue-400",
    alt: "AirtelTigo / ATMoney Ghana",
    imagePath: "/images/payments/airtel.png",
  },
  card: {
    name: "Visa / Card",
    dotColor: "bg-emerald-400",
    textColor: "text-emerald-400",
    alt: "Visa Mastercard Payment",
    imagePath: "/images/payments/card.jpg",
  },
};

export function PaymentBadge({ channel, label, className = "" }: PaymentBadgeProps) {
  const config = CHANNEL_DEFAULTS[channel];
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`p-2 rounded-xl bg-[#222222] border border-white/5 flex items-center gap-2 text-xs font-bold transition hover:border-white/10 ${className}`}
    >
      {!imgError ? (
        <span className="relative w-5 h-5 flex items-center justify-center shrink-0">
          <Image
            src={config.imagePath}
            alt={config.alt}
            width={20}
            height={20}
            className="object-contain"
            onError={() => setImgError(true)}
          />
        </span>
      ) : (
        <span className={`w-2 h-2 rounded-full shrink-0 ${config.dotColor}`} />
      )}
      <span className={config.textColor}>{label || config.name}</span>
    </div>
  );
}
