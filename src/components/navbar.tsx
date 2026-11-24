"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { CATEGORIES } from "@/lib/mock-data";
import { getStoredProducts } from "@/lib/catalog-store";
import { formatGHS } from "@/lib/utils";
import { getWishlistIds } from "@/lib/customer-store";
import { getStoreSettings, StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings-store";
import { SocialIcon } from "@/components/ui/social-icon";
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
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  // Sync with URL search param on load or URL changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("search");
      if (urlSearch) {
        setSearchQuery(urlSearch);
      }
    }
  }, [pathname]);

  // Compute live instant search suggestions as user types
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length >= 2) {
      try {
        const prods = getStoredProducts();
        const matches = prods
          .filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.brand_name.toLowerCase().includes(q) ||
              p.category_name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          )
          .slice(0, 5);
        setSuggestions(matches);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const updateWishlist = () => {
      setWishlistCount(getWishlistIds().length);
    };
    const updateSettings = () => {
      setSettings(getStoreSettings());
    };
    updateWishlist();
    updateSettings();
    window.addEventListener("wishlist_updated", updateWishlist);
    window.addEventListener("settings_updated", updateSettings);
    return () => {
      window.removeEventListener("wishlist_updated", updateWishlist);
      window.removeEventListener("settings_updated", updateSettings);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    setShowSuggestions(false);
    router.push(`/product/${slug}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs">
      {/* 1. TOP ANNOUNCEMENT BAR (Identical to Desktop Mockup) */}
      <div className="bg-[#171717] text-gray-300 text-[11px] py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Announcement */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-[#FF8A24] animate-pulse shrink-0" />
            <p className="font-medium text-gray-200 truncate">
              {settings.announcementEnabled ? settings.announcementText : `${settings.storeName} • Certified Electronics & Smart Devices`}
            </p>
          </div>

          {/* Right Store Info & Socials */}
          <div className="hidden md:flex items-center gap-4 text-gray-400 shrink-0">
            <div className="flex items-center gap-1 hover:text-white transition">
              <MapPin className="w-3.5 h-3.5 text-[#FF8A24]" />
              <span className="max-w-[200px] truncate">{settings.address}</span>
            </div>
            <span>|</span>
            <div className="flex items-center gap-1 hover:text-white transition">
              <Phone className="w-3.5 h-3.5 text-[#FF8A24]" />
              <span>{settings.phone}</span>
            </div>
            <span>|</span>
            {/* Social Icons with Image/Fallback */}
            <div className="flex items-center gap-1.5 text-xs text-gray-300">
              <SocialIcon platform="facebook" href={settings.socials.facebook} className="!w-6 !h-6 !text-[10px]" />
              <SocialIcon platform="instagram" href={settings.socials.instagram} className="!w-6 !h-6 !text-[10px]" />
              <SocialIcon platform="tiktok" href={settings.socials.tiktok} className="!w-6 !h-6 !text-[10px]" />
              <SocialIcon platform="x" href={settings.socials.x} className="!w-6 !h-6 !text-[10px]" />
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
          {/* Logo with Real Brand Icon (Screen 1 Mobile & Desktop Match) */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Image
                src="/icons/logo-icon.webp"
                alt="Aki Enterprise"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                  AKI <span className="text-[#F26A00]">ADUNI</span> VENTURES
                </span>
              </div>
              <span className="hidden sm:inline-block text-[10px] text-gray-500 tracking-tight font-medium mt-0.5">
                Trading as Aki Enterprise • Reg: 2118270 • Ghana
              </span>
            </div>
          </Link>

          {/* Search Bar with Orange Action Button & Live Suggestions */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative"
            >
              <input
                type="text"
                placeholder="Search for phones, power banks, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full pl-5 pr-14 py-2.5 text-xs bg-gray-50/80 border border-gray-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#F26A00]/20 focus:border-[#F26A00] transition placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-8 rounded-full bg-[#F26A00] hover:bg-[#d95e00] text-white flex items-center justify-center shadow-xs transition active:scale-95"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Desktop Live Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                <div className="p-2 border-b border-gray-50 flex items-center justify-between text-[11px] text-gray-400 px-3 font-semibold">
                  <span>Matching Products</span>
                  <span>{suggestions.length} suggestions</span>
                </div>
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item.slug)}
                      className="w-full p-2.5 flex items-center gap-3 hover:bg-orange-50/60 transition text-left cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.images?.[0] || "/placeholder.png"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-orange-600">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-400 capitalize">
                          {item.brand_name} • {item.category_name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-orange-600 font-mono">
                          {formatGHS(item.base_price)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>View all results for &quot;{searchQuery}&quot;</span>
                    <Search className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

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
              href="/wishlist"
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

            {/* Cart with Dynamic Live Item Counter Badge */}
            <Link
              href="/cart"
              className="flex items-center gap-2 p-1 sm:px-3 sm:py-2 rounded-2xl sm:bg-orange-50/70 sm:hover:bg-orange-100/80 text-gray-800 transition group"
              aria-label="Open Cart"
            >
              <div className="relative w-8 h-8 rounded-full sm:bg-[#F26A00] flex items-center justify-center text-gray-800 sm:text-white transition-transform group-hover:scale-105">
                <ShoppingBag className="w-5 h-5 sm:w-4 sm:h-4 text-slate-800 sm:text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                    {itemCount}
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

        {/* Mobile Search Bar & Suggestions */}
        <div className="mt-2.5 md:hidden relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search for phones, chargers, gadgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
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

          {/* Mobile Live Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 animate-in fade-in">
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(item.slug)}
                    className="w-full p-2.5 flex items-center gap-3 hover:bg-orange-50/60 transition text-left cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.images?.[0] || "/placeholder.png"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize">
                        {item.brand_name}
                      </p>
                    </div>
                    <span className="text-xs font-black text-orange-600 font-mono shrink-0">
                      {formatGHS(item.base_price)}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full py-2 bg-gray-50 text-[11px] font-bold text-orange-600 text-center border-t border-gray-100 block"
              >
                See all results for &quot;{searchQuery}&quot; &rarr;
              </button>
            </div>
          )}
        </div>
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
                href="/faq"
                className="hover:text-[#F26A00] transition"
              >
                FAQ
              </Link>
              <Link
                href="/reviews"
                className="hover:text-[#F26A00] transition"
              >
                Reviews
              </Link>
              <Link
                href="/contact"
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
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-gray-700 py-1.5 px-2 hover:bg-gray-50 rounded font-semibold"
            >
              Frequently Asked Questions (FAQ)
            </Link>
            <Link
              href="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-gray-700 py-1.5 px-2 hover:bg-gray-50 rounded font-semibold"
            >
              Customer Reviews &amp; Feedback
            </Link>
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
