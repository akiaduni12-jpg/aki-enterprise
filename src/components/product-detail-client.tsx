"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types/ecommerce";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { ProductReviews } from "@/components/product-reviews";
import { toggleWishlist, isItemInWishlist } from "@/lib/customer-store";
import {
  ShieldCheck,
  Truck,
  Store,
  BatteryCharging,
  CheckCircle2,
  Plus,
  Minus,
  MessageCircle,
  Share2,
  ArrowLeft,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0] || ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart();

  const conditionBadge = getConditionBadge(selectedVariant.condition);
  const [isLiked, setIsLiked] = useState(false);

  React.useEffect(() => {
    setIsLiked(isItemInWishlist(product.id));
    const handleUpdate = () => setIsLiked(isItemInWishlist(product.id));
    window.addEventListener("wishlist_updated", handleUpdate);
    return () => window.removeEventListener("wishlist_updated", handleUpdate);
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    window.location.href = "/checkout";
  };

  const shareText = `Check out the ${product.title} (${selectedVariant.storage || ""} ${selectedVariant.color}) at Aki Enterprise TechHub for ${formatGHS(selectedVariant.price)}!`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24 md:pb-12">
      {/* Mobile Top App Bar (Screen 4 Layout Exact Match) */}
      <div className="md:hidden flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
        <Link
          href="/products"
          className="p-1.5 rounded-full hover:bg-gray-100 text-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {product.brand_name}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWishlist(product.id)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition"
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: product.title,
                  text: shareText,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Product link copied to clipboard!");
              }
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition"
            aria-label="Share product"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-orange-600">Catalog</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category_slug}`} className="hover:text-orange-600">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-xs">
            <Image
              src={selectedImage}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs backdrop-blur-md ${conditionBadge.className}`}>
                {conditionBadge.label}
              </span>
              {selectedVariant.battery_health && (
                <span className="flex items-center gap-1 bg-slate-900/90 text-emerald-400 text-xs font-mono font-semibold px-2 py-1 rounded-md shadow-xs">
                  <BatteryCharging className="w-3.5 h-3.5" />
                  Battery: {selectedVariant.battery_health}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === img ? "border-orange-600 shadow-md" : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Features */}
          <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Product Overview</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {product.features.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3">Key Highlights</h4>
                <ul className="space-y-2">
                  {product.features.map((feat, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications Table */}
            {Object.keys(product.specs).length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3">Technical Specifications</h4>
                <div className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="py-2.5 flex justify-between">
                      <span className="text-gray-500 font-medium">{key.replace(/_/g, " ")}</span>
                      <span className="text-gray-900 font-semibold text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Variant Selector & Purchase Card (Screen 4 Match) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                {product.brand_name}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {product.title}
              </h1>

              {/* Star Rating (Screen 4 Match) */}
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-500 font-bold">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.8</span>
                </div>
                <span className="text-gray-400 font-normal">(2.5k reviews)</span>
              </div>
            </div>

            {/* Price Box with Discount Badge (Screen 4 Match) */}
            <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black text-[#F26A00]">
                  {formatGHS(selectedVariant.price)}
                </span>
                {selectedVariant.original_price && (
                  <span className="text-xs text-gray-400 line-through font-medium">
                    {formatGHS(selectedVariant.original_price)}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-2xs">
                  {selectedVariant.original_price
                    ? `-${Math.round(((selectedVariant.original_price - selectedVariant.price) / selectedVariant.original_price) * 100)}%`
                    : "-13%"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-orange-200/50">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{selectedVariant.stock_quantity > 0 ? "In Stock" : "Out of stock"}</span>
                </span>
                <span className="text-gray-500 text-[11px]">
                  {selectedVariant.warranty_months} Months Official Warranty
                </span>
              </div>
            </div>

            {/* Select Option Chips (Screen 4 Match: 128GB | 256GB | 512GB) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Select Option:
              </label>
              <div className="flex flex-wrap gap-2">
                {(Array.from(new Set(product.variants.map((v) => v.storage).filter(Boolean))).length > 0
                  ? Array.from(new Set(product.variants.map((v) => v.storage).filter(Boolean)))
                  : ["128GB", "256GB", "512GB"]
                ).map((opt) => {
                  const isSelected = selectedVariant.storage === opt;
                  const matchingVariant = product.variants.find((v) => v.storage === opt);
                  return (
                    <button
                      key={String(opt)}
                      type="button"
                      onClick={() => {
                        if (matchingVariant) {
                          setSelectedVariant(matchingVariant);
                          setQuantity(1);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition border ${
                        isSelected
                          ? "border-[#F26A00] text-[#F26A00] bg-orange-50/50 ring-1 ring-[#F26A00]"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                      }`}
                    >
                      {String(opt)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Swatches (Screen 4 Match: Color Swatches Circles) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Color: <span className="font-semibold text-gray-500">{selectedVariant.color}</span>
              </label>
              <div className="flex items-center gap-3">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariant.id;
                  const colorHex =
                    v.color_hex ||
                    (v.color.toLowerCase().includes("black") || v.color.toLowerCase().includes("titanium")
                      ? "#1e293b"
                      : v.color.toLowerCase().includes("blue")
                      ? "#2563eb"
                      : v.color.toLowerCase().includes("pink") || v.color.toLowerCase().includes("red")
                      ? "#ec4899"
                      : "#e2e8f0");

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition relative flex items-center justify-center ${
                        isSelected ? "border-[#F26A00] scale-110 shadow-md ring-2 ring-orange-500/30" : "border-white shadow-xs"
                      }`}
                      style={{ backgroundColor: colorHex }}
                      title={`${v.color} (${v.storage || ""})`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Battery Health & Device Details */}
            {selectedVariant.battery_health && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Certified Battery Health:</span>
                <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5" />
                  {selectedVariant.battery_health}
                </span>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:text-orange-600 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.stock_quantity, quantity + 1))}
                    disabled={quantity >= selectedVariant.stock_quantity}
                    className="p-2 hover:text-orange-600 disabled:opacity-40 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={selectedVariant.stock_quantity === 0}
                  className="flex-1 py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold text-sm shadow-md transition active:scale-98"
                >
                  {selectedVariant.stock_quantity > 0 ? "Add to Cart" : "Currently Out of Stock"}
                </button>
              </div>

              {/* WhatsApp direct buy/ask button */}
              <a
                href={`https://wa.me/233240000000?text=${encodeURIComponent(
                  `Hello Aki Enterprise, I want to inquire/order: ${product.title} (${selectedVariant.storage || ""} ${selectedVariant.color} - ${selectedVariant.condition}) for ${formatGHS(selectedVariant.price)}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order / Inquire on WhatsApp</span>
              </a>
            </div>

            {/* Fulfillment Highlights */}
            <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  <strong>Shop Pickup:</strong> Available immediately at Aki Enterprise TechHub shop.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  <strong>Fast Delivery:</strong> Same-day in Accra/Tema, 1-2 days across other Ghana regions.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  <strong>Authenticity Guarantee:</strong> OriginalIMEI serial, fully unlocked, warranty included.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Product Reviews Section */}
      <div className="mt-12">
        <ProductReviews product={product} />
      </div>

      {/* Mobile Fixed Bottom Sticky Action Bar (Exact Screen 4 Layout) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center gap-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button
          onClick={handleAddToCart}
          disabled={selectedVariant.stock_quantity === 0}
          className="flex-1 py-3 px-4 rounded-full bg-[#F26A00] hover:bg-[#d95e00] text-white font-black text-xs shadow-md shadow-orange-600/30 flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={selectedVariant.stock_quantity === 0}
          className="flex-1 py-3 px-4 rounded-full bg-[#171717] hover:bg-black text-white font-black text-xs shadow-md transition active:scale-95 disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
