import { Product, Category, Brand, ProductVariant } from "@/types/ecommerce";
import { PRODUCTS, CATEGORIES, BRANDS } from "./mock-data";

const PRODUCTS_STORAGE_KEY = "techhub_custom_products";
const CATEGORIES_STORAGE_KEY = "techhub_custom_categories";
const BRANDS_STORAGE_KEY = "techhub_custom_brands";

// ============================================================================
// 1. PRODUCTS MANAGEMENT
// ============================================================================

let isSyncingCatalog = false;
let hasInitializedProductSync = false;

export async function syncCatalogFromCloud(): Promise<Product[]> {
  if (typeof window === "undefined" || isSyncingCatalog) {
    return getStoredProducts();
  }
  isSyncingCatalog = true;

  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      const currentRaw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const newRaw = JSON.stringify(data.products);
      if (currentRaw !== newRaw) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, newRaw);
        window.dispatchEvent(new Event("catalog_updated"));
      }
      return data.products;
    }
  } catch (err) {
    console.warn("Could not sync catalog from cloud:", err);
  } finally {
    isSyncingCatalog = false;
  }
  return getStoredProducts();
}

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") {
    return PRODUCTS;
  }

  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(PRODUCTS));
      if (!hasInitializedProductSync) {
        hasInitializedProductSync = true;
        setTimeout(() => syncCatalogFromCloud(), 50);
      }
      return PRODUCTS;
    }

    if (!hasInitializedProductSync) {
      hasInitializedProductSync = true;
      setTimeout(() => syncCatalogFromCloud(), 100);
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return PRODUCTS;
  } catch (err) {
    console.error("Error reading stored products:", err);
    return PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("catalog_updated"));
  } catch (err) {
    console.error("Error saving products:", err);
  }
}

export async function addProduct(
  newProductData: Omit<Product, "id" | "created_at">
): Promise<Product> {
  const current = getStoredProducts();
  const id = `prod-${Date.now()}`;
  const slug =
    newProductData.slug ||
    newProductData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const product: Product = {
    ...newProductData,
    id,
    slug,
    created_at: new Date().toISOString(),
  };

  const updated = [product, ...current];
  saveStoredProducts(updated);

  // Sync to Cloud via Backend API
  if (typeof window !== "undefined") {
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    }).catch((err) => console.warn("Cloud product sync notice:", err));
  }

  return product;
}

export function updateProduct(id: string, updates: Partial<Product>): Product[] {
  const current = getStoredProducts();
  const target = current.find((p) => p.id === id);
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveStoredProducts(updated);

  // Sync to Cloud via Backend API
  if (typeof window !== "undefined") {
    fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        slug: updates.slug || target?.slug || id,
        updates: {
          ...updates,
          category_id: updates.category_id || target?.category_id,
          category_slug: updates.category_slug || target?.category_slug,
          brand_id: updates.brand_id || target?.brand_id,
          brand_name: updates.brand_name || target?.brand_name,
        },
      }),
    }).catch((err) => console.warn("Cloud product update notice:", err));
  }

  return updated;
}

