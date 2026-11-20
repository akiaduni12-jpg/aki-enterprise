"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types/ecommerce";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { ProductReviews } from "@/components/product-reviews";
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

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const shareText = `Check out the ${product.title} (${selectedVariant.storage || ""} ${selectedVariant.color}) at Aki Enterprise TechHub for ${formatGHS(selectedVariant.price)}!`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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

        {/* Right Column: Variant Selector & Purchase Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                {product.brand_name}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {product.title}
              </h1>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                SKU: {selectedVariant.sku}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-orange-600">
                  {formatGHS(selectedVariant.price)}
                </span>
                {selectedVariant.original_price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatGHS(selectedVariant.original_price)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700">
                  ● {selectedVariant.stock_quantity > 0 ? `In Stock (${selectedVariant.stock_quantity} available)` : "Out of stock"}
                </span>
                <span className="text-gray-500">
                  {selectedVariant.warranty_months} Months Shop Warranty
                </span>
              </div>
            </div>

            {/* Variant Switcher */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                Select Configuration & Condition:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariant.id;
                  const vBadge = getConditionBadge(v.condition);
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? "border-orange-600 bg-orange-50/40 ring-1 ring-orange-500"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${vBadge.className}`}>
                            {vBadge.label}
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {v.storage ? `${v.storage} • ` : ""}{v.color}
                          </span>
                        </div>
                        {v.battery_health && (
                          <span className="text-[11px] text-gray-500 block mt-0.5">
                            Battery Health: {v.battery_health}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {formatGHS(v.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

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
    </div>
  );
}
