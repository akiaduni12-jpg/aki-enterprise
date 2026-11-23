"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/ecommerce";
import { ProductCard } from "@/components/product-card";
import { getStoredProducts } from "@/lib/catalog-store";
import Link from "next/link";

interface CatalogGridProps {
  initialProducts: Product[];
  category?: string;
  brand?: string;
  condition?: string;
  search?: string;
  featured?: string;
  best_seller?: string;
}

export function CatalogGrid({
  initialProducts,
  category,
  brand,
  condition,
  search,
  featured,
  best_seller,
}: CatalogGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const syncProducts = () => {
      const stored = getStoredProducts();
      if (!stored || stored.length === 0) return;

      let filtered = [...stored];
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
      if (best_seller === "true") {
        filtered = filtered.filter((p) => p.best_seller);
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
          return (
            matchTitle ||
            matchDesc ||
            matchCat ||
            matchBrand ||
            matchFeatures ||
            matchVariants
          );
        });
      }
      setProducts(filtered);
    };

    syncProducts();
    window.addEventListener("catalog_updated", syncProducts);
    return () => window.removeEventListener("catalog_updated", syncProducts);
  }, [category, brand, condition, search, featured, best_seller]);

  if (products.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
