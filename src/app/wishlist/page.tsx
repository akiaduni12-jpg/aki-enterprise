"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/types/ecommerce";
import { getWishlistProducts, saveWishlistIds } from "@/lib/customer-store";
import { ProductCard } from "@/components/product-card";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export default function WishlistPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadWishlist = () => {
      setFavorites(getWishlistProducts());
      setIsLoaded(true);
    };

    loadWishlist();
    window.addEventListener("wishlist_updated", loadWishlist);
    return () => window.removeEventListener("wishlist_updated", loadWishlist);
  }, []);

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all saved devices from your wishlist?")) {
      saveWishlistIds([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-slate-900 font-bold">Saved Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-xs">
                <Heart className="w-5 h-5 fill-red-500" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  My Saved Devices
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Saved gadgets are stored on your device. Review, compare, or add them directly to your cart.
                </p>
              </div>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs font-bold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Wishlist</span>
              </button>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white text-xs font-bold shadow-xs transition active:scale-95"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Wishlist Items Grid */}
        {!isLoaded ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16 px-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Your wishlist is empty
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                You haven&apos;t saved any phones or accessories yet. Tap the heart icon on any product card to save items you want to review or purchase later.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F26A00] hover:bg-[#d95e00] text-white font-black text-xs shadow-md shadow-orange-600/30 transition active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Explore Phones &amp; Gadgets</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Grid */
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Bottom Assistance Banner */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    Aki Enterprise Authenticity Guarantee
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    All saved phones include verified battery health ratings, store warranty, and doorstep delivery across Ghana.
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/233551243372?text=Hello%20Aki%20Enterprise,%20I%20have%20items%20in%20my%20wishlist%20and%20want%20to%20confirm%20availability%20for%20delivery."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition"
              >
                Ask About Availability on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