export function deleteProduct(id: string): Product[] {
  const current = getStoredProducts();
  const prodToDelete = current.find((p) => p.id === id);
  const updated = current.filter((p) => p.id !== id);
  saveStoredProducts(updated);

  // Sync to Cloud via Backend API
  if (typeof window !== "undefined") {
    const slug = prodToDelete?.slug || "";
    fetch(`/api/products?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Cloud product delete notice:", err));
  }

  return updated;
}

// ============================================================================
// 2. CATEGORIES MANAGEMENT
// ============================================================================

let isSyncingCategories = false;
let hasInitializedCategorySync = false;

export async function syncCategoriesFromCloud(): Promise<Category[]> {
  if (typeof window === "undefined" || isSyncingCategories) {
    return getStoredCategories();
  }
  isSyncingCategories = true;

  try {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
      const currentRaw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      const newRaw = JSON.stringify(data.categories);
      if (currentRaw !== newRaw) {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, newRaw);
        window.dispatchEvent(new Event("catalog_updated"));
      }
      return data.categories;
    }
  } catch (err) {
    console.warn("Could not sync categories from cloud:", err);
  } finally {
    isSyncingCategories = false;
  }
  return getStoredCategories();
}

export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") {
    return CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(CATEGORIES));
      if (!hasInitializedCategorySync) {
        hasInitializedCategorySync = true;
        setTimeout(() => syncCategoriesFromCloud(), 50);
      }
      return CATEGORIES;
    }

    if (!hasInitializedCategorySync) {
      hasInitializedCategorySync = true;
      setTimeout(() => syncCategoriesFromCloud(), 150);
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return CATEGORIES;
  } catch (err) {
    console.error("Error reading stored categories:", err);
    return CATEGORIES;
  }
}

export function saveStoredCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new Event("catalog_updated"));
  } catch (err) {
    console.error("Error saving categories:", err);
  }
}

export async function addCategory(categoryData: {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image_url?: string;
}): Promise<Category> {
  const current = getStoredCategories();
  const id = `cat-${Date.now()}`;
  const slug =
    categoryData.slug ||
    categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const newCategory: Category = {
    id,
    name: categoryData.name,
    slug,
    description: categoryData.description || "",
    icon: categoryData.icon || "FolderTree",
    image_url: categoryData.image_url,
    created_at: new Date().toISOString(),
  };

  const updated = [...current, newCategory];
  saveStoredCategories(updated);

  // Sync to Cloud via Backend API
  if (typeof window !== "undefined") {
    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    }).catch((err) => console.warn("Cloud category sync notice:", err));
  }

  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Category>): Category[] {
  const current = getStoredCategories();
  const cat = current.find((c) => c.id === id);
  const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveStoredCategories(updated);

  // Sync to Cloud via Backend API
  if (typeof window !== "undefined") {
    fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        slug: updates.slug || cat?.slug || id,
        updates,
      }),
    }).catch((err) => console.warn("Cloud category update notice:", err));
  }

  return updated;
}

export function deleteCategory(id: string): Category[] {
  const current = getStoredCategories();
  const catToDelete = current.find((c) => c.id === id);
  const updated = current.filter((c) => c.id !== id);
  saveStoredCategories(updated);

  // Sync to Cloud via Backend API
  if (typeof window !== "undefined") {
    const slug = catToDelete?.slug || "";
    fetch(`/api/categories?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Cloud category delete notice:", err));
  }

  return updated;
}

// ============================================================================
// 3. BRANDS MANAGEMENT
// ============================================================================

let isSyncingBrands = false;
let hasInitializedBrandSync = false;

export async function syncBrandsFromCloud(): Promise<Brand[]> {
  if (typeof window === "undefined" || isSyncingBrands) {
    return getStoredBrands();
  }
  isSyncingBrands = true;

  try {
    const res = await fetch("/api/brands");
    const data = await res.json();
    if (data.success && Array.isArray(data.brands) && data.brands.length > 0) {
      const currentRaw = localStorage.getItem(BRANDS_STORAGE_KEY);
      const newRaw = JSON.stringify(data.brands);
      if (currentRaw !== newRaw) {
        localStorage.setItem(BRANDS_STORAGE_KEY, newRaw);
        window.dispatchEvent(new Event("catalog_updated"));
      }
      return data.brands;
    }
  } catch (err) {
    console.warn("Could not sync brands from cloud:", err);
  } finally {
    isSyncingBrands = false;
  }
  return getStoredBrands();
}

export function getStoredBrands(): Brand[] {
  if (typeof window === "undefined") {
    return BRANDS;
  }

  try {
    const raw = localStorage.getItem(BRANDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(BRANDS));
      if (!hasInitializedBrandSync) {
        hasInitializedBrandSync = true;
        setTimeout(() => syncBrandsFromCloud(), 50);
      }
      return BRANDS;
    }

    if (!hasInitializedBrandSync) {
      hasInitializedBrandSync = true;
      setTimeout(() => syncBrandsFromCloud(), 200);
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : BRANDS;
  } catch (err) {
    console.error("Error reading stored brands:", err);
    return BRANDS;
  }
}

export function saveStoredBrands(brands: Brand[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
    window.dispatchEvent(new Event("catalog_updated"));
  } catch (err) {
    console.error("Error saving brands:", err);
  }
}

export async function addBrand(brandData: {
  name: string;
  slug?: string;
  logo_url?: string;
  country?: string;
}): Promise<Brand> {
  const current = getStoredBrands();
  const id = `brand-${Date.now()}`;
  const slug =
    brandData.slug ||
    brandData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const newBrand: Brand = {
    id,
    name: brandData.name,
    slug,
    logo_url: brandData.logo_url || "",
    created_at: new Date().toISOString(),
  };

  const updated = [...current, newBrand];
  saveStoredBrands(updated);

  // Sync to Cloud via Backend API
  if (typeof window !== "undefined") {
    fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBrand),
    }).catch((err) => console.warn("Cloud brand sync notice:", err));
  }

  return newBrand;
}

export function updateBrand(id: string, updates: Partial<Brand>): Brand[] {
  const current = getStoredBrands();
  const brand = current.find((b) => b.id === id);
  const updated = current.map((b) => (b.id === id ? { ...b, ...updates } : b));
  saveStoredBrands(updated);

  // Sync to Cloud via Backend API
  if (typeof window !== "undefined") {
    fetch("/api/brands", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        slug: updates.slug || brand?.slug || id,
        updates,
      }),
    }).catch((err) => console.warn("Cloud brand update notice:", err));
  }

  return updated;
}

export function deleteBrand(id: string): Brand[] {
  const current = getStoredBrands();
  const brandToDelete = current.find((b) => b.id === id);
  const updated = current.filter((b) => b.id !== id);
  saveStoredBrands(updated);

  // Sync to Cloud via Backend API
  if (typeof window !== "undefined") {
    const slug = brandToDelete?.slug || "";
    fetch(`/api/brands?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Cloud brand delete notice:", err));
  }

  return updated;
}
