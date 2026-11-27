"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  QrCode,
  Image as ImageIcon,
  MessageSquare,
  MessageCircle,
  ExternalLink,
  LogOut,
  ShieldCheck,
  User,
  Menu,
  X,
  Bell,
  MoreHorizontal,
  Settings,
  Users,
  Send,
  Download,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAdminSession, saveAdminSession, clearAdminSession } from "@/lib/admin-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showIosInstallModal, setShowIosInstallModal] = useState(false);

  const isWhatsApp = pathname === "/admin/whatsapp";

  // Dynamic admin manifest registration & PWA prompt listener
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = "/admin-manifest.json";

    const promptHandler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", promptHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", promptHandler);
      if (link) link.href = "/manifest.json";
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    } else {
      setShowIosInstallModal(true);
    }
  };

  useEffect(() => {
    // If already on the login page, no need to check or redirect
    if (pathname === "/admin/login") {
      setIsAuthenticated(true);
      return;
    }

    // Verify session with the secure server-side auth endpoint
    fetch("/api/admin/auth/session")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthenticated");
        return res.json();
      })
      .then((data) => {
        if (data.authenticated && data.session) {
          setAdminUser(data.session);
          saveAdminSession(data.session);
          setIsAuthenticated(true);
        } else {
          clearAdminSession();
          setIsAuthenticated(false);
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      })
      .catch(() => {
        clearAdminSession();
        setIsAuthenticated(false);
        router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    clearAdminSession();
    setIsAuthenticated(false);
    router.push("/admin/login");
    router.refresh();
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
    { href: "/admin/whatsapp", label: "WhatsApp Engine", icon: MessageCircle, badge: "Live" },
    { href: "/admin/banners", label: "Hero Banners & CMS", icon: ImageIcon },
    { href: "/admin/products", label: "Products & Variants", icon: Package },
    { href: "/admin/inventory", label: "Inventory & Stock-In", icon: Layers },
    { href: "/admin/orders", label: "Orders & Fulfillment", icon: ShoppingBag },
    { href: "/admin/customers", label: "Customers & CRM", icon: Users },
    { href: "/admin/sms", label: "SMS Gateway & Alerts", icon: Send },
    { href: "/admin/reviews", label: "Reviews & Testimonials", icon: MessageSquare },
    { href: "/admin/qr", label: "QR In-Store Campaigns", icon: QrCode },
    { href: "/admin/settings", label: "Store Settings & Policies", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Top Header - hidden on WhatsApp for clean full-screen messaging view */}
      {!isWhatsApp && (
        <header className="md:hidden sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle admin drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-sm font-extrabold text-white tracking-tight">Admin Panel</h1>

          <div className="relative p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F26A00] animate-pulse" />
          </div>
        </header>
      )}

      {/* Mobile Slide-Over Drawer for Additional Admin Pages */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src="/icons/logo-icon.webp"
                      alt="Aki Enterprise"
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-base font-black text-white">
                      AKI <span className="text-orange-500">ENTERPRISE</span>
                    </span>
                    <p className="text-[10px] text-gray-400">Admin Control Center</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 text-xs font-semibold">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                        isActive
                          ? "bg-orange-600 text-white font-bold"
                          : "text-gray-300 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-orange-500"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wide">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              {/* Install Admin App Button (Mobile) */}
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  handleInstallApp();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-600/30 transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Install Admin App</span>
                </div>
                <Download className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <Link
                href="/"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 text-gray-300 text-xs font-medium"
              >
                <span>Live Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Desktop Admin Sidebar (Collapsible for distraction-free WhatsApp) */}
      <aside className={`hidden md:flex ${isSidebarCollapsed ? "w-18" : "w-64"} bg-slate-950 border-r border-slate-800 p-3 md:p-4 flex-col justify-between shrink-0 transition-all duration-200 relative`}>
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-gray-300 hover:text-white flex items-center justify-center z-30 shadow-md transition"
          title={isSidebarCollapsed ? "Expand Admin Sidebar" : "Collapse Sidebar for Full View"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className="space-y-6">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-orange-500/20 shrink-0">
              <Image
                src="/icons/logo-icon.webp"
                alt="Aki Enterprise"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white font-sans">
                    AKI <span className="text-orange-500">ENTERPRISE</span>
                  </span>
                  <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Management Portal</p>
              </div>
            )}
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
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5"} rounded-xl transition ${
                    isActive
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-orange-500"} shrink-0`} />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      isActive
                        ? "bg-white text-orange-600"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility: Install App, Profile, Storefront Link & Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs">
          {/* Install Admin App Button (Desktop) */}
          <button
            onClick={handleInstallApp}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2" : "justify-between px-3 py-2"} rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition shadow-sm`}
            title="Install Admin Dashboard as a standalone app"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isSidebarCollapsed && <span>Install App</span>}
            </div>
            {!isSidebarCollapsed && <Download className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Admin User Badge */}
          <div className={`rounded-xl bg-slate-900/80 border border-slate-800 flex items-center ${isSidebarCollapsed ? "justify-center p-2" : "justify-between px-3 py-2"}`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600/20 text-[#FF8A24] flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  <span className="block font-bold text-white text-[11px] truncate max-w-[120px]">
                    {adminUser?.email || "admin@akiaduniventures.com"}
                  </span>
                  <span className="block text-[9px] text-emerald-400 uppercase font-semibold">
                    ● Role: {adminUser?.role || "Owner"}
                  </span>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 p-1 transition"
                title="Sign Out of Admin Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          <Link
            href="/"
            title="Live Storefront"
            className={`flex items-center ${isSidebarCollapsed ? "justify-center p-2" : "justify-between px-3 py-2"} rounded-xl bg-slate-800/60 hover:bg-slate-800 text-gray-300 hover:text-white transition`}
          >
            {!isSidebarCollapsed && <span>Live Storefront</span>}
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </aside>

      {/* Main Content Pane - Zero padding & full height when on WhatsApp */}
      <main className={`flex-1 ${isWhatsApp ? "p-0 h-screen overflow-hidden bg-slate-950" : "p-4 sm:p-8 overflow-y-auto bg-slate-900 pb-24 md:pb-8"}`}>
        {children}
      </main>

      {/* Admin Mobile Bottom Navigation Bar - hidden on WhatsApp so full keyboard and input bar fit cleanly */}
      {!isWhatsApp && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-1">
          <Link
            href="/admin/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              pathname === "/admin/dashboard" ? "text-[#F26A00]" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold">Dashboard</span>
          </Link>

          <Link
            href="/admin/orders"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              pathname === "/admin/orders" ? "text-[#F26A00]" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-bold">Orders</span>
          </Link>

          <Link
            href="/admin/products"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              pathname === "/admin/products" ? "text-[#F26A00]" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-bold">Products</span>
          </Link>

          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-gray-400 hover:text-gray-200 transition"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-bold">More</span>
          </button>
        </nav>
      )}

      {/* Modal: iOS Add to Home Screen Instructions */}
      {showIosInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Install Admin App (Home Screen)
              </h3>
              <button
                onClick={() => setShowIosInstallModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <p className="text-gray-400 leading-relaxed">
                Install <strong>Aki Admin</strong> on your phone for 1-tap access with full-screen WhatsApp:
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
                  <span>Tap the <strong>Share</strong> button (box with arrow pointing up) in Safari or Chrome.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
                  <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
                  <span>Tap <strong>Add</strong>. Launch from your home screen as a standalone app!</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosInstallModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
