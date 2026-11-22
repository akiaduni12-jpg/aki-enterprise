import React from "react";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/mock-data";
import { getProducts } from "@/lib/db-service";
import { ProductDetailClient } from "@/components/product-detail-client";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const allProducts = await getProducts();
  const product = allProducts.find((p) => p.slug === slug) || PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found | AKI ENTERPRISE",
    };
  }

  return {
    title: `${product.title} - Price & Specs | AKI ENTERPRISE (Ghana)`,
    description: product.description,
    openGraph: {
      title: `${product.title} | AKI ENTERPRISE`,
      description: product.description,
      images: [{ url: product.images[0] || "" }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const allProducts = await getProducts();
  const product = allProducts.find((p) => p.slug === slug) || PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Find up to 4 related / recommended products
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      // Prioritize same category first
      if (a.category_slug === product.category_slug && b.category_slug !== product.category_slug) return -1;
      if (b.category_slug === product.category_slug && a.category_slug !== product.category_slug) return 1;
      // Then prioritize same brand
      if (a.brand_id === product.brand_id && b.brand_id !== product.brand_id) return -1;
      if (b.brand_id === product.brand_id && a.brand_id !== product.brand_id) return 1;
      return 0;
    })
    .slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
