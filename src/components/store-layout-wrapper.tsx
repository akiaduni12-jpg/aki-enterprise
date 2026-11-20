"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export function StoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Admin and Staff portals have their own dedicated full-screen layout with zero public clutter
  if (isAdminRoute) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  // Customer-facing public storefront layout
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <CartDrawer />
      <Footer />
    </>
  );
}
