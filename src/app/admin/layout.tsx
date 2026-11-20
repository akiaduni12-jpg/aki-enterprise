"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  QrCode,
  Image as ImageIcon,
  MessageSquare,
  ExternalLink,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // If already on the login page, no need to check or redirect
    if (pathname === "/admin/login") {
      setIsAuthenticated(true);
      return;
    }

    try {
      const sessionRaw = localStorage.getItem("techhub_admin_session");
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        setAdminUser(session);
        setIsAuthenticated(true);
      } else {
        // Not logged in -> redirect to admin login
        setIsAuthenticated(false);
        router.push("/admin/login");
      }
    } catch {
      setIsAuthenticated(false);
      router.push("/admin/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("techhub_admin_session");
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  // If on login page, render full screen without the sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-gray-400">Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/banners", label: "Hero Banners & CMS", icon: ImageIcon },
    { href: "/admin/products", label: "Products & Variants", icon: Package },
    { href: "/admin/inventory", label: "Inventory & Stock-In", icon: Layers },
    { href: "/admin/orders", label: "Orders & Fulfillment", icon: ShoppingBag },
    { href: "/admin/reviews", label: "Reviews & Testimonials", icon: MessageSquare },
    { href: "/admin/qr", label: "QR In-Store Campaigns", icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col md:flex-row">
      {/* Dedicated Admin Sidebar */}
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${
                    isActive
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-orange-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility: Profile, Storefront Link & Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs">
          {/* Admin User Badge */}
          <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600/20 text-[#FF8A24] flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <span className="block font-bold text-white text-[11px] truncate max-w-[120px]">
                  {adminUser?.email || "admin@techhubghana.com"}
                </span>
                <span className="block text-[9px] text-emerald-400 uppercase font-semibold">
                  ● Role: Owner
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 p-1 transition"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-gray-300 hover:text-white transition"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-900">{children}</main>
    </div>
  );
}
