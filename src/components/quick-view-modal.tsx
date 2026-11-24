"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types/ecommerce";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  BatteryCharging,
  MessageCircle,
  ArrowRight,
  Check,
} from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Initialize selected variant and image when product changes
  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0] || null);
      setActiveImageIndex(0);
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product || !selectedVariant) return null;

  const conditionBadge = getConditionBadge(selectedVariant.condition);
  const currentImages = product.images && product.images.length > 0 ? product.images : ["/placeholder.png"];
  const displayImage = currentImages[activeImageIndex] || currentImages[0];

  const handleSelectStorage = (storageSize: string) => {
    const match = product.variants.find(
      (v) => v.storage === storageSize && v.color === selectedVariant.color
    ) || product.variants.find((v) => v.storage === storageSize);
    if (match) {
      setSelectedVariant(match);
      setQuantity(1);
    }
  };

  const handleSelectColor = (colorName: string) => {
    const match = product.variants.find(
      (v) => v.color?.toLowerCase() === colorName.toLowerCase() && v.storage === selectedVariant.storage
    ) || product.variants.find((v) => v.color?.toLowerCase() === colorName.toLowerCase());
    if (match) {
      setSelectedVariant(match);
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const whatsAppMessage = `Hello Aki Enterprise, I am looking at: *${product.title}* (${selectedVariant.storage || ""} ${selectedVariant.color || ""} - ${formatGHS(selectedVariant.price)}). Is this available in stock? Link: https://akiaduniventures.com/product/${product.slug}`;
  const whatsAppUrl = `https://wa.me/233551243372?text=${encodeURIComponent(whatsAppMessage)}`;

  // Extract unique storage and color options
  const storageOptions = Array.from(new Set(product.variants.map((v) => v.storage).filter(Boolean)));
  const colorOptions = Array.from(
    new Set(
      product.variants.map((v) => JSON.stringify({ name: v.color, hex: v.color_hex })).filter(Boolean)
    )
  ).map((str) => JSON.parse(str));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-600 hover:text-slate-900 flex items-center justify-center transition active:scale-90"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Imagery */}
          <div className="p-6 sm:p-8 bg-gray-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
            {/* Main Active Image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-xs mb-4">
              <Image
                src={displayImage}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-contain p-4"
                priority
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-xs ${conditionBadge.className}`}>
                  {conditionBadge.label}
                </span>
                {selectedVariant.battery_health && (
                  <span className="flex items-center gap-1 bg-slate-900/90 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>{selectedVariant.battery_health}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden bg-white border-2 shrink-0 transition ${
                      activeImageIndex === idx ? "border-[#F26A00] ring-2 ring-orange-500/20" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Controls */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand & Category */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span className="text-[#F26A00] uppercase tracking-wider">{product.brand_name}</span>
                <span>{product.category_name}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {product.title}
              </h2>

              {/* Price */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    {formatGHS(selectedVariant.price)}
                  </span>
                  {selectedVariant.original_price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatGHS(selectedVariant.original_price)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full self-start mt-1">
                  {selectedVariant.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Storage Variant Options */}
              {storageOptions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Select Storage:</span>
                  <div className="flex flex-wrap gap-2">
                    {storageOptions.map((st) => (
                      <button
                        key={st as string}
                        type="button"
                        onClick={() => handleSelectStorage(st as string)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                          selectedVariant.storage === st
                            ? "bg-[#171717] text-white border-slate-900 shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {st as string}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Options */}
              {colorOptions.length > 0 && colorOptions.some((c) => c.name) && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Color: <span className="text-gray-500 font-medium">{selectedVariant.color}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleSelectColor(c.name)}
                        className={`w-7 h-7 rounded-full border-2 transition ${
                          selectedVariant.color?.toLowerCase() === c.name.toLowerCase()
                            ? "border-[#F26A00] ring-2 ring-orange-500/30 scale-110"
                            : "border-gray-200 hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex || "#171717" }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Warranty Highlight */}
              {selectedVariant.warranty_months && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-[#F26A00] shrink-0" />
                  <span>Includes {selectedVariant.warranty_months} Months Store Warranty</span>
                </div>
              )}
            </div>

            {/* Actions & Quantity */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 hover:text-orange-600 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(selectedVariant.stock_quantity, quantity + 1))}
                    disabled={quantity >= selectedVariant.stock_quantity}
                    className="p-1.5 hover:text-orange-600 disabled:opacity-40 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={selectedVariant.stock_quantity === 0}
                  className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs shadow-md transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-[#F26A00] hover:bg-[#d95e00] text-white shadow-orange-600/30"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 animate-in zoom-in-50 duration-200" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart ({quantity})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition"
                >
                  <span>Full Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
