import { Product, Order } from "@/types/ecommerce";
import { getStoredProducts } from "./catalog-store";

const WISHLIST_STORAGE_KEY = "aki_enterprise_wishlist";
const CUSTOMER_PROFILE_KEY = "aki_enterprise_profile";
const CUSTOMER_ORDERS_KEY = "aki_enterprise_orders";

// Legacy fallbacks for smooth migration from previous session
const LEGACY_WISHLIST_KEY = "techhub_customer_wishlist";
const LEGACY_PROFILE_KEY = "techhub_guest_profile";
const LEGACY_PROFILE_ALT_KEY = "techhub_customer_profile";
const LEGACY_ORDERS_KEY = "techhub_customer_orders";

export interface CustomerProfile {
  full_name: string;
  phone: string;
  email: string;
  delivery_address: string;
  city: string;
  notes?: string;
  created_at?: string;
}

// ============================================================================
// 1. WISHLIST / FAVORITES (No Account Required)
// ============================================================================

export function getWishlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY) || localStorage.getItem(LEGACY_WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWishlistIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("wishlist_updated"));
  } catch (err) {
    console.error("Error saving wishlist:", err);
  }
}

export function toggleWishlist(productId: string): boolean {
  const current = getWishlistIds();
  const exists = current.includes(productId);
  const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
  saveWishlistIds(updated);
  return !exists;
}

export function isItemInWishlist(productId: string): boolean {
  const current = getWishlistIds();
  return current.includes(productId);
}

export function getWishlistProducts(): Product[] {
  const ids = getWishlistIds();
  const all = getStoredProducts();
  return all.filter((p) => ids.includes(p.id) || ids.includes(p.slug));
}

// ============================================================================
// 2. GUEST CUSTOMER PROFILE (Instant Checkout Without Passwords)
// ============================================================================

export function getCustomerProfile(): CustomerProfile {
  const empty: CustomerProfile = {
    full_name: "",
    phone: "",
    email: "",
    delivery_address: "",
    city: "Accra",
  };

  if (typeof window === "undefined") return empty;

  try {
    const raw =
      localStorage.getItem(CUSTOMER_PROFILE_KEY) ||
      localStorage.getItem(LEGACY_PROFILE_KEY) ||
      localStorage.getItem(LEGACY_PROFILE_ALT_KEY);
    if (!raw) return empty;
    return JSON.parse(raw);
  } catch {
    return empty;
  }
}

export function saveCustomerProfile(profile: CustomerProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("profile_updated"));
  } catch (err) {
    console.error("Error saving profile:", err);
  }
}

export function clearCustomerProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CUSTOMER_PROFILE_KEY);
    localStorage.removeItem(LEGACY_PROFILE_KEY);
    localStorage.removeItem(LEGACY_PROFILE_ALT_KEY);
    window.dispatchEvent(new Event("profile_updated"));
  } catch (err) {
    console.error("Error clearing profile:", err);
  }
}

// ============================================================================
// 3. CUSTOMER ORDERS (Device History & Multi-Order Lookup)
// ============================================================================

export function getCustomerOrders(): Partial<Order>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_KEY) || localStorage.getItem(LEGACY_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordCustomerOrder(order: Partial<Order>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getCustomerOrders();
    const updated = [order, ...current.filter((o) => o.order_number !== order.order_number)];
    localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("orders_updated"));
  } catch (err) {
    console.error("Error recording customer order:", err);
  }
}

export function clearCustomerOrders(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CUSTOMER_ORDERS_KEY);
    localStorage.removeItem(LEGACY_ORDERS_KEY);
    window.dispatchEvent(new Event("orders_updated"));
  } catch (err) {
    console.error("Error clearing customer orders:", err);
  }
}

export function lookupOrder(query: string): Partial<Order> | null {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return null;

  const orders = getCustomerOrders();
  return (
    orders.find(
      (o) =>
        o.order_number?.toLowerCase() === trimmed ||
        o.customer?.phone?.replace(/\s+/g, "").includes(trimmed) ||
        o.customer?.email?.toLowerCase() === trimmed
    ) || null
  );
}
