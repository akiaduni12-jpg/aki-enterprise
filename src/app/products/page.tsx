import React, { Suspense } from "react";
import { getProducts, getCategories, getBrands } from "@/lib/db-service";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { Filter, ChevronLeft, Search, X } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    condition?: string;
    search?: string;
    featured?: string;
  }>;
}

async function ProductsList({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const { category, brand, condition, search, featured } = resolvedParams;

  const [allProducts, allCategories, allBrands] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
  ]);

  let filtered = [...allProducts];

  if (category) {
    filtered = filtered.filter((p) => p.category_slug === category);
  }

  if (brand) {
    filtered = filtered.filter((p) => p.brand_name.toLowerCase() === brand.toLowerCase());
  }

  if (condition) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.condition === condition)
    );
  }

  if (featured === "true") {
    filtered = filtered.filter((p) => p.featured);
  }

  if (search) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category_name?.toLowerCase().includes(q);
      const matchBrand = p.brand_name?.toLowerCase().includes(q);
      const matchFeatures = p.features?.some((f) => f.toLowerCase().includes(q));
      const matchVariants = p.variants?.some(
        (v) =>
          v.storage?.toLowerCase().includes(q) ||
          v.color?.toLowerCase().includes(q) ||
          v.condition?.toLowerCase().includes(q) ||
          v.sku?.toLowerCase().includes(q)
      );
      return matchTitle || matchDesc || matchCat || matchBrand || matchFeatures || matchVariants;
    });
  }

  const currentCategory = allCategories.find((c) => c.slug === category);
  const activeBrandName = allBrands.find((b) => b.slug.toLowerCase() === (brand || "").toLowerCase())?.name || brand;

  // Curated brands list for mobile pills (Screen 3 Match)
  const MOBILE_BRAND_PILLS = [
    { label: "All", slug: "" },
    { label: "iPhone", slug: "apple" },
    { label: "Samsung", slug: "samsung" },
    { label: "Tecno", slug: "tecno" },
    { label: "Infinix", slug: "infinix" },
    { label: "Oraimo", slug: "oraimo" },
    { label: "Anker", slug: "anker" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24 md:pb-12">
      {/* Mobile Top App Bar (Screen 3 Match: "< Smartphones" + Search Icon / Clear) */}
      <div className="flex md:hidden items-center justify-between mb-3 pt-1">
        <Link
          href="/categories"
          className="flex items-center gap-1.5 text-slate-900 hover:text-orange-600 transition truncate max-w-[80%]"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800 shrink-0" />
          <h1 className="text-base font-black text-slate-900 tracking-tight truncate">
            {search
              ? `Results: "${search}"`
              : currentCategory
                ? currentCategory.name
                : activeBrandName || "Smartphones"}
          </h1>
        </Link>

        {search ? (
          <Link
            href="/products"
            className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center transition shrink-0"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href="/categories"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition shrink-0"
            aria-label="Search and Categories"
          >
            <Search className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Horizontal Brand Filter Pills (Screen 3 Match: "All | iPhone | Samsung | Tecno") */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {MOBILE_BRAND_PILLS.map((pill) => {
          const isSelected = (!brand && pill.slug === "") || (brand?.toLowerCase() === pill.slug.toLowerCase());
          const targetUrl = pill.slug
            ? `/products?brand=${pill.slug}${category ? `&category=${category}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`
            : category
              ? `/products?category=${category}${search ? `&search=${encodeURIComponent(search)}` : ""}`
              : search
                ? `/products?search=${encodeURIComponent(search)}`
                : "/products";

          return (
            <Link
              key={pill.label}
              href={targetUrl}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${isSelected
                  ? "bg-[#F26A00] text-white shadow-md shadow-orange-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {pill.label}
            </Link>
          );
        })}
      </div>

      {/* Desktop Breadcrumb & Title */}
      <div className="hidden md:block mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-orange-600">Catalog</Link>
          {currentCategory && (
            <>
              <span>/</span>
              <span className="text-orange-600 font-semibold">{currentCategory.name}</span>
            </>
          )}
          {search && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Search: &quot;{search}&quot;</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {search
                ? `Search results for "${search}"`
                : currentCategory
                  ? currentCategory.name
                  : activeBrandName
                    ? `${activeBrandName} Devices`
                    : "All Electronics & Gadgets"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Showing {filtered.length} {filtered.length === 1 ? "product" : "products"} available for pickup &amp; delivery in Ghana
            </p>
          </div>

          {search && (
            <Link
              href={category ? `/products?category=${category}` : "/products"}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold transition self-start sm:self-auto border border-orange-200"
            >
              <span>Clear search &quot;{search}&quot;</span>
              <X className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Hidden on mobile to preserve 2-column mobile experience) */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-gray-100 pb-3">
              <Filter className="w-4 h-4 text-orange-600" />
              <span>Filter Catalogue</span>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Categories
              </h3>
              <div className="space-y-1.5 text-xs">
                <Link
                  href="/products"
                  className={`block px-2.5 py-1.5 rounded-lg transition ${!category ? "bg-orange-50 font-bold text-orange-600" : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  All Categories
                </Link>
                {allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className={`block px-2.5 py-1.5 rounded-lg transition ${category === cat.slug
                        ? "bg-orange-50 font-bold text-orange-600"
                        : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Device Condition */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Device Condition
              </h3>
              <div className="space-y-1.5 text-xs">
                <Link
                  href="/products"
                  className={`block px-2.5 py-1.5 rounded-lg transition ${!condition ? "bg-orange-50 font-bold text-orange-600" : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Any Condition
                </Link>
                <Link
                  href={`/products?condition=brand_new${category ? `&category=${category}` : ""}`}
                  className={`block px-2.5 py-1.5 rounded-lg transition ${condition === "brand_new"
                      ? "bg-emerald-50 font-bold text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Brand New (Factory Sealed)
                </Link>
                <Link
                  href={`/products?condition=uk_used${category ? `&category=${category}` : ""}`}
                  className={`block px-2.5 py-1.5 rounded-lg transition ${condition === "uk_used"
                      ? "bg-amber-50 font-bold text-amber-800"
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  UK Used (Grade-A Tested)
                </Link>
              </div>
            </div>

            {/* Brands with Logos */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Partner Brands
              </h3>
              <div className="space-y-1 text-xs">
                {allBrands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/products?brand=${encodeURIComponent(b.slug || b.name)}${category ? `&category=${category}` : ""}`}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition ${brand === b.slug || brand?.toLowerCase() === b.name.toLowerCase()
                        ? "bg-orange-50 font-bold text-orange-600"
                        : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {b.logo_url && (
                      <div className="relative w-4 h-4 rounded-xs overflow-hidden shrink-0 border border-gray-200/60 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.logo_url}
                          alt={b.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span>{b.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {(category || condition || brand || search) && (
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href="/products"
                  className="block text-center text-xs font-semibold text-red-600 hover:text-red-700 py-1.5"
                >
                  Reset All Filters
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Product Grid (Screen 3: 2 columns on mobile, 3 on desktop) */}
        <main className="lg:col-span-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <h3 className="text-lg font-bold text-gray-900">No products match your filters</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Try selecting a different category or clearing your search term.
              </p>
              <Link
                href="/products"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition"
              >
                View Full Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-gray-400 text-xs">
        Loading Aki Enterprise products...
      </div>
    }>
      <ProductsList searchParams={searchParams} />
    </Suspense>
  );
}
