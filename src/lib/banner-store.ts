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
      return INITIAL_HERO_BANNERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_HERO_BANNERS;
  } catch (error) {
    console.error("Error reading stored banners:", error);
    return INITIAL_HERO_BANNERS;
  }
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
  return newBanner;
}

export function updateBanner(id: string, updates: Partial<HeroBanner>): HeroBanner[] {
  const current = getStoredBanners();
  const updated = current.map((b) => (b.id === id ? { ...b, ...updates } : b));
  saveStoredBanners(updated);
  return updated;
}

export function toggleBannerStatus(id: string): HeroBanner[] {
  const current = getStoredBanners();
  const updated = current.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b));
  saveStoredBanners(updated);
  return updated;
}

export function deleteBanner(id: string): HeroBanner[] {
  const current = getStoredBanners();
  const updated = current.filter((b) => b.id !== id);
  saveStoredBanners(updated);
  return updated;
}
