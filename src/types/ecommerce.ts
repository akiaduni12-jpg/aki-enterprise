export type ProductCondition = "brand_new" | "uk_used" | "refurbished";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type FulfillmentType = "shop_pickup" | "delivery";

export type PaymentMethod = "paystack_momo" | "paystack_card" | "cash_on_pickup";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  condition: ProductCondition;
  storage?: string; // e.g. "128GB", "256GB", "512GB", "1TB"
  ram?: string; // e.g. "6GB", "8GB", "12GB", "16GB"
  color: string; // e.g. "Space Black", "Deep Purple", "Titanium Natural"
  color_hex?: string;
  battery_health?: string; // e.g. "88%+", "95%+", "100%" (important for UK-used iPhones)
  warranty_months: number; // e.g. 6, 12, 24
  price: number; // in GHS
  original_price?: number; // for strike-through discount display
  stock_quantity: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand_id: string;
  brand_name: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  description: string;
  features: string[];
  specs: Record<string, string>; // e.g. { "Screen": "6.7 inch OLED", "Processor": "A16 Bionic" }
  images: string[];
  base_price: number;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  variants: ProductVariant[];
  created_at: string;
}

export interface CartItem {
  variant_id: string;
  product: Product;
  selected_variant: ProductVariant;
  quantity: number;
}

export interface CustomerInfo {
  full_name: string;
  phone: string; // Ghanaian mobile number (e.g. 0244XXXXXX or +233...)
  email?: string;
  delivery_address?: string;
  city?: string;
  delivery_notes?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_title: string;
  variant_sku: string;
  condition: ProductCondition;
  storage?: string;
  ram?: string;
  color: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. TH-2026-8921
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  fulfillment_type: FulfillmentType;
  payment_method: PaymentMethod;
  payment_status: "unpaid" | "paid" | "failed";
  order_status: OrderStatus;
  paystack_reference?: string;
  qr_campaign_id?: string; // if scan attributed
  created_at: string;
  updated_at: string;
}

export interface QRCampaign {
  id: string;
  campaign_name: string;
  slug: string;
  destination_path: string; // e.g. /products?category=smartphones or /product/iphone-15-pro-max
  location_tag: string; // e.g. "Main Shop Entrance Banner", "Osu Branch Counter", "Accra Mall Flysheet"
  is_active: boolean;
  scans_count: number;
  orders_count: number;
  total_revenue: number;
  created_at: string;
}

export interface HeroBanner {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text?: string;
  secondary_cta_link?: string;
  image_url: string;
  accent_color?: string; // e.g. "#F26A00", "#3B82F6", "#10B981"
  display_order: number;
  is_active: boolean;
  created_at: string;
}
