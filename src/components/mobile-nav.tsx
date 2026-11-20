"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  User,
} from "lucide-react";

export function MobileNavBar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const tabs = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Category",
      href: "/categories",
      icon: LayoutGrid,
      isActive: pathname === "/categories" || pathname?.startsWith("/products"),
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      isCart: true,
      isActive: pathname === "/cart",
    },
    {
      label: "Account",
      href: "/account",
      icon: User,
      isActive: pathname === "/account",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-16 items-center px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          if (tab.isCart) {
            return (
              <Link
                key={tab.label}
                href="/cart"
                className="flex flex-col items-center justify-center gap-1 text-center relative group py-1"
                aria-label="Open Shopping Cart"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition ${
                      active ? "text-[#F26A00]" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#F26A00] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight transition ${
                    active ? "text-[#F26A00]" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 text-center py-1 group"
            >
              <Icon
                className={`w-5 h-5 transition ${
                  active ? "text-[#F26A00]" : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span
                className={`text-[10px] font-bold tracking-tight transition ${
                  active ? "text-[#F26A00]" : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
