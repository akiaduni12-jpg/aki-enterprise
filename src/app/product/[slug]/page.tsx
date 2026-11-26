import React from "react";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/mock-data";
import { getProducts } from "@/lib/db-service";
import { ProductDetailClient } from "@/components/product-detail-client";
import { Product } from "@/types/ecommerce";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

function normalizeSlug(s: string): string {
  if (!s) return "";
  try {
    return decodeURIComponent(s)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  } catch {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
}

export async function findProductBySlugOrId(rawSlug: string): Promise<Product | null> {
  const allProducts = await getProducts();
  const rawClean = (rawSlug || "").trim();
  const decodedClean = (() => {
    try {
      return decodeURIComponent(rawClean).trim();
    } catch {
      return rawClean;
    }
  })();
  const targetNorm = normalizeSlug(rawClean);

  // 1. Direct exact slug match
  let product = allProducts.find(
    (p) => p.slug === rawClean || p.slug === decodedClean
  );
  if (product) return product;

  // 2. Normalized kebab-case slug match
  product = allProducts.find((p) => normalizeSlug(p.slug) === targetNorm);
  if (product) return product;

  // 3. Match against product title (clean or normalized)
  product = allProducts.find(
    (p) =>
      p.title.trim().toLowerCase() === decodedClean.toLowerCase() ||
      normalizeSlug(p.title) === targetNorm
  );
  if (product) return product;

  // 4. Match against ID
  product = allProducts.find((p) => p.id === rawClean || p.id === decodedClean);
  if (product) return product;

  // 5. Fallback search against built-in mock products
  product =
    PRODUCTS.find((p) => p.slug === rawClean || p.slug === decodedClean) ||
    PRODUCTS.find((p) => normalizeSlug(p.slug) === targetNorm) ||
    PRODUCTS.find((p) => normalizeSlug(p.title) === targetNorm) ||
    PRODUCTS.find((p) => p.id === rawClean);

  return product || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProductBySlugOrId(slug);

  if (!product) {
    return {
      title: "Product Not Found | AKI ADUNI VENTURES",
    };
  }

  const primaryPrice = product.variants?.[0]?.price || product.base_price;
  const mainImage = product.images?.[0] || "/icons/icon-512.png";

  return {
    title: `${product.title} - Price & Specs | AKI ADUNI VENTURES (Ghana)`,
    description: `${product.description} Available in Ghana at GH₵ ${primaryPrice.toLocaleString()}. Fast delivery nationwide & store warranty.`,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.title} | AKI ADUNI VENTURES`,
      description: product.description,
      url: `https://akiaduniventures.com/product/${product.slug}`,
      siteName: "AKI ADUNI VENTURES",
      locale: "en_GH",
      type: "website",
      images: [
        {
          url: mainImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | AKI ADUNI VENTURES`,
      description: product.description,
      images: [mainImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await findProductBySlugOrId(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();

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

  const primaryVariant = product.variants?.[0];
  const price = primaryVariant?.price || product.base_price;
  const isUkUsed = primaryVariant?.condition === "uk_used";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.images && product.images.length > 0 ? product.images : ["https://akiaduniventures.com/icons/icon-512.png"],
    "description": product.description,
    "sku": primaryVariant?.sku || product.slug,
    "brand": {
      "@type": "Brand",
      "name": product.brand_name || "AKI ADUNI VENTURES",
    },
    "category": product.category_name,
    "offers": {
      "@type": "Offer",
      "url": `https://akiaduniventures.com/product/${product.slug}`,
      "priceCurrency": "GHS",
      "price": price,
      "itemCondition": isUkUsed ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
      "availability": (primaryVariant?.stock_quantity ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "AKI ADUNI VENTURES",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
