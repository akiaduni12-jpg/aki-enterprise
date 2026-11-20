"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Sparkles,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

const CATEGORIES_LIST = [
  {
    name: "Mobile Phones",
    slug: "smartphones",
    count: "18+ Models",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Power Banks",
    slug: "power-banks-chargers",
    count: "Anker & PD",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Audio & Earbuds",
    slug: "audio-earbuds",
    count: "ANC & Hi-Fi",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Chargers & Cables",
    slug: "power-banks-chargers",
    count: "Fast GaN Tech",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Smart Watches",
    slug: "smartwatches",
    count: "Apple & WearOS",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Accessories",
    slug: "power-banks-chargers",
    count: "Cases & Glass",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Computers & Laptops",
    slug: "computer-accessories",
    count: "RAM & SSDs",
    image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Other Gadgets",
    slug: "audio-earbuds",
    count: "Speakers & Hubs",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80",
  },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCategories = CATEGORIES_LIST.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Top Header Bar matching Screen 2 in Design */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3.5 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-gray-100 text-slate-800 transition"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-black text-slate-900 tracking-tight">Categories</h1>

        <Link
          href="/products"
          className="p-1.5 rounded-full hover:bg-gray-100 text-slate-800 transition"
          aria-label="Search products"
        >
          <Search className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Top Promotional Banner: "Explore Our Categories" (Screen 2 Mockup Match) */}
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
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-[#F26A00] px-2.5 py-0.5 rounded-full shadow-xs">
                <span>Shop All</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>

          {/* Right Product Image */}
          <div className="relative w-28 h-28 shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"
              alt="Headphones banner"
              fill
              className="object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* 2-Column Categories Grid (Exact Screen 2 layout) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {filteredCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="bg-white rounded-2xl border border-gray-100 p-3 shadow-2xs hover:shadow-md hover:border-orange-200 transition flex flex-col items-center text-center group"
            >
              {/* Image Frame */}
              <div className="relative w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                <Image src={cat.image} alt={cat.name} fill className="object-cover" />
              </div>

              {/* Title & Count */}
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#F26A00] transition line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-gray-400 mt-0.5 font-medium">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
