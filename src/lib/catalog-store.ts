import { Product, Category, Brand, ProductVariant } from "@/types/ecommerce";
import { PRODUCTS, CATEGORIES, BRANDS } from "./mock-data";
import { supabase, isSupabaseConfigured } from "./supabase";

const PRODUCTS_STORAGE_KEY = "techhub_custom_products";
const CATEGORIES_STORAGE_KEY = "techhub_custom_categories";
const BRANDS_STORAGE_KEY = "techhub_custom_brands";

// ============================================================================
// 1. PRODUCTS MANAGEMENT
// ============================================================================

let isSyncingCatalog = false;

export async function syncCatalogFromCloud(): Promise<Product[]> {
  if (typeof window === "undefined" || isSyncingCatalog) {
    return getStoredProducts();
  }
  isSyncingCatalog = true;

  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data.products));
      window.dispatchEvent(new Event("catalog_updated"));
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
      // Background sync from cloud API so mobile pulls live products
      syncCatalogFromCloud();
      return PRODUCTS;
    }

    // Trigger cloud sync to catch updates from other devices (e.g. admin on desktop)
    syncCatalogFromCloud();

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-heal any legacy expired image URLs in client localStorage
      let healed = false;
      const sanitized = parsed.map((p) => {
        let changed = false;
        const newImages = (p.images || []).map((img: string) => {
          if (img.includes("photo-1695048133142-1a20484d2569")) {
            changed = true;
            return "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80";
          }
          if (img.includes("photo-1695048132924-f72c342ebdc1")) {
            changed = true;
            return "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80";
          }
          if (img.includes("photo-1609592807963-394ff0073289")) {
            changed = true;
            return "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80";
          }
          return img;
        });
        if (changed) {
          healed = true;
          return { ...p, images: newImages };
        }
        return p;
      });
      if (healed) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(sanitized));
      }
      return sanitized;
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
        updates,
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

export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") {
    return CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(CATEGORIES));
      return CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let healed = false;
      const sanitized = parsed.map((c) => {
        if (c.image_url && c.image_url.includes("photo-1609592807963-394ff0073289")) {
          healed = true;
          return {
            ...c,
            image_url: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=600&q=80",
          };
        }
        return c;
      });
      if (healed) {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(sanitized));
      }
      return sanitized;
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

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("categories").insert({
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        icon: newCategory.icon,
        image_url: newCategory.image_url,
      });
    } catch (err) {
      console.warn("Background category sync notice:", err);
    }
  }

  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Category>): Category[] {
  const current = getStoredCategories();
  const cat = current.find((c) => c.id === id);
  const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveStoredCategories(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.slug) dbUpdates.slug = updates.slug;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.icon) dbUpdates.icon = updates.icon;
      if (updates.image_url) dbUpdates.image_url = updates.image_url;

      const matchCriteria = cat?.slug ? `id.eq.${id},slug.eq.${cat.slug}` : `id.eq.${id}`;
      supabase
        .from("categories")
        .update(dbUpdates)
        .or(matchCriteria)
        .then((res: any) => {
          if (res?.error) console.warn("Supabase category update warning:", res.error.message);
        });
    } catch (err) {
      console.warn("Background category update notice:", err);
    }
  }

  return updated;
}

export function deleteCategory(id: string): Category[] {
  const current = getStoredCategories();
  const catToDelete = current.find((c) => c.id === id);
  const updated = current.filter((c) => c.id !== id);
  saveStoredCategories(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const matchCriteria = catToDelete?.slug
        ? `id.eq.${id},slug.eq.${catToDelete.slug}`
        : `id.eq.${id}`;
      supabase
        .from("categories")
        .delete()
        .or(matchCriteria)
        .then((res: any) => {
          if (res?.error) console.warn("Supabase category delete warning:", res.error.message);
        });
    } catch (err) {
      console.warn("Background category delete notice:", err);
    }
  }

  return updated;
}

// ============================================================================
// 3. BRANDS MANAGEMENT
// ============================================================================

export function getStoredBrands(): Brand[] {
  if (typeof window === "undefined") {
    return BRANDS;
  }

  try {
    const raw = localStorage.getItem(BRANDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(BRANDS));
      return BRANDS;
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

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("brands").insert({
        name: newBrand.name,
        slug: newBrand.slug,
        logo_url: newBrand.logo_url,
      });
    } catch (err) {
      console.warn("Background brand sync notice:", err);
    }
  }

  return newBrand;
}

export function updateBrand(id: string, updates: Partial<Brand>): Brand[] {
  const current = getStoredBrands();
  const brand = current.find((b) => b.id === id);
  const updated = current.map((b) => (b.id === id ? { ...b, ...updates } : b));
  saveStoredBrands(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.slug) dbUpdates.slug = updates.slug;
      if (updates.logo_url) dbUpdates.logo_url = updates.logo_url;

      const matchCriteria = brand?.slug ? `id.eq.${id},slug.eq.${brand.slug}` : `id.eq.${id}`;
      supabase
        .from("brands")
        .update(dbUpdates)
        .or(matchCriteria)
        .then((res: any) => {
          if (res?.error) console.warn("Supabase brand update warning:", res.error.message);
        });
    } catch (err) {
      console.warn("Background brand update notice:", err);
    }
  }

  return updated;
}

export function deleteBrand(id: string): Brand[] {
  const current = getStoredBrands();
  const brandToDelete = current.find((b) => b.id === id);
  const updated = current.filter((b) => b.id !== id);
  saveStoredBrands(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const matchCriteria = brandToDelete?.slug
        ? `id.eq.${id},slug.eq.${brandToDelete.slug}`
        : `id.eq.${id}`;
      supabase
        .from("brands")
        .delete()
        .or(matchCriteria)
        .then((res: any) => {
          if (res?.error) console.warn("Supabase brand delete warning:", res.error.message);
        });
    } catch (err) {
      console.warn("Background brand delete notice:", err);
    }
  }

  return updated;
}
