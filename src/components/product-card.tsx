"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/ecommerce";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { toggleWishlist, isItemInWishlist } from "@/lib/customer-store";
import { ShieldCheck, Plus, BatteryCharging, Heart, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = React.useState(false);

  React.useEffect(() => {
    setIsLiked(isItemInWishlist(product.id));
    const handleUpdate = () => setIsLiked(isItemInWishlist(product.id));
    window.addEventListener("wishlist_updated", handleUpdate);
    return () => window.removeEventListener("wishlist_updated", handleUpdate);
  }, [product.id]);

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Use first variant by default
  const defaultVariant = product.variants[0];
  const conditionBadge = defaultVariant ? getConditionBadge(defaultVariant.condition) : null;

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
          {defaultVariant?.battery_health && (
            <span className="flex items-center gap-1 bg-slate-900/80 text-emerald-400 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
              <BatteryCharging className="w-3 h-3" />
              {defaultVariant.battery_health}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleLike}
          className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-md shadow-xs flex items-center justify-center text-gray-400 hover:text-red-500 transition pointer-events-auto active:scale-90"
          aria-label="Save to wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isLiked ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>
      </div>

      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative w-full aspect-4/3 bg-gray-50 overflow-hidden"
      >
        <Image
          src={product.images[0] || "/placeholder.png"}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

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
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-lg text-slate-900">
                  {formatGHS(defaultVariant ? defaultVariant.price : product.base_price)}
                </span>
                {defaultVariant?.original_price && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatGHS(defaultVariant.original_price)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">
                {defaultVariant?.stock_quantity ? `${defaultVariant.stock_quantity} available` : "Out of stock"}
              </span>
            </div>

            <button
              onClick={() => defaultVariant && addToCart(product, defaultVariant)}
              className="px-3.5 py-1.5 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white font-bold text-xs shadow-xs active:scale-95 transition flex items-center gap-1 shrink-0"
              aria-label="Add to cart"
            >
              <span>Add</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
