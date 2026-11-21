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

  return <ProductDetailClient product={product} />;
}
