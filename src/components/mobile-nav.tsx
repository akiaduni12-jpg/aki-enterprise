"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import {
  Home,
  LayoutGrid,
  Compass,
  ShoppingBag,
  User,
} from "lucide-react";

export function MobileNavBar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [badgeBounce, setBadgeBounce] = React.useState(false);
  const prevCountRef = React.useRef(itemCount);

  // Bounce cart badge whenever new items are added
  React.useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBadgeBounce(true);
      const timer = setTimeout(() => setBadgeBounce(false), 500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isExploreActive = pathname === "/products" || pathname?.startsWith("/product/");
  const isCategoryActive = pathname === "/categories";
  const isHomeActive = pathname === "/";
  const isCartActive = pathname === "/cart";
  const isAccountActive = pathname === "/account" || pathname?.startsWith("/orders") || pathname === "/track";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-md mx-auto relative">
        {/* 1. Home */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-0.5 text-center py-1 group active:scale-90 transition-transform duration-150"
        >
          <Home
            className={`w-5 h-5 transition-all duration-300 ${
              isHomeActive ? "text-[#F26A00] scale-110" : "text-gray-400 group-hover:text-gray-600"
            }`}
          />
          <span
            className={`text-[10px] font-bold tracking-tight transition-colors ${
              isHomeActive ? "text-[#F26A00]" : "text-gray-400 group-hover:text-gray-600"
            }`}
          >
            Home
          </span>
          {isHomeActive && (
            <span className="w-1.5 h-1 rounded-full bg-[#F26A00] animate-in zoom-in-50 duration-200 mt-[-2px]" />
          )}
        </Link>

        {/* 2. Categories */}
        <Link
          href="/categories"
          className="flex flex-col items-center justify-center gap-0.5 text-center py-1 group active:scale-90 transition-transform duration-150"
        >
          <LayoutGrid
            className={`w-5 h-5 transition-all duration-300 ${
              isCategoryActive ? "text-[#F26A00] scale-110" : "text-gray-400 group-hover:text-gray-600"
            }`}
          />
          <span
            className={`text-[10px] font-bold tracking-tight transition-colors ${
              isCategoryActive ? "text-[#F26A00]" : "text-gray-400 group-hover:text-gray-600"
            }`}
          >
            Category
          </span>
          {isCategoryActive && (
            <span className="w-1.5 h-1 rounded-full bg-[#F26A00] animate-in zoom-in-50 duration-200 mt-[-2px]" />
          )}
        </Link>

        {/* 3. CENTER HERO BUTTON: Explore / Catalog */}
        <Link
          href="/products"
          className="flex flex-col items-center justify-center relative -top-3.5 group select-none"
          aria-label="Explore Full Catalog"
        >
          <div
            className={`w-13 h-13 rounded-full flex items-center justify-center text-white border-[3.5px] border-white shadow-xl transition-all duration-300 transform active:scale-90 group-hover:scale-105 ${
              isExploreActive
                ? "bg-gradient-to-tr from-[#EA580C] via-[#F26A00] to-[#FF8A24] shadow-orange-500/50 ring-2 ring-orange-500/40"
                : "bg-gradient-to-tr from-[#F26A00] via-[#FF8A24] to-[#F26A00] shadow-orange-500/35"
            }`}
          >
            <Compass className={`w-6 h-6 transition-transform duration-300 group-hover:rotate-45 ${isExploreActive ? "rotate-45" : ""}`} />
          </div>
          <span
            className={`text-[10px] font-black tracking-tight mt-0.5 transition-colors ${
              isExploreActive ? "text-[#F26A00]" : "text-slate-800 group-hover:text-[#F26A00]"
            }`}
          >
            Explore
          </span>
        </Link>

        {/* 4. Cart */}
        <Link
          href="/cart"
          className="flex flex-col items-center justify-center gap-0.5 text-center relative group py-1 active:scale-90 transition-transform duration-150"
          aria-label="Open Shopping Cart"
        >
          <div className="relative">
            <ShoppingBag
              className={`w-5 h-5 transition-all duration-300 ${
                isCartActive ? "text-[#F26A00] scale-110" : "text-gray-400 group-hover:text-gray-600"
              }`}
            />
            {itemCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#F26A00] text-white text-[9px] font-black flex items-center justify-center shadow-xs transition-transform ${
                  badgeBounce ? "animate-badge-pop" : ""
                }`}
              >
                {itemCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-bold tracking-tight transition-colors ${
              isCartActive ? "text-[#F26A00]" : "text-gray-400 group-hover:text-gray-600"
            }`}
          >
            Cart
          </span>
          {isCartActive && (
            <span className="w-1.5 h-1 rounded-full bg-[#F26A00] animate-in zoom-in-50 duration-200 mt-[-2px]" />
          )}
        </Link>

        {/* 5. Account */}
        <Link
          href="/account"
          className="flex flex-col items-center justify-center gap-0.5 text-center py-1 group active:scale-90 transition-transform duration-150"
        >
          <User
            className={`w-5 h-5 transition-all duration-300 ${
              isAccountActive ? "text-[#F26A00] scale-110" : "text-gray-400 group-hover:text-gray-600"
            }`}
          />
          <span
            className={`text-[10px] font-bold tracking-tight transition-colors ${
              isAccountActive ? "text-[#F26A00]" : "text-gray-400 group-hover:text-gray-600"
            }`}
          >
            Account
          </span>
          {isAccountActive && (
            <span className="w-1.5 h-1 rounded-full bg-[#F26A00] animate-in zoom-in-50 duration-200 mt-[-2px]" />
          )}
        </Link>
      </div>
    </nav>
  );
}
