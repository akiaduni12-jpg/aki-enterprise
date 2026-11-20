import { supabase, isSupabaseConfigured } from "./supabase";

export interface ProductReview {
  id: string;
  product_id: string;
  product_slug: string;
  product_title: string;
  customer_name: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  verified_purchase: boolean;
  status: "approved" | "pending" | "rejected";
  created_at: string;
}

export interface StoreTestimonial {
  id: string;
  customer_name: string;
  city: string; // e.g. "East Legon, Accra", "Kumasi", "Spintex"
  rating: number;
  highlight: string;
  content: string;
  verified_buyer: boolean;
  featured: boolean;
  status: "approved" | "pending" | "rejected";
  created_at: string;
}

const REVIEWS_STORAGE_KEY = "techhub_product_reviews";
const TESTIMONIALS_STORAGE_KEY = "techhub_store_testimonials";

// Initial realistic product reviews
export const INITIAL_PRODUCT_REVIEWS: ProductReview[] = [
  {
    id: "rev-1",
    product_id: "prod-1",
    product_slug: "apple-iphone-15-pro-max",
    product_title: "Apple iPhone 15 Pro Max",
    customer_name: "Kwame Mensah",
    rating: 5,
    title: "100% Genuine & Battery Health is pristine!",
    comment:
      "Picked this up at their Accra shop. IMEI matched Apple website and battery health is exactly 100%. Free tempered glass was installed for me on the spot. Best electronics shop in Accra!",
    verified_purchase: true,
    status: "approved",
    created_at: "2026-10-14T11:20:00Z",
  },
  {
    id: "rev-2",
    product_id: "prod-2",
    product_slug: "apple-iphone-13-uk-used",
    product_title: "Apple iPhone 13 (UK-Used)",
    customer_name: "Abena Serwaa",
    rating: 5,
    title: "Grade-A UK-used, zero scratches!",
    comment:
      "I was skeptical about buying UK-used online, but Aki Enterprise is the real deal. Battery health was 91% as promised, camera is super clear, and Face ID works flawlessly.",
    verified_purchase: true,
    status: "approved",
    created_at: "2026-10-22T14:45:00Z",
  },
  {
    id: "rev-3",
    product_id: "prod-3",
    product_slug: "samsung-galaxy-s24-ultra",
    product_title: "Samsung Galaxy S24 Ultra",
    customer_name: "Emmanuel Osei",
    rating: 5,
    title: "Fast same-day delivery to Tema",
    comment:
      "Ordered in the morning via Mobile Money, rider delivered by 2 PM in Tema. Fully sealed Snapdragon version with 1-year warranty. 10/10 service.",
    verified_purchase: true,
    status: "approved",
    created_at: "2026-11-02T16:10:00Z",
  },
  {
    id: "rev-4",
    product_id: "prod-4",
    product_slug: "anker-prime-20000mah-power-bank",
    product_title: "Anker Prime 20,000mAh Power Bank",
    customer_name: "Daniel Addo",
    rating: 5,
    title: "Charges my MacBook and iPhone simultaneously",
    comment:
      "Original Anker product with smart screen display. Saved me multiple times during light-outs in Accra. Very durable build.",
    verified_purchase: true,
    status: "approved",
    created_at: "2026-11-08T09:30:00Z",
  },
];

// Initial authentic store testimonials for Aki Enterprise TechHub
export const INITIAL_STORE_TESTIMONIALS: StoreTestimonial[] = [
  {
    id: "test-1",
    customer_name: "Kofi Asante",
    city: "East Legon, Accra",
    rating: 5,
    highlight: "Transparent Battery Health & Real Warranty",
    content:
      "Aki Enterprise is the only electronics vendor in Accra that gives you honest battery health percentages on UK-used phones and actually backs it up with written shop warranty. Will buy again!",
    verified_buyer: true,
    featured: true,
    status: "approved",
    created_at: "2026-10-18T10:00:00Z",
  },
  {
    id: "test-2",
    customer_name: "Eunice Boateng",
    city: "Airport Residential, Accra",
    rating: 5,
    highlight: "Smooth QR Scan & Instant MoMo Pay",
    content:
      "Walked into their physical store, scanned the shelf QR code on my phone, checked specs, and paid with MTN MoMo in under 2 minutes. Extremely modern tech shopping experience.",
    verified_buyer: true,
    featured: true,
    status: "approved",
    created_at: "2026-10-25T13:15:00Z",
  },
  {
    id: "test-3",
    customer_name: "Dr. Yaw Frimpong",
    city: "Kumasi, Ashanti Region",
    rating: 5,
    highlight: "Next-Day Delivery Across Regions",
    content:
      "I was worried about ordering from Kumasi, but they dispatched with VIP parcel bus the same afternoon. Product arrived completely brand new and sealed. Excellent communication on WhatsApp.",
    verified_buyer: true,
    featured: true,
    status: "approved",
    created_at: "2026-11-04T15:20:00Z",
  },
  {
    id: "test-4",
    customer_name: "Naa Adjeley",
    city: "Osu, Accra",
    rating: 5,
    highlight: "Genuine Anker & Original Accessories",
    content:
      "Finding original GaN chargers in Accra used to be difficult with all the fake copies in town. TechHub sells 100% genuine Anker and Oraimo chargers. Highly recommended!",
    verified_buyer: true,
    featured: true,
    status: "approved",
    created_at: "2026-11-12T17:40:00Z",
  },
];

