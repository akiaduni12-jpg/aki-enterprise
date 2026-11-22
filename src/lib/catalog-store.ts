import { Product, Category, Brand, ProductVariant } from "@/types/ecommerce";
import { PRODUCTS, CATEGORIES, BRANDS } from "./mock-data";
import { supabase, isSupabaseConfigured } from "./supabase";

const PRODUCTS_STORAGE_KEY = "techhub_custom_products";
const CATEGORIES_STORAGE_KEY = "techhub_custom_categories";
const BRANDS_STORAGE_KEY = "techhub_custom_brands";

// ============================================================================
// 1. PRODUCTS MANAGEMENT
// ============================================================================

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") {
    return PRODUCTS;
  }

  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(PRODUCTS));
      return PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PRODUCTS;
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

  // Sync to Supabase in background if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: insertedProduct, error: pError } = await supabase
        .from("products")
        .insert({
          title: product.title,
          slug: product.slug,
          description: product.description,
          base_price: product.base_price,
          images: product.images,
          features: product.features,
          specs: product.specs,
          featured: product.featured || false,
          best_seller: product.best_seller || false,
          new_arrival: product.new_arrival || false,
          is_active: true,
        })
        .select()
        .single();

      if (!pError && insertedProduct && product.variants?.length > 0) {
        await supabase.from("product_variants").insert(
          product.variants.map((v) => ({
            product_id: insertedProduct.id,
            sku: v.sku || `${product.slug}-${Date.now()}`,
            condition: v.condition || "brand_new",
            storage: v.storage,
            ram: v.ram,
            color: v.color || "Default",
            color_hex: v.color_hex || "#171717",
            battery_health: v.battery_health,
            warranty_months: v.warranty_months || 12,
            price: v.price || product.base_price,
            original_price: v.original_price,
            stock_quantity: v.stock_quantity ?? 5,
          }))
        );
      }
    } catch (err) {
      console.warn("Background Supabase sync notice:", err);
    }
  }

  return product;
}

export function updateProduct(id: string, updates: Partial<Product>): Product[] {
  const current = getStoredProducts();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveStoredProducts(updated);

  // Background sync to Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.slug) dbUpdates.slug = updates.slug;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.base_price !== undefined) dbUpdates.base_price = updates.base_price;
      if (updates.images) dbUpdates.images = updates.images;
      if (updates.features) dbUpdates.features = updates.features;
      if (updates.specs) dbUpdates.specs = updates.specs;
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
      if (updates.best_seller !== undefined) dbUpdates.best_seller = updates.best_seller;
      if (updates.category_id) dbUpdates.category_id = updates.category_id;
      if (updates.brand_id) dbUpdates.brand_id = updates.brand_id;

      if (Object.keys(dbUpdates).length > 0) {
        supabase
          .from("products")
          .update(dbUpdates)
          .or(`id.eq.${id},slug.eq.${updates.slug || id}`)
          .then((res: any) => {
            if (res?.error) console.warn("Supabase product update warning:", res.error.message);
          });
      }
    } catch (err) {
      console.warn("Background product update notice:", err);
    }
  }

  return updated;
}

export function deleteProduct(id: string): Product[] {
  const current = getStoredProducts();
  const prodToDelete = current.find((p) => p.id === id);
  const updated = current.filter((p) => p.id !== id);
  saveStoredProducts(updated);

  // Background sync to Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const matchCriteria = prodToDelete?.slug
        ? `id.eq.${id},slug.eq.${prodToDelete.slug}`
        : `id.eq.${id}`;
      supabase
        .from("products")
        .delete()
        .or(matchCriteria)
        .then((res: any) => {
          if (res?.error) console.warn("Supabase product delete warning:", res.error.message);
        });
    } catch (err) {
      console.warn("Background product delete notice:", err);
    }
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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : CATEGORIES;
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
