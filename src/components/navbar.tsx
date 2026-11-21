"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { CATEGORIES } from "@/lib/mock-data";
import { getWishlistIds } from "@/lib/customer-store";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Phone,
  MapPin,
  Heart,
  User,
  ChevronDown,
  Tag,
  SlidersHorizontal,
} from "lucide-react";

export function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);

  React.useEffect(() => {
    const updateWishlist = () => {
      setWishlistCount(getWishlistIds().length);
    };
    updateWishlist();
    window.addEventListener("wishlist_updated", updateWishlist);
    return () => window.removeEventListener("wishlist_updated", updateWishlist);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs">
      {/* 1. TOP ANNOUNCEMENT BAR (Identical to Desktop Mockup) */}
      <div className="bg-[#171717] text-gray-300 text-[11px] py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Announcement */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF8A24] animate-pulse" />
            <p className="font-medium text-gray-200">
              Free Delivery on Orders Above <span className="text-[#FF8A24] font-bold">GH₵ 500</span>
            </p>
          </div>

          {/* Right Store Info & Socials */}
          <div className="hidden md:flex items-center gap-5 text-gray-400">
            <div className="flex items-center gap-1 hover:text-white transition">
              <MapPin className="w-3.5 h-3.5 text-[#FF8A24]" />
              <span>Miaso, Kwahu East, Ghana</span>
            </div>
            <span>|</span>
            <div className="flex items-center gap-1 hover:text-white transition">
              <Phone className="w-3.5 h-3.5 text-[#FF8A24]" />
              <span>+233 55 124 3372</span>
            </div>
            <span>|</span>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 text-xs text-gray-300">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#FF8A24] transition font-bold text-[11px]">f</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#FF8A24] transition font-bold text-[11px]">ig</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-[#FF8A24] transition font-bold text-[11px]">tk</a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-[#FF8A24] transition font-bold text-[11px]">𝕏</a>
            </div>
            <span>|</span>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 text-[#FF8A24] hover:text-orange-300 font-semibold transition"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Logo, Search Bar, Account, Wishlist, Cart) */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo with Orange Shopping Bag (Screen 1 Mobile & Desktop Match) */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#F26A00] to-[#FF8A24] text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <ShoppingBag className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                  Aki <span className="text-[#F26A00]">Enterprise</span>
                </span>
              </div>
              <span className="hidden sm:inline-block text-[10px] text-gray-400 tracking-tight font-medium mt-0.5">
                Electronics &amp; Smart Devices • Ghana
              </span>
            </div>
          </Link>

          {/* Search Bar with Orange Action Button (Mockup Exact Match) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-2xl relative"
          >
            <input
              type="text"
              placeholder="Search for phones, power banks, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-14 py-2.5 text-xs bg-gray-50/80 border border-gray-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#F26A00]/20 focus:border-[#F26A00] transition placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-8 rounded-full bg-[#F26A00] hover:bg-[#d95e00] text-white flex items-center justify-center shadow-xs transition active:scale-95"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Action Icons: Account, Wishlist, Cart */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            {/* Account (Guest-friendly Customer Hub) */}
            <Link
              href="/account"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#F26A00] transition"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[11px] text-gray-400 leading-none">My Hub</span>
                <span className="flex items-center gap-0.5 text-xs font-bold leading-tight">
                  Account <ChevronDown className="w-3 h-3 text-gray-400" />
                </span>
              </div>
            </Link>

            {/* Wishlist with Dynamic Notification Badge */}
            <Link
              href="/account?tab=favorites"
              className="relative hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#F26A00] transition"
            >
              <div className="relative w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F26A00] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-bold">Wishlist</span>
            </Link>

            {/* Cart with Notification Badge (Screen 1 Match) */}
            <Link
              href="/cart"
              className="flex items-center gap-2 p-1 sm:px-3 sm:py-2 rounded-2xl sm:bg-orange-50/70 sm:hover:bg-orange-100/80 text-gray-800 transition group"
              aria-label="Open Cart"
            >
              <div className="relative w-8 h-8 rounded-full sm:bg-[#F26A00] flex items-center justify-center text-gray-800 sm:text-white transition-transform group-hover:scale-105">
                <ShoppingBag className="w-5 h-5 sm:w-4 sm:h-4 text-slate-800 sm:text-white" />
                {itemCount > 0 ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                    {itemCount}
                  </span>
                ) : (
                  <span className="md:hidden absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                    2
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-[10px] text-gray-400 font-semibold leading-none">Cart</span>
                <span className="text-xs font-extrabold text-[#F26A00]">Items</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar (Screen 1 Match: Magnifying glass, "Search for products...", Clear X button) */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 md:hidden relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-xs bg-gray-100/80 border border-transparent rounded-xl focus:outline-hidden focus:bg-white focus:border-[#F26A00] transition placeholder-gray-400"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600"
              aria-label="Submit search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* 3. SECONDARY HORIZONTAL NAVIGATION BAR (Mockup Exact Match) */}
      <div className="border-t border-gray-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-6 py-2">
            {/* "All Categories" Solid Orange Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs shadow-xs hover:from-[#d95e00] hover:to-[#F26A00] transition"
              >
                <Menu className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Menu */}
              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="block px-4 py-2.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-[#F26A00] transition font-semibold"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link
                      href="/products"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-bold text-[#F26A00] hover:bg-orange-50"
                    >
                      Browse Entire Catalog →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Main Nav Links */}
            <nav className="flex items-center gap-7 font-bold text-xs text-slate-800">
              <Link
                href="/"
                className="text-[#F26A00] border-b-2 border-[#F26A00] pb-1 transition"
              >
                Home
              </Link>
              <Link
                href="/products?category=smartphones"
                className="hover:text-[#F26A00] transition flex items-center gap-1"
              >
                <span>Smartphones</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/products?category=power-banks-chargers"
                className="hover:text-[#F26A00] transition flex items-center gap-1"
              >
                <span>Accessories</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/products?category=computer-accessories"
                className="hover:text-[#F26A00] transition flex items-center gap-1"
              >
                <span>Computers</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/products?category=audio-earbuds"
                className="hover:text-[#F26A00] transition flex items-center gap-1"
              >
                <span>Gadgets</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/products?featured=true"
                className="hover:text-[#F26A00] transition"
              >
                Deals
              </Link>
              <Link
                href="/policies/contact"
                className="hover:text-[#F26A00] transition"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Flash Promo Indicator */}
          <div className="flex items-center gap-1.5 text-[#F26A00] bg-orange-50 px-3 py-1 rounded-full text-[11px] font-bold border border-orange-200/50">
            <Tag className="w-3.5 h-3.5 text-[#F26A00]" />
            <span>Up to 50% Off On Accessories</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Navigation
          </p>
          <div className="grid grid-cols-1 gap-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg font-bold text-sm text-[#F26A00] bg-orange-50"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg font-semibold text-sm hover:bg-orange-50 hover:text-[#F26A00] text-gray-800"
            >
              All Electronics
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-sm hover:bg-orange-50 hover:text-[#F26A00] text-gray-700"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-gray-600 py-1.5 px-2 hover:bg-gray-50 rounded"
            >
              Track Order
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-[#F26A00] py-1.5 px-2 hover:bg-orange-50 rounded flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Staff Administration Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
