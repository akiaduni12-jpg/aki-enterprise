import { HeroBanner } from "@/types/ecommerce";
import { INITIAL_HERO_BANNERS } from "./mock-data";

const BANNERS_STORAGE_KEY = "techhub_hero_banners";

export function getStoredBanners(): HeroBanner[] {
  if (typeof window === "undefined") {
    return INITIAL_HERO_BANNERS;
  }

  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(INITIAL_HERO_BANNERS));
      // Background sync from API
      syncBannersFromCloud();
      return INITIAL_HERO_BANNERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let healed = false;
      const sanitized = parsed.map((b) => {
        if (b.image_url && b.image_url.includes("photo-1695048133142-1a20484d2569")) {
          healed = true;
          return {
            ...b,
            image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1920&q=80",
          };
        }
        if (b.image_url && b.image_url.includes("photo-1609592807963-394ff0073289")) {
          healed = true;
          return {
            ...b,
            image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1920&q=80",
          };
        }
        return b;
      });
      if (healed) {
        localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(sanitized));
      }
      return sanitized;
    }
    return INITIAL_HERO_BANNERS;
  } catch (error) {
    console.error("Error reading stored banners:", error);
    return INITIAL_HERO_BANNERS;
  }
}

export async function syncBannersFromCloud(): Promise<HeroBanner[]> {
  if (typeof window === "undefined") return INITIAL_HERO_BANNERS;

  try {
    const res = await fetch("/api/banners");
    const data = await res.json();
    if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(data.banners));
      window.dispatchEvent(new Event("banners_updated"));
      return data.banners;
    }
  } catch (err) {
    console.warn("Could not sync banners from cloud:", err);
  }
  return getStoredBanners();
}

export function saveStoredBanners(banners: HeroBanner[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new Event("banners_updated"));
  } catch (error) {
    console.error("Error saving banners:", error);
  }
}

export function addBanner(bannerData: Omit<HeroBanner, "id" | "created_at">): HeroBanner {
  const current = getStoredBanners();
  const newBanner: HeroBanner = {
    ...bannerData,
    id: `banner-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const updated = [...current, newBanner];
  saveStoredBanners(updated);

  // Sync to backend Supabase API in background
  if (typeof window !== "undefined") {
    fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBanner),
    }).catch((e) => console.warn("Banner background sync notice:", e));
  }

  return newBanner;
}

export function updateBanner(id: string, updates: Partial<HeroBanner>): HeroBanner[] {
  const current = getStoredBanners();
  const updated = current.map((b) => (b.id === id ? { ...b, ...updates } : b));
  saveStoredBanners(updated);

  const target = updated.find((b) => b.id === id);
  if (target && typeof window !== "undefined") {
    fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(target),
    }).catch((e) => console.warn("Banner background sync notice:", e));
  }

  return updated;
}

export function toggleBannerStatus(id: string): HeroBanner[] {
  const current = getStoredBanners();
  const updated = current.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b));
  saveStoredBanners(updated);

  const target = updated.find((b) => b.id === id);
  if (target && typeof window !== "undefined") {
    fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(target),
    }).catch((e) => console.warn("Banner background sync notice:", e));
  }

  return updated;
}

export function deleteBanner(id: string): HeroBanner[] {
  const current = getStoredBanners();
  const updated = current.filter((b) => b.id !== id);
  saveStoredBanners(updated);

  if (typeof window !== "undefined") {
    fetch(`/api/banners?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((e) => console.warn("Banner background sync notice:", e));
  }

  return updated;
}