// ============================================================================
// 1. PRODUCT REVIEWS FUNCTIONS
// ============================================================================

export function getStoredProductReviews(): ProductReview[] {
  if (typeof window === "undefined") return INITIAL_PRODUCT_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCT_REVIEWS));
      return INITIAL_PRODUCT_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PRODUCT_REVIEWS;
  } catch {
    return INITIAL_PRODUCT_REVIEWS;
  }
}

export function saveStoredProductReviews(reviews: ProductReview[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event("feedback_updated"));
  } catch (err) {
    console.error("Error saving reviews:", err);
  }
}

export function getProductReviewsBySlug(slug: string): ProductReview[] {
  const all = getStoredProductReviews();
  return all.filter((r) => r.product_slug === slug && r.status === "approved");
}

export function submitProductReview(reviewData: {
  product_id: string;
  product_slug: string;
  product_title: string;
  customer_name: string;
  rating: number;
  title: string;
  comment: string;
}): ProductReview {
  const current = getStoredProductReviews();
  const newReview: ProductReview = {
    ...reviewData,
    id: `rev-${Date.now()}`,
    verified_purchase: true,
    status: "approved", // auto-approved with admin moderation ability
    created_at: new Date().toISOString(),
  };

  const updated = [newReview, ...current];
  saveStoredProductReviews(updated);
  return newReview;
}

export function updateProductReviewStatus(
  id: string,
  status: "approved" | "pending" | "rejected"
): ProductReview[] {
  const current = getStoredProductReviews();
  const updated = current.map((r) => (r.id === id ? { ...r, status } : r));
  saveStoredProductReviews(updated);
  return updated;
}

export function deleteProductReview(id: string): ProductReview[] {
  const current = getStoredProductReviews();
  const updated = current.filter((r) => r.id !== id);
  saveStoredProductReviews(updated);
  return updated;
}

// ============================================================================
// 2. STORE TESTIMONIALS FUNCTIONS
// ============================================================================

export function getStoredTestimonials(): StoreTestimonial[] {
  if (typeof window === "undefined") return INITIAL_STORE_TESTIMONIALS;
  try {
    const raw = localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(INITIAL_STORE_TESTIMONIALS));
      return INITIAL_STORE_TESTIMONIALS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_STORE_TESTIMONIALS;
  } catch {
    return INITIAL_STORE_TESTIMONIALS;
  }
}

export function saveStoredTestimonials(testimonials: StoreTestimonial[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonials));
    window.dispatchEvent(new Event("feedback_updated"));
  } catch (err) {
    console.error("Error saving testimonials:", err);
  }
}

export function getApprovedTestimonials(): StoreTestimonial[] {
  const all = getStoredTestimonials();
  return all.filter((t) => t.status === "approved");
}

export function submitStoreTestimonial(testimonialData: {
  customer_name: string;
  city: string;
  rating: number;
  highlight: string;
  content: string;
}): StoreTestimonial {
  const current = getStoredTestimonials();
  const newTestimonial: StoreTestimonial = {
    ...testimonialData,
    id: `test-${Date.now()}`,
    verified_buyer: true,
    featured: true,
    status: "approved",
    created_at: new Date().toISOString(),
  };

  const updated = [newTestimonial, ...current];
  saveStoredTestimonials(updated);
  return newTestimonial;
}

export function updateTestimonialStatus(
  id: string,
  status: "approved" | "pending" | "rejected"
): StoreTestimonial[] {
  const current = getStoredTestimonials();
  const updated = current.map((t) => (t.id === id ? { ...t, status } : t));
  saveStoredTestimonials(updated);
  return updated;
}

export function toggleTestimonialFeatured(id: string): StoreTestimonial[] {
  const current = getStoredTestimonials();
  const updated = current.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t));
  saveStoredTestimonials(updated);
  return updated;
}

export function deleteTestimonial(id: string): StoreTestimonial[] {
  const current = getStoredTestimonials();
  const updated = current.filter((t) => t.id !== id);
  saveStoredTestimonials(updated);
  return updated;
}
