"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS, INITIAL_HERO_BANNERS } from "@/lib/mock-data";
import { HeroBanner, Product, Category, Brand } from "@/types/ecommerce";
import { getStoredBanners, trackBannerClick } from "@/lib/banner-store";
import { getStoredProducts, getStoredCategories, getStoredBrands } from "@/lib/catalog-store";
import { formatGHS } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { AuthenticQR } from "@/components/ui/authentic-qr";
import { StoreTestimonials } from "@/components/store-testimonials";
import { HeroCarousel } from "@/components/hero-carousel";
import { toggleWishlist, getWishlistIds } from "@/lib/customer-store";
import {
  ArrowRight,
  ShoppingBag,
  Heart,
  Star,
  QrCode,
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  Zap,
  Cpu,
  BatteryCharging,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Award,
  ThumbsUp,
  Shield,
  Laptop,
} from "lucide-react";

export default function HomePage() {
  const { addToCart } = useCart();
  const [banners, setBanners] = useState<HeroBanner[]>(INITIAL_HERO_BANNERS);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [phoneFilter, setPhoneFilter] = useState<"all" | "brand_new" | "uk_used">("all");
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Sync Products & Categories from Admin Catalog Store
  useEffect(() => {
    const loadCatalog = () => {
      const prods = getStoredProducts();
      if (prods && prods.length > 0) {
        setAllProducts(prods);
      }
      const cats = getStoredCategories();
      if (cats && cats.length > 0) {
        setAllCategories(cats);
      }
      const b = getStoredBrands();
      if (b && b.length > 0) {
        setBrands(b);
      }
    };

    loadCatalog();
    window.addEventListener("catalog_updated", loadCatalog);
    return () => window.removeEventListener("catalog_updated", loadCatalog);
  }, []);

  // Sync Banners from Admin Banner Store
  useEffect(() => {
    const loadBanners = () => {
      const active = getStoredBanners().filter((b) => b.is_active);
      if (active.length > 0) {
        setBanners(active);
      }
    };

    loadBanners();
    window.addEventListener("banners_updated", loadBanners);
    return () => window.removeEventListener("banners_updated", loadBanners);
  }, []);

  // Initialize and synchronize liked items from customer store
  useEffect(() => {
    const syncWishlist = () => {
      const ids = getWishlistIds();
      const map: Record<string, boolean> = {};
      ids.forEach((id) => {
        map[id] = true;
      });
      setLikedItems(map);
    };

    syncWishlist();
    window.addEventListener("wishlist_updated", syncWishlist);
    return () => window.removeEventListener("wishlist_updated", syncWishlist);
  }, []);

  const toggleLike = (id: string, productId?: string) => {
    const targetId = productId || id;
    toggleWishlist(targetId);
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id], [targetId]: !prev[targetId] }));
  };

  const handleQuickAdd = (product: any, variant?: any) => {
    const targetVariant = variant || product.variants[0];
    addToCart(product, targetVariant);
    setAddedToast(product.title);
    setTimeout(() => setAddedToast(null), 2500);
  };

  // Categories list matching mockup exactly
  const DISPLAY_CATEGORIES = [
    {
      name: "Mobile Phones",
      slug: "smartphones",
      count: "12+ models",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Power Banks",
      slug: "power-banks-chargers",
      count: "Anker & PD",
      image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Audio & Earbuds",
      slug: "audio-earbuds",
      count: "ANC & Hi-Fi",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Chargers & Cables",
      slug: "power-banks-chargers",
      count: "GaN Fast Charge",
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Smart Watches",
      slug: "smartwatches",
      count: "Apple & WearOS",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Phone Accessories",
      slug: "power-banks-chargers",
      count: "Cases & Glass",
      image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Computers & Laptops",
      slug: "computer-accessories",
      count: "RAM & SSDs",
      image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Other Gadgets",
      slug: "audio-earbuds",
      count: "Speakers & Hubs",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80",
    },
  ];

  // Specific products matching the mockup's featured row
  const MOCKUP_PRODUCTS = [
    {
      id: "prod-iphone-16",
      title: "iPhone 16 (128GB)",
      slug: "apple-iphone-15-pro-max",
      badge: "-15%",
      badgeColor: "bg-orange-500",
      rating: "4.8",
      reviews: "2.5k",
      price: 16499,
      originalPrice: 19499,
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=500&q=80",
      productRef: PRODUCTS[0],
    },
    {
      id: "prod-galaxy-a55",
      title: "Samsung Galaxy A55",
      slug: "samsung-galaxy-s24-ultra",
      badge: "New",
      badgeColor: "bg-emerald-600",
      rating: "4.7",
      reviews: "1.8k",
      price: 7499,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=500&q=80",
      productRef: PRODUCTS[2],
    },
    {
      id: "prod-anker-20k",
      title: "Anker Power Bank 20000mAh",
      slug: "anker-20000mah-power-bank",
      badge: "-20%",
      badgeColor: "bg-orange-500",
      rating: "4.7",
      reviews: "982",
      price: 599,
      originalPrice: 749,
      image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=500&q=80",
      productRef: PRODUCTS[3],
    },
    {
      id: "prod-airpods-pro",
      title: "AirPods Pro (2nd Gen)",
      slug: "oraimo-freepods-4-anc",
      badge: "Best Seller",
      badgeColor: "bg-indigo-600",
      rating: "4.8",
      reviews: "3.2k",
      price: 3999,
      originalPrice: 4699,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80",
      productRef: PRODUCTS[4],
    },
    {
      id: "prod-galaxy-watch6",
      title: "Samsung Galaxy Watch6",
      slug: "samsung-galaxy-s24-ultra",
      badge: "-12%",
      badgeColor: "bg-orange-500",
      rating: "4.7",
      reviews: "878",
      price: 2999,
      originalPrice: 3399,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
      productRef: PRODUCTS[2],
    },
  ];

  // Dynamic Best Sellers List: Admin-marked best sellers + Mockup defaults
  const dynamicBestSellers = React.useMemo(() => {
    interface DisplayProductItem {
      id: string;
      title: string;
      slug: string;
      badge: string;
      badgeColor: string;
      rating: string;
      reviews: string;
      price: number;
      originalPrice?: number;
      image: string;
      productRef: Product;
    }

    const customBestSellers: DisplayProductItem[] = allProducts
      .filter((p) => p.best_seller)
      .map((p) => {
        const primaryVar = p.variants[0] || {};
        const price = primaryVar.price || p.base_price;
        const orig = primaryVar.original_price;
        const discount = orig ? `-${Math.round(((orig - price) / orig) * 100)}%` : "Hot";
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          badge: discount,
          badgeColor: "bg-orange-500",
          rating: "4.8",
          reviews: "2.1k",
          price: price,
          originalPrice: orig,
          image: p.images[0] || "/placeholder.png",
          productRef: p,
        };
      });

    const combined: DisplayProductItem[] = [...customBestSellers];
    MOCKUP_PRODUCTS.forEach((mock) => {
      if (!combined.some((c) => c.slug === mock.slug)) {
        combined.push(mock);
      }
    });
    return combined.slice(0, 10);
  }, [allProducts]);

  // Dynamic Featured Products: Admin-marked featured products + defaults
  const dynamicFeaturedProducts = React.useMemo(() => {
    interface DisplayProductItem {
      id: string;
      title: string;
      slug: string;
      badge: string;
      badgeColor: string;
      rating: string;
      reviews: string;
      price: number;
      originalPrice?: number;
      image: string;
      productRef: Product;
    }

    const customFeatured: DisplayProductItem[] = allProducts
      .filter((p) => p.featured)
      .map((p) => {
        const primaryVar = p.variants[0] || {};
        const price = primaryVar.price || p.base_price;
        const orig = primaryVar.original_price;
        const discount = orig ? `-${Math.round(((orig - price) / orig) * 100)}%` : "Featured";
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          badge: discount,
          badgeColor: "bg-orange-500",
          rating: "4.8",
          reviews: "2.5k",
          price: price,
          originalPrice: orig,
          image: p.images[0] || "/placeholder.png",
          productRef: p,
        };
      });

    const combined: DisplayProductItem[] = [...customFeatured];
    MOCKUP_PRODUCTS.forEach((mock) => {
      if (!combined.some((c) => c.slug === mock.slug)) {
        combined.push(mock);
      }
    });
    return combined.slice(0, 5);
  }, [allProducts]);

  // Dynamic Categories: Admin categories merged with defaults
  const dynamicCategories = React.useMemo(() => {
    if (allCategories.length === 0) return DISPLAY_CATEGORIES;
    const adminMapped = allCategories.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: `${allProducts.filter((p) => p.category_slug === c.slug).length}+ items`,
      image: c.image_url || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    }));

    const combined = [...adminMapped];
    DISPLAY_CATEGORIES.forEach((def) => {
      if (!combined.some((c) => c.slug === def.slug)) {
        combined.push(def);
      }
    });
    return combined.slice(0, 8);
  }, [allCategories, allProducts]);

  // Filtered Smartphones List from live allProducts
  const SMARTPHONES_LIST = allProducts.filter((p) => p.category_slug === "smartphones").filter((p) => {
    if (phoneFilter === "all") return true;
    return p.variants.some((v) => v.condition === phoneFilter);
  });

  // Audio & Wearables from live allProducts
  const AUDIO_WEARABLES = allProducts.filter(
    (p) => p.category_slug === "audio-earbuds" || p.category_slug === "smartwatches"
  );

  // Computer & Upgrades from live allProducts
  const COMPUTER_UPGRADES = allProducts.filter((p) => p.category_slug === "computer-accessories");

  return (
    <div className="space-y-14 pb-20 bg-[#F8FAFC]">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block">Added to your cart!</span>
            <span className="text-gray-400 line-clamp-1">{addedToast}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. HERO CAROUSEL: SMOOTH ANIMATED MULTI-SLIDE SHOWCASE */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-5">
        <HeroCarousel banners={banners} onBannerClick={trackBannerClick} />
      </section>

      {/* ============================================================== */}
      {/* 2. "SHOP BY CATEGORY" ROW (Exact Layout with Circular Thumbnails) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-[#F26A00]" />
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold text-[#F26A00] hover:text-[#d95e00] flex items-center gap-0.5 transition"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Horizontal Grid (Screen 1 Match: 2 rows of 4 on mobile) */}
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
          {dynamicCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="group p-2 sm:p-3 bg-white rounded-2xl border border-gray-100 hover:border-orange-300 hover:shadow-lg hover:ring-2 hover:ring-orange-500/20 active:scale-95 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-50 overflow-hidden mb-1.5 sm:mb-2 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 48px, 64px"
                  className="object-cover"
                />
              </div>
              <h3 className="font-bold text-[10px] sm:text-xs text-gray-800 group-hover:text-[#F26A00] transition line-clamp-1 leading-tight">
                {cat.name.split(" ")[0]}
              </h3>
              <span className="hidden sm:block text-[10px] text-gray-400 font-medium mt-0.5">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2.2 BEST SELLERS ROW (Screen 1 Match: Horizontal Cards & Add + Button) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-[#F26A00]" />
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/products?best_seller=true"
            className="text-xs font-bold text-[#F26A00] hover:text-[#d95e00] flex items-center gap-0.5 transition"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Best Sellers Scrollable Carousel / Grid */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {dynamicBestSellers.map((prod) => {
            const isLiked = likedItems[prod.id] || false;
            return (
              <div
                key={prod.id}
                className="w-40 sm:w-auto shrink-0 bg-white rounded-2xl border border-gray-100 p-3 shadow-2xs hover:shadow-lg hover:border-orange-200 transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-xl bg-gray-50 overflow-hidden mb-2 group/img">
                    <Link href={`/product/${prod.slug}`} className="absolute inset-0 block">
                      <Image
                        src={prod.image}
                        alt={prod.title}
                        fill
                        sizes="(max-width: 640px) 160px, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-500 text-white shadow-xs pointer-events-none">
                      {prod.badge}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleLike(prod.id, (prod as any).productRef?.id);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-400 hover:text-red-500 shadow-xs active:scale-75 transition z-10"
                    >
                      <Heart className={`w-3 h-3 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>

                  <Link href={`/product/${prod.slug}`}>
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-1 hover:text-orange-600 transition">
                      {prod.title}
                    </h3>
                  </Link>

                  <div className="flex flex-col mt-1">
                    <span className="font-extrabold text-xs sm:text-sm text-[#F26A00] leading-tight">
                      {formatGHS(prod.price)}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {formatGHS(prod.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-emerald-600">In Stock</span>
                  <button
                    onClick={() => handleQuickAdd(prod.productRef, prod.productRef.variants[0])}
                    className="px-2.5 py-1 rounded-lg bg-[#F26A00] text-white text-[10px] font-black flex items-center gap-1 active:scale-95 shadow-xs"
                  >
                    <span>Add</span>
                    <span>+</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2.5 DEDICATED "SCAN & SHOP" ACCRA STORE PROMOTIONAL BANNER     */}
      {/* ============================================================== */}
      <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-orange-600 via-[#F26A00] to-[#FF8A24] text-white p-6 sm:p-10 overflow-hidden shadow-xl">
          {/* Decorative glowing circles and wave */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-black uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5" />
                <span>Instant In-Store QR Experience</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Scan &amp; Shop at Our Accra Store
              </h2>
              <p className="text-xs sm:text-sm text-orange-50 leading-relaxed">
                Scan the official QR code to browse real-time inventory, compare battery health ratings, view daily deals, and complete instant mobile money checkout on your own device.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Instant MoMo &amp; Card</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Official AKI ADUNI VENTURES Warranty</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Same-Day Accra Delivery</span>
                </span>
              </div>
            </div>

            {/* QR Card with Authentic 2D Code */}
            <div className="bg-white text-slate-900 p-5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-5 shrink-0 border border-orange-200">
              <div className="shrink-0 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <AuthenticQR
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/qr`
                      : "https://akiaduniventures.com/qr"
                  }
                  size={120}
                  centerBadgeText="AKI"
                  showDownloadButton={true}
                />
              </div>
              <div className="text-center sm:text-left space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F26A00] block">
                  Storefront Entry QR
                </span>
                <h4 className="text-sm font-black text-slate-900">
                  AKI ADUNI VENTURES
                </h4>
                <p className="text-[11px] text-gray-500 max-w-[160px] leading-tight">
                  Point your phone camera to launch direct catalog
                </p>
                <Link
                  href="/qr"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171717] hover:bg-black text-white font-bold text-xs shadow-md transition"
                >
                  <span>Open Scanner</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF8A24]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. "FEATURED PRODUCTS" & "BIG DEALS" BANNER ROW (Exact Layout)   */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-[#F26A00]" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="text-xs font-bold text-[#F26A00] hover:text-[#d95e00] flex items-center gap-1 transition"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: 5 Product Cards Grid (9 Cols on wide screens) */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {dynamicFeaturedProducts.map((prod) => {
              const isLiked = likedItems[prod.id] || false;
              return (
                <div
                  key={prod.id}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-3 shadow-2xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Badges & Heart Wishlist */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${prod.badgeColor}`}
                    >
                      {prod.badge}
                    </span>

                    <button
                      onClick={() => toggleLike(prod.id, (prod as any).productRef?.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition active:scale-75"
                      aria-label="Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""
                          }`}
                      />
                    </button>
                  </div>

                  {/* Product Image */}
                  <Link
                    href={`/product/${prod.slug}`}
                    className="relative w-full aspect-square rounded-xl bg-gray-50 overflow-hidden mb-2"
                  >
                    <Image
                      src={prod.image}
                      alt={prod.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Info */}
                  <div className="space-y-1">
                    <Link href={`/product/${prod.slug}`}>
                      <h3 className="font-bold text-xs text-gray-900 group-hover:text-[#F26A00] transition line-clamp-1">
                        {prod.title}
                      </h3>
                    </Link>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{prod.rating}</span>
                      <span className="text-gray-400">({prod.reviews} reviews)</span>
                    </div>

                    {/* Pricing */}
                    <div className="flex flex-col pt-1">
                      <span className="font-extrabold text-sm text-[#F26A00] leading-tight">
                        {formatGHS(prod.price)}
                      </span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatGHS(prod.originalPrice)}
                        </span>
                      )}
                    </div>

                    <span className="inline-block text-[10px] text-emerald-600 font-bold">
                      ◆ In Stock
                    </span>
                  </div>

                  {/* Add to Cart Orange Button */}
                  <button
                    onClick={() =>
                      handleQuickAdd(prod.productRef, prod.productRef.variants[0])
                    }
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right: Dynamic Promo Mini Card (3 Cols) - Synced from Admin Banner Store */}
          {(() => {
            const promoBanner = banners[1] || banners[0] || INITIAL_HERO_BANNERS[0];
            return (
              <div className="lg:col-span-3 rounded-2xl bg-[#171717] text-white p-6 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[350px]">
                {/* Glowing Energy Ring Behind Product */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-2xl opacity-25 pointer-events-none"
                  style={{ backgroundColor: promoBanner.accent_color || "#F26A00" }}
                />

                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF8A24] block">
                    {promoBanner.badge || "Featured Deal"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {promoBanner.title}
                  </h3>
                  <p className="text-xs text-gray-300 font-semibold line-clamp-2">
                    {promoBanner.subtitle}
                  </p>
                </div>

                {/* Promo Image */}
                <div className="relative w-full aspect-square my-2">
                  <Image
                    src={promoBanner.image_url}
                    alt={promoBanner.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain drop-shadow-2xl"
                  />
                </div>

                <Link
                  href={promoBanner.cta_link || "/products?featured=true"}
                  className="relative z-10 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs text-center shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2"
                >
                  <span>{promoBanner.cta_text || "Shop Deals"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. NEW: SMARTPHONES SHOWCASE (Brand New vs. Certified UK-Used) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#F26A00]" />
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Smartphones: Brand New &amp; UK-Used
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Certified authentic Apple iPhones, Samsung Galaxy &amp; Google Pixels with tested battery health &amp; store warranty.
            </p>
          </div>

          {/* Condition Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl self-start sm:self-auto border border-gray-200 text-xs font-bold">
            <button
              onClick={() => setPhoneFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg transition ${phoneFilter === "all"
                ? "bg-[#171717] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              All Phones
            </button>
            <button
              onClick={() => setPhoneFilter("brand_new")}
              className={`px-3.5 py-1.5 rounded-lg transition ${phoneFilter === "brand_new"
                ? "bg-[#171717] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Brand New
            </button>
            <button
              onClick={() => setPhoneFilter("uk_used")}
              className={`px-3.5 py-1.5 rounded-lg transition ${phoneFilter === "uk_used"
                ? "bg-[#F26A00] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              UK-Used Grade A
            </button>
          </div>
        </div>

        {/* 4-Column Phones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SMARTPHONES_LIST.slice(0, 4).map((prod) => {
            const primaryVariant = prod.variants[0];
            const isLiked = likedItems[prod.id] || false;
            const isUkUsed = primaryVariant.condition === "uk_used";

            return (
              <div
                key={prod.id}
                className="group bg-white rounded-3xl border border-gray-100 hover:border-orange-200 p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white ${isUkUsed ? "bg-amber-600" : "bg-emerald-600"
                          }`}
                      >
                        {isUkUsed ? "UK Used Grade A" : "Brand New"}
                      </span>
                      {isUkUsed &&
                        Boolean(primaryVariant.battery_health && primaryVariant.battery_health.trim()) &&
                        primaryVariant.battery_health!.trim().toLowerCase() !== "n/a" &&
                        primaryVariant.battery_health!.trim().toLowerCase() !== "none" && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                          <BatteryCharging className="w-3 h-3" />
                          <span>{primaryVariant.battery_health}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleLike(prod.id, (prod as any).productRef?.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition active:scale-75"
                      aria-label="Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""
                          }`}
                      />
                    </button>
                  </div>

                  {/* Image */}
                  <Link
                    href={`/product/${prod.slug}`}
                    className="relative w-full aspect-4/3 rounded-2xl bg-gray-50 overflow-hidden mb-3 block"
                  >
                    <Image
                      src={prod.images[0]}
                      alt={prod.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Brand & Title */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F26A00]">
                      {prod.brand_name}
                    </span>
                    <Link href={`/product/${prod.slug}`}>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#F26A00] transition line-clamp-1">
                        {prod.title}
                      </h3>
                    </Link>

                    {/* Key Specs tags */}
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {primaryVariant.storage && (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10px]">
                          {primaryVariant.storage}
                        </span>
                      )}
                      {primaryVariant.ram && (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10px]">
                          {primaryVariant.ram} RAM
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-semibold text-[10px]">
                        {primaryVariant.warranty_months}M Warranty
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price and Cart Footer */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Starting at</span>
                    <div className="flex flex-col">
                      <span className="font-black text-base text-[#F26A00] leading-tight">
                        {formatGHS(primaryVariant.price)}
                      </span>
                      {primaryVariant.original_price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatGHS(primaryVariant.original_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickAdd(prod, primaryVariant)}
                    className="p-2.5 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white shadow-xs transition active:scale-95 shrink-0"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. NEW: DUAL VALUE PROMO BANNERS (Charging & PC Upgrades)      */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Banner 1: Fast PD Charging Ecosystem */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#1c1c1c] to-[#2b1f18] p-7 sm:p-8 text-white overflow-hidden shadow-xl border border-orange-500/15 flex flex-col justify-between min-h-[260px]">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#F26A00]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-[#FF8A24] text-[11px] font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>Original Charging Power</span>
              </div>
              <h3 className="text-2xl font-black text-white leading-tight">
                Anker GaN III &amp; 20,000mAh Power Banks
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                65W triple-port high-speed charging adapters, braided silicone cables &amp; durable backup power for home or travel in Ghana.
              </p>
            </div>

            <div className="relative z-10 pt-4">
              <Link
                href="/products?category=power-banks-chargers"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-md transition"
              >
                <span>Shop Fast Chargers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Banner 2: Computer & Laptop Upgrades */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-7 sm:p-8 text-white overflow-hidden shadow-xl border border-blue-500/15 flex flex-col justify-between min-h-[260px]">
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>PC &amp; Laptop Performance</span>
              </div>
              <h3 className="text-2xl font-black text-white leading-tight">
                High-Speed RAM &amp; Gen4 NVMe SSDs
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Crucial 16GB DDR4 memory &amp; Kingston 3500MB/s SSDs. Free installation and OS cloning assistance at our Accra shop.
              </p>
            </div>

            <div className="relative z-10 pt-4">
              <Link
                href="/products?category=computer-accessories"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                <span>Explore PC Parts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. NEW: AUDIO GEAR & SMART WATCHES ROW                         */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-[#F26A00]" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Audio Gear &amp; Smart Wearables
            </h2>
          </div>
          <Link
            href="/products?category=audio-earbuds"
            className="text-xs font-bold text-[#F26A00] hover:text-[#d95e00] flex items-center gap-1 transition"
          >
            <span>View All Audio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {AUDIO_WEARABLES.slice(0, 6).map((prod) => {
            const primaryVariant = prod.variants[0];
            const isLiked = likedItems[prod.id] || false;

            return (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-orange-200 p-3 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400">
                      {prod.category_name.split(" ")[0]}
                    </span>
                    <button
                      onClick={() => toggleLike(prod.id, (prod as any).productRef?.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition active:scale-75"
                      aria-label="Wishlist"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""
                          }`}
                      />
                    </button>
                  </div>

                  <Link
                    href={`/product/${prod.slug}`}
                    className="relative w-full aspect-square rounded-xl bg-gray-50 overflow-hidden mb-2 block"
                  >
                    <Image
                      src={prod.images[0]}
                      alt={prod.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <Link href={`/product/${prod.slug}`}>
                    <h3 className="font-bold text-xs text-gray-900 group-hover:text-[#F26A00] transition line-clamp-2 leading-tight">
                      {prod.title}
                    </h3>
                  </Link>
                </div>

                <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-black text-xs text-[#F26A00]">
                    {formatGHS(primaryVariant.price)}
                  </span>
                  <button
                    onClick={() => handleQuickAdd(prod, primaryVariant)}
                    className="p-1.5 rounded-lg bg-orange-50 hover:bg-[#F26A00] text-[#F26A00] hover:text-white transition"
                    title="Add to cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. NEW: COMPUTER COMPONENTS & PERIPHERALS                     */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-[#F26A00]" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Computer Upgrades &amp; Accessories
            </h2>
          </div>
          <Link
            href="/products?category=computer-accessories"
            className="text-xs font-bold text-[#F26A00] hover:text-[#d95e00] flex items-center gap-1 transition"
          >
            <span>View All Components</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {COMPUTER_UPGRADES.map((prod) => {
            const primaryVariant = prod.variants[0];

            return (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex items-center gap-4"
              >
                <Link
                  href={`/product/${prod.slug}`}
                  className="relative w-24 h-24 rounded-xl bg-gray-50 overflow-hidden shrink-0 block"
                >
                  <Image
                    src={prod.images[0]}
                    alt={prod.title}
                    fill
                    sizes="96px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {prod.brand_name}
                  </span>
                  <Link href={`/product/${prod.slug}`}>
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#F26A00] transition line-clamp-2">
                      {prod.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-sm text-[#F26A00]">
                      {formatGHS(primaryVariant.price)}
                    </span>
                    <button
                      onClick={() => handleQuickAdd(prod, primaryVariant)}
                      className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#F26A00] text-white font-bold text-[11px] transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. NEW: IN-STORE QR SHOPPING EXPERIENCE GUIDE (Aki Enterprise) */}
      {/* ============================================================== */}
      <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-[#F26A00] text-xs font-bold">
              Seamless Retail Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How QR Scan &amp; Shop Works in Our Store
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Visiting AKI ADUNI VENTURES in Miaso, Kwahu East? Skip queues, view exact battery health stats, and pay via MoMo right from your phone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F26A00]/15 text-[#F26A00] mx-auto flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900">Scan Product QR</h3>
              <p className="text-xs text-gray-500">
                Point your phone camera at any QR code on shelf tags or display stands inside our shop.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F26A00]/15 text-[#F26A00] mx-auto flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900">Inspect Verified Specs</h3>
              <p className="text-xs text-gray-500">
                Instantly see battery health %, tested specs, storage options, and real-time counter stock.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F26A00]/15 text-[#F26A00] mx-auto flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900">Pay via MoMo / Card</h3>
              <p className="text-xs text-gray-500">
                Checkout in seconds using MTN Mobile Money, Telecel Cash, or Visa/Mastercard without handling cash.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center font-black text-lg">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900">Instant Counter Pickup</h3>
              <p className="text-xs text-gray-500">
                Flash your digital order receipt at the counter to collect your sealed device with warranty slip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 10. REAL CUSTOMER REVIEWS & GHANA TESTIMONIALS (Dynamic)       */}
      {/* ============================================================== */}
      <StoreTestimonials />

      {/* ============================================================== */}
      {/* 11. NEW: BRAND PARTNERS MARQUEE STRIP                          */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block text-center mb-4">
            Authorized Brands &amp; Direct Wholesalers
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 transition-all duration-300">
            {brands.map((b) => (
              <Link
                key={b.id || b.name}
                href={`/products?brand=${encodeURIComponent(b.slug || b.name)}`}
                className="group flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gray-50/70 hover:bg-orange-50/40 border border-gray-200/70 hover:border-orange-500/40 transition shadow-2xs"
                title={`Browse ${b.name} at Aki Enterprise`}
              >
                {b.logo_url ? (
                  <div className="relative w-6 h-6 rounded-md overflow-hidden bg-white shrink-0 border border-gray-200/60 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.logo_url}
                      alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>
                ) : (
                  <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 font-bold text-[10px] flex items-center justify-center">
                    {b.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="text-xs font-bold text-gray-700 group-hover:text-[#F26A00] tracking-tight transition">
                  {b.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 12. TRUST & VALUE BADGES BAR (Exact Bottom Bar of Desktop Mockup) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Fast Delivery */}
          <div className="flex items-center gap-3 pt-2 md:pt-0">
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#F26A00] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Fast Delivery</h4>
              <p className="text-[11px] text-gray-500">Across Ghana</p>
            </div>
          </div>

          {/* Secure Payments */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#F26A00] shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Secure Payments</h4>
              <p className="text-[11px] text-gray-500">[MTN, Telecel &amp; Cards]</p>
            </div>
          </div>

          {/* Certified Quality */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#F26A00] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Certified Quality</h4>
              <p className="text-[11px] text-gray-500">Tested &amp; Verified</p>
            </div>
          </div>

          {/* 24/7 Support */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#F26A00] shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">24/7 Support</h4>
              <p className="text-[11px] text-gray-500">We&apos;re here to help</p>
            </div>
          </div>

          {/* Easy Returns */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4 col-span-2 md:col-span-1">
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#F26A00] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Easy Returns</h4>
              <p className="text-[11px] text-gray-500">Hassle Free</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
