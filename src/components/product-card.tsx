"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/ecommerce";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { toggleWishlist, isItemInWishlist } from "@/lib/customer-store";
import { ShieldCheck, Plus, BatteryCharging, Heart, ShoppingBag, Check, Eye } from "lucide-react";
import { QuickViewModal } from "@/components/quick-view-modal";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = React.useState(false);
  const [isHeartPopping, setIsHeartPopping] = React.useState(false);
  const [isJustAdded, setIsJustAdded] = React.useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);

  React.useEffect(() => {
    setIsLiked(isItemInWishlist(product.id));
    const handleUpdate = () => setIsLiked(isItemInWishlist(product.id));
    window.addEventListener("wishlist_updated", handleUpdate);
    return () => window.removeEventListener("wishlist_updated", handleUpdate);
  }, [product.id]);

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartPopping(true);
    toggleWishlist(product.id);
    setTimeout(() => setIsHeartPopping(false), 500);
  };

  const handleQuickAdd = () => {
    if (!defaultVariant) return;
    addToCart(product, defaultVariant);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1200);
  };

  // Use first variant by default
  const defaultVariant = product.variants[0];
  const conditionBadge = defaultVariant ? getConditionBadge(defaultVariant.condition) : null;
  const hasBatteryHealth =
    Boolean(defaultVariant?.battery_health && defaultVariant.battery_health.trim()) &&
    defaultVariant!.battery_health!.trim().toLowerCase() !== "n/a" &&
    defaultVariant!.battery_health!.trim().toLowerCase() !== "none" &&
    defaultVariant!.condition !== "brand_new";

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Badges Container */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {conditionBadge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs backdrop-blur-md ${conditionBadge.className}`}
            >
              {conditionBadge.label}
            </span>
          )}
          {hasBatteryHealth && (
            <span className="flex items-center gap-1 bg-slate-900/80 text-emerald-400 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
              <BatteryCharging className="w-3 h-3" />
              {defaultVariant?.battery_health}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleLike}
          className={`w-7 h-7 rounded-full bg-white/90 backdrop-blur-md shadow-xs flex items-center justify-center text-gray-400 hover:text-red-500 transition-all duration-200 pointer-events-auto active:scale-90 hover:scale-110 ${
            isHeartPopping ? "animate-heart-pop" : ""
          }`}
          aria-label="Save to wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors duration-200 ${
              isLiked ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>
      </div>

      {/* Product Image with Quick View Trigger */}
      <div className="relative w-full aspect-4/3 bg-gray-50 overflow-hidden">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 block cursor-pointer"
        >
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>

        {/* Desktop Quick View Button on Hover */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-bold backdrop-blur-md shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#FF8A24]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
            <span>{product.brand_name}</span>
            <span>{product.category_name}</span>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:text-orange-600 transition">
              {product.title}
            </h3>
          </Link>

          {/* Key Specs / Variant Options Preview */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.variants.map((v) => (
              <span
                key={v.id}
                className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium"
              >
                {v.storage || v.color}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing, Warranty & CTA */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col gap-2">
          {defaultVariant?.warranty_months && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>{defaultVariant.warranty_months} Months Store Warranty</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  {formatGHS(defaultVariant ? defaultVariant.price : product.base_price)}
                </span>
                {defaultVariant?.original_price && (
                  <span className="text-xs text-gray-400 line-through -mt-0.5">
                    {formatGHS(defaultVariant.original_price)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                {defaultVariant?.stock_quantity ? `${defaultVariant.stock_quantity} available` : "Out of stock"}
              </span>
            </div>

            <button
              onClick={handleQuickAdd}
              className={`w-9 h-9 rounded-xl font-bold text-xs shadow-xs active:scale-90 transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer ${
                isJustAdded
                  ? "bg-emerald-600 text-white scale-105"
                  : "bg-[#F26A00] hover:bg-[#d95e00] text-white"
              }`}
              title="Add to Cart"
              aria-label="Add to cart"
            >
              {isJustAdded ? (
                <Check className="w-4 h-4 animate-in zoom-in-50 duration-200" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
}
