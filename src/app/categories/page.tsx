"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, ArrowRight, X } from "lucide-react";
import { getStoredCategories, getStoredProducts } from "@/lib/catalog-store";
import { Category, Product } from "@/types/ecommerce";

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  smartphones:
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80",
  "power-banks-chargers":
    "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=400&q=80",
  "audio-earbuds":
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
  smartwatches:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
  "computer-accessories":
    "https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=400&q=80",
};

export default function CategoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadData = () => {
      setCategories(getStoredCategories());
      setProducts(getStoredProducts());
    };

    loadData();
    window.addEventListener("catalog_updated", loadData);
    return () => window.removeEventListener("catalog_updated", loadData);
  }, []);

  const getProductCountForCategory = (cat: Category) => {
    const count = products.filter(
      (p) => p.category_id === cat.id || p.category_id === cat.slug
    ).length;
    return count > 0 ? `${count} ${count === 1 ? "Product" : "Products"}` : "Original Gear";
  };

  const getCategoryImageUrl = (cat: Category) => {
    if (cat.image_url) {
      if (cat.image_url.includes("photo-1609592807963-394ff0073289")) {
        return "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=400&q=80";
      }
      return cat.image_url;
    }
    return (
      DEFAULT_CATEGORY_IMAGES[cat.slug] ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
    );
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Top Header Bar matching Screen 2 in Design */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-gray-100 text-slate-800 transition cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-base font-black text-slate-900 tracking-tight">Categories</h1>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-slate-800 transition cursor-pointer"
            aria-label="Search categories and products"
          >
            {showSearch ? <X className="w-5 h-5 text-gray-500" /> : <Search className="w-5 h-5 text-slate-800" />}
          </button>
        </div>

        {/* Expandable Live Category Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearchSubmit} className="relative animate-in fade-in pt-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Filter categories or press Enter to search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-[#F26A00] focus:outline-hidden transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        )}
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Top Promotional Banner: "Explore Our Categories" */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#FF8A24] via-[#F26A00] to-[#EA580C] text-white p-5 overflow-hidden shadow-lg flex items-center justify-between">
          <div className="relative z-10 max-w-[190px] space-y-1.5">
            <h2 className="text-xl font-black leading-tight text-white tracking-tight">
              Explore Our <br />
              Categories
            </h2>
            <p className="text-[11px] text-orange-100 leading-snug">
              Find genuine electronics, original accessories &amp; daily deals.
            </p>
            <div className="pt-1">
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-[#F26A00] px-2.5 py-0.5 rounded-full shadow-xs hover:bg-orange-50 transition"
              >
                <span>Shop All</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {/* Right Product Image */}
          <div className="relative w-28 h-28 shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"
              alt="Headphones banner"
              fill
              sizes="(max-width: 640px) 112px, 140px"
              className="object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* 2-Column Dynamic Categories Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {filteredCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="bg-white rounded-2xl border border-gray-100 p-3 shadow-2xs hover:shadow-md hover:border-orange-200 transition flex flex-col items-center text-center group"
            >
              {/* Image Frame */}
              <div className="relative w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                <Image
                  src={getCategoryImageUrl(cat)}
                  alt={cat.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              {/* Title & Dynamic Count */}
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#F26A00] transition line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-gray-400 mt-0.5 font-medium">
                {getProductCountForCategory(cat)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
