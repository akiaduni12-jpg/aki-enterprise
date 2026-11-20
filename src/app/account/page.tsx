"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  getCustomerProfile,
  saveCustomerProfile,
  getCustomerOrders,
  lookupOrder,
  getWishlistProducts,
  toggleWishlist,
  CustomerProfile,
} from "@/lib/customer-store";
import { Product, Order } from "@/types/ecommerce";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import {
  User,
  Package,
  Heart,
  MapPin,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Headphones,
  Settings,
  LogOut,
} from "lucide-react";

function CustomerAccountContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "orders";

  const [activeTab, setActiveTab] = useState<"orders" | "favorites" | "profile">(initialTab);
  const [profile, setProfile] = useState<CustomerProfile>({
    full_name: "",
    phone: "",
    email: "",
    delivery_address: "",
    city: "Accra",
    notes: "",
  });
  const [orders, setOrders] = useState<Partial<Order>[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<Partial<Order> | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [passwordProtection, setPasswordProtection] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");

  const { addToCart } = useCart();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = () => {
    setProfile(getCustomerProfile());
    setOrders(getCustomerOrders());
    setFavorites(getWishlistProducts());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("profile_updated", handleUpdate);
    window.addEventListener("orders_updated", handleUpdate);
    window.addEventListener("wishlist_updated", handleUpdate);
    return () => {
      window.removeEventListener("profile_updated", handleUpdate);
      window.removeEventListener("orders_updated", handleUpdate);
      window.removeEventListener("wishlist_updated", handleUpdate);
    };
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomerProfile(profile);
    showToast("Profile & delivery preferences saved for fast checkout!");
  };

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSearchQuery.trim()) return;

    const found = lookupOrder(orderSearchQuery);
    if (found) {
      setSearchedOrder(found);
      showToast("Order found!");
    } else {
      setSearchedOrder(null);
      showToast("No order found with that ID or Phone number.");
    }
  };

  const handleRemoveFavorite = (productId: string) => {
    toggleWishlist(productId);
    showToast("Removed from favorites.");
    setFavorites(getWishlistProducts());
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, product.variants[0]);
    showToast(`Added ${product.title} to cart!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] text-white px-5 py-3 rounded-2xl shadow-2xl border border-orange-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#FF8A24]" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Mobile Top Profile Card (Exact Screen 7 Mockup Architecture) */}
      <div className="md:hidden relative rounded-3xl bg-gradient-to-br from-[#FF8A24] via-[#F26A00] to-[#EA580C] text-white p-6 overflow-hidden shadow-xl text-center space-y-3">
        {/* Top Back Icon */}
        <div className="flex items-center justify-between text-white/90 mb-1">
          <Link href="/" className="p-1 hover:text-white transition">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">Account</span>
          <div className="w-5" />
        </div>

        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          {/* Avatar with Ring */}
          <div className="w-20 h-20 rounded-full border-4 border-white/30 p-1 mx-auto shadow-xl bg-white/10">
            <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-2xl overflow-hidden">
              {profile.full_name ? profile.full_name[0].toUpperCase() : "K"}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {profile.full_name || "Kwame Mensah"}
            </h2>
            <p className="text-xs text-orange-100 font-medium">
              {profile.email || "kwame@gmail.com"}
            </p>
          </div>

          {/* Gold Customer Badge */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
              <Sparkles className="w-3 h-3 text-amber-900" />
              <span>Gold Customer</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Menu List with Chevrons (Screen 7 Exact Match) */}
      <div className="md:hidden bg-white rounded-3xl border border-gray-100 shadow-2xs divide-y divide-gray-100 overflow-hidden">
        {/* 1. My Orders */}
        <Link
          href="/orders"
          className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-gray-900">My Orders</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        {/* 2. My Addresses */}
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-gray-900">My Addresses</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* 3. Wishlist */}
        <button
          type="button"
          onClick={() => setActiveTab("favorites")}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-gray-900">Wishlist</span>
          </div>
          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#F26A00] text-[10px] font-bold">
                {favorites.length}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {/* 4. Payment Methods */}
        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-gray-900 block">Payment Methods</span>
              <span className="text-[10px] text-gray-400">MTN MoMo &amp; Cards Enabled</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* 5. Customer Support */}
        <a
          href="https://wa.me/233241234567?text=Hello%20Aki%20Enterprise%20TechHub%2C%20I%20need%20help%20with%20an%20order"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-gray-900">Customer Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </a>

        {/* 6. Settings */}
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-gray-900">Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* 7. Log Out */}
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset current guest session?")) {
              localStorage.removeItem("techhub_customer_profile");
              setProfile({ full_name: "", phone: "", email: "", delivery_address: "", city: "Accra", notes: "" });
              showToast("Guest profile reset.");
            }
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-red-50 text-red-600 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-red-600">Log Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400" />
        </button>
      </div>

      {/* Desktop Header Banner */}
      <div className="hidden md:block bg-[#171717] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F26A00]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-[#FF8A24] text-[10px] font-black uppercase tracking-wider border border-white/15">
                Guest Customer Hub
              </span>
              <span className="text-xs text-gray-400">No Password Required</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {profile.full_name ? `Welcome back, ${profile.full_name}!` : "My Shopping & Orders Hub"}
            </h1>
            <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
              Track live deliveries, manage saved wishlist devices, and save delivery instructions for 1-click checkout.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F26A00] to-[#FF8A24] flex items-center justify-center text-white font-black text-base shadow-md">
              {profile.full_name ? profile.full_name[0].toUpperCase() : "G"}
            </div>
            <div className="text-xs">
              <span className="font-bold text-white block">
                {profile.full_name || "Guest Shopper"}
              </span>
              <span className="text-[11px] text-gray-400">
                {profile.phone || "No phone saved yet"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "orders"
              ? "bg-[#171717] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200"
          }`}
        >
          <Package className="w-4 h-4 text-[#FF8A24]" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "favorites"
              ? "bg-[#171717] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200"
          }`}
        >
          <Heart className="w-4 h-4 text-[#FF8A24]" />
          <span>Saved Favorites ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "profile"
              ? "bg-[#171717] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200"
          }`}
        >
          <User className="w-4 h-4 text-[#FF8A24]" />
          <span>Delivery Details &amp; Profile</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 1. MY ORDERS & TRACKING TAB */}
      {/* ==================================================================== */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Order Quick Lookup Bar */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Looking for an order placed on another phone or computer?
            </h3>
            <p className="text-xs text-gray-500">
              Enter your Order Number (e.g. <code className="text-orange-600 font-bold">ORD-2026-9821</code>) or your registered Phone Number:
            </p>

            <form onSubmit={handleSearchOrder} className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Order ID or Phone Number..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shrink-0"
              >
                Track Order
              </button>
            </form>

            {/* Found Order Card */}
            {searchedOrder && (
              <div className="mt-4 p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Found Order: {searchedOrder.order_number}
                  </span>
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                    {searchedOrder.order_status?.toUpperCase() || "PROCESSING"}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Recipient: <strong>{searchedOrder.customer?.full_name}</strong> • Phone:{" "}
                  {searchedOrder.customer?.phone}
                </p>
                <p className="text-xs font-black text-[#F26A00]">
                  Total: {formatGHS(searchedOrder.total_amount || 0)}
                </p>
              </div>
            )}
          </div>

          {/* Orders History List */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900">Recent Store Orders</h3>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center space-y-3">
                <Package className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No orders found on this device</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When you complete an order using MoMo or Card, your receipt, live rider status, and order warranty show up here automatically.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F26A00] text-white text-xs font-bold hover:bg-[#d95e00] transition shadow-md"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord, idx) => (
                  <div
                    key={ord.order_number || idx}
                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs hover:border-orange-200 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-100">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {ord.order_number}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Placed on {new Date(ord.created_at || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ord.payment_status === "paid" ? "Paid via Paystack MoMo" : "Payment Pending"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          {ord.order_status?.replace("_", " ").toUpperCase() || "PROCESSING"}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {ord.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-700">
                          <span className="font-semibold line-clamp-1">
                            {item.quantity}× {item.product_title} ({item.storage || item.color})
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {formatGHS(item.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-500">Total: </span>
                        <strong className="text-[#F26A00] font-black text-sm">
                          {formatGHS(ord.total_amount || 0)}
                        </strong>
                      </div>

                      <Link
                        href={`/track?order=${ord.order_number}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#FF8A24]" />
                        <span>Track Delivery</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. SAVED FAVORITES (WISHLIST) TAB */}
      {/* ==================================================================== */}
      {activeTab === "favorites" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">
              My Saved Wishlist Devices ({favorites.length})
            </h3>
            <span className="text-xs text-gray-500">Saved directly to your browser</span>
          </div>

          {favorites.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center space-y-3">
              <Heart className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Your wishlist is currently empty</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Tap the heart icon on any phone, charger, or gadget to save it here for later.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F26A00] text-white text-xs font-bold hover:bg-[#d95e00] transition shadow-md"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((prod) => {
                const conditionBadge = getConditionBadge(prod.variants[0]?.condition || "brand_new");
                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-gray-100 p-4 flex flex-col justify-between hover:border-orange-200 hover:shadow-lg transition group"
                  >
                    <div>
                      <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-50 mb-3">
                        <Image
                          src={prod.images[0] || "/placeholder.png"}
                          alt={prod.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${conditionBadge.className}`}>
                          {conditionBadge.label}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{prod.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{prod.category_name}</p>

                      <div className="mt-2 text-sm font-black text-[#F26A00]">
                        {formatGHS(prod.base_price)}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-2">
                      <button
                        onClick={() => handleAddToCart(prod)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:from-[#d95e00] transition active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        onClick={() => handleRemoveFavorite(prod.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. PROFILE & DELIVERY DETAILS TAB (NO FORCED ACCOUNT!) */}
      {/* ==================================================================== */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-xs max-w-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#F26A00]" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Express Checkout Delivery Profile
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Save your Accra delivery location and contact number. These details will automatically fill in whenever you checkout with one click.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kwame Mensah"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Phone Number (for MoMo &amp; Delivery)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 024 123 4567"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500 font-mono"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Email Address (Receipt delivery)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="e.g. kwame@gmail.com"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Delivery City / Region
                </label>
                <select
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                >
                  <option value="Accra">Greater Accra (Same-Day Delivery)</option>
                  <option value="Tema">Tema / Ashaiman</option>
                  <option value="Kumasi">Kumasi, Ashanti Region</option>
                  <option value="Takoradi">Takoradi / Western Region</option>
                  <option value="Cape Coast">Cape Coast / Central Region</option>
                  <option value="Other">Other Regions (VIP Bus Dispatch)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Detailed Delivery Address / Landmark
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. East Legon, near American House, House #14, Accra"
                value={profile.delivery_address}
                onChange={(e) => setProfile({ ...profile, delivery_address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500 resize-none"
              />
            </div>

            {/* Optional Password Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                <input
                  type="checkbox"
                  checked={passwordProtection}
                  onChange={(e) => setPasswordProtection(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-orange-600 focus:ring-orange-500"
                />
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                  <span>Protect profile with a password? (100% Optional)</span>
                </span>
              </label>

              {passwordProtection && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <input
                    type="password"
                    placeholder="Create an optional password..."
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    You can still shop freely without logging in even if you set a password.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Express Details</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center text-gray-500 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            <span>Loading Account Hub...</span>
          </div>
        </div>
      }
    >
      <CustomerAccountContent />
    </Suspense>
  );
}
