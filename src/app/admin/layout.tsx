import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  QrCode,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo & Portal Badge */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white font-sans">
                AKI <span className="text-orange-500">ENTERPRISE</span>
              </span>
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Management & Operations Portal</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-gray-300 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4 text-orange-500" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/banners"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-gray-300 hover:text-white transition"
            >
              <ImageIcon className="w-4 h-4 text-orange-500" />
              <span>Hero Banners &amp; CMS</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-gray-300 hover:text-white transition"
            >
              <Package className="w-4 h-4 text-orange-500" />
              <span>Products & Variants</span>
            </Link>

            <Link
              href="/admin/inventory"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-gray-300 hover:text-white transition"
            >
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Inventory & Stock-In</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-gray-300 hover:text-white transition"
            >
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>Orders & Fulfillment</span>
            </Link>

            <Link
              href="/admin/qr"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-gray-300 hover:text-white transition"
            >
              <QrCode className="w-4 h-4 text-orange-500" />
              <span>QR In-Store Campaigns</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Utility */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-gray-300 hover:text-white transition"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="px-3 py-1.5 text-[11px] text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Store online • Role: Owner</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-900">
        {children}
      </main>
    </div>
  );
}
