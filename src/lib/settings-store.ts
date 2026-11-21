export interface StoreSettings {
  storeName: string;
  tagline: string;
  businessName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: string;
  currency: string;
  announcementText: string;
  announcementEnabled: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
    x: string;
    whatsapp: string;
  };
  policies: {
    aboutUs: string;
    returnRefundPolicy: string;
    privacyPolicy: string;
    termsConditions: string;
    deliveryPolicy: string;
    warrantyPolicy: string;
  };
  googleMerchant: {
    returnWindowDays: number;
    returnShippingPayer: "buyer" | "seller" | "seller_on_defect";
    restockingFeePercentage: number;
    returnAddress: string;
    acceptedPaymentMethods: string[];
    handlingTimeDays: number;
    transitTimeDays: number;
  };
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Aki Enterprise",
  tagline: "Original Electronics & Smart Devices • Ghana",
  businessName: "Aki Enterprise",
  ownerName: "Aki Enterprise Management",
  phone: "0551243372",
  whatsapp: "0551243372",
  email: "support@akienterprise.com",
  address: "Miaso, Kwahu East, Eastern Region, Ghana",
  city: "Miaso, Kwahu East",
  region: "Eastern Region",
  country: "Ghana",
  currency: "GH₵",
  announcementText: "Free Delivery on Orders Above GH₵ 500 across Ghana | Genuine Warranty Guaranteed",
  announcementEnabled: true,
  deliveryFee: 30,
  freeDeliveryThreshold: 500,
  socials: {
    facebook: "https://facebook.com/akienterprise",
    instagram: "https://instagram.com/akienterprise",
    tiktok: "https://tiktok.com/@akienterprise",
    x: "https://x.com/akienterprise",
    whatsapp: "https://wa.me/233551243372",
  },
  policies: {
    aboutUs: `Welcome to Aki Enterprise — Ghana's trusted destination for 100% original smartphones, verified UK-used devices, certified GaN fast chargers, high-capacity power banks, and computer electronics.

Located in Miaso, Kwahu East in the Eastern Region of Ghana, Aki Enterprise was established with a singular mission: to eliminate fake and substandard gadgets from the market and give Ghanaian consumers guaranteed authenticity with full technical warranty.

Every smartphone in our inventory undergoes a rigorous 25-point quality inspection, including battery health verification, IMEI validation, camera sensor testing, and network unlocked checks. Whether you choose a brand-new device in factory-sealed packaging or a certified UK-Used Grade A phone, you receive clear documentation and shop warranty backed by our physical retail presence.

We offer secure online shopping with instant Mobile Money (MTN MoMo, Telecel Cash, ATMoney) and Visa card payments powered by Paystack, with fast express delivery across Eastern Region, Accra, Kumasi, and nationwide Ghana.`,

    returnRefundPolicy: `At Aki Enterprise, we stand behind the authenticity and quality of every product we sell. Our Return & Refund Policy is designed to comply with Google Merchant Center standards and Ghana Consumer Protection guidelines.

1. RETURN TIMEFRAME
Customers may initiate a return within 14 days of receiving their delivery or picking up an order at our Miaso shop.

2. ELIGIBILITY & ITEM CONDITION
- Defective or Damaged Upon Delivery: If an item arrives defective, malfunctioning, or not matching the ordered specification, please notify us within 48 hours. Aki Enterprise covers 100% of the return shipping costs, and you may choose between an immediate replacement or a full refund.
- Customer Remorse / Change of Mind: Unopened items with intact factory seals, original packaging, and all included accessories may be returned within 14 days. For change of mind returns, the customer covers the courier return shipping. We charge 0% restocking fee.
- Exclusions: Devices with user-inflicted physical cracks, water damage, or altered software/firmware cannot be returned.

3. RETURN ADDRESS
All returns must be securely packaged and delivered to:
Aki Enterprise Store
Miaso, Kwahu East, Eastern Region, Ghana
Contact Person: Store Manager (+233 55 124 3372)

4. REFUND PROCESS & TIMELINE
Once the returned product is physically inspected and verified at our shop (usually within 24-48 hours of receipt):
- Refunds are issued via the original payment method: Mobile Money (MTN MoMo, Telecel Cash, ATMoney) or Bank Transfer.
- Processing takes 1 to 3 business days. There are no hidden deductions.`,

    privacyPolicy: `Aki Enterprise ("we", "us", or "our") respects your privacy and is committed to protecting your personal data in accordance with the Ghana Data Protection Act, 2012 (Act 843).

1. INFORMATION WE COLLECT
When you browse our store, create an account, place an order, or contact customer support, we collect:
- Full Name, Contact Phone Number, and Delivery Address.
- Email address (for order receipts, shipment tracking, and account management).
- Order history and product preferences.

2. PAYMENT INFORMATION SECURITY
We never store, see, or process your Mobile Money PINs or credit/debit card numbers. All payments are encrypted and processed through our verified, PCI-DSS certified payment partner Paystack.

3. USE OF INFORMATION
Your information is strictly used to:
- Process and fulfill orders, including courier dispatch to your location.
- Send SMS and WhatsApp delivery tracking notifications.
- Provide warranty service, authenticity checks, and customer support.

4. SHARING & THIRD PARTIES
We do NOT sell, rent, or trade your personal data to any third party or marketing agency. We only share necessary delivery details with trusted courier riders and parcel services for order transit.`,

    termsConditions: `These Terms and Conditions govern your use of the Aki Enterprise website (akienterprise.com) and purchases made online or in our physical retail store in Miaso, Kwahu East, Eastern Region, Ghana.

1. PRODUCT DESCRIPTIONS & ACCURACY
We make every effort to display accurate specifications, prices, battery health metrics, and conditions (Brand New vs. UK-Used Grade A). In the rare event of a pricing or clerical error, we reserve the right to cancel unfulfilled orders with a prompt 100% refund.

2. CURRENCY & PRICING
All prices listed on our platform are denominated in Ghana Cedis (GH₵) and include applicable taxes unless specifically stated otherwise.

3. ORDERS & CONTRACT FORMATION
An order is confirmed once payment has been verified through our Mobile Money / Card payment gateway, or upon mutual confirmation for eligible store pickup.

4. LIMITATION OF LIABILITY
Aki Enterprise is not liable for indirect, incidental, or consequential damages arising from the misuse of electronic gadgets, third-party software, or damage from power surges. We strongly recommend using original surge-protected adapters.

5. GOVERNING LAW
These terms are governed by and construed in accordance with the laws of the Republic of Ghana.`,

    deliveryPolicy: `Aki Enterprise provides reliable, fast delivery across Ghana to ensure your gadgets reach you safely.

1. DISPATCH & HANDLING TIME
- All orders placed before 3:00 PM are processed and dispatched the same day (Monday - Saturday).
- Orders placed after 3:00 PM or on Sunday are dispatched the next business day.

2. DELIVERY FEES & FREE SHIPPING
- Standard Delivery: GH₵ 30 nationwide.
- FREE Delivery: All orders of GH₵ 500 or more qualify for 100% Free Express Delivery.
- In-Store Pickup: Free pickup is available at our Miaso, Kwahu East retail shop.

3. ESTIMATED TRANSIT TIMES
- Kwahu & Eastern Region: Same day to 24 hours.
- Greater Accra & Kumasi: 24 to 48 hours via express parcel service / courier.
- Other Regions in Ghana: 2 to 3 business days.

4. PARCEL INSPECTION UPON DELIVERY
Customers are encouraged to inspect parcel seals upon delivery. Our couriers provide full tracking codes so you can follow your order step by step.`,

    warrantyPolicy: `Every electronic product sold by Aki Enterprise comes with an official Shop Warranty.

1. WARRANTY COVERAGE PERIODS
- Brand New Devices & Chargers: 12 Months limited manufacturer and shop warranty.
- Certified UK-Used Grade A Smartphones: 6 Months shop warranty covering motherboard, software, network, and battery health stability.
- Accessories (Cables, Adapters, Earbuds): 3 to 6 Months replacement guarantee.

2. BATTERY HEALTH GUARANTEE
For UK-Used iPhones and smartphones, we guarantee a verified minimum 85% battery health capacity at the time of purchase, clearly labeled on each product variant.

3. WHAT IS NOT COVERED
- Physical drops, broken glass, cracked LCDs.
- Liquid ingress, water damage, moisture exposure.
- Unauthorized opening, repairs, or third-party modifications.
- High-voltage electrical surges (please use certified surge protectors).

4. HOW TO CLAIM WARRANTY
Simply bring the device to our Miaso shop or contact us on WhatsApp at 0551243372 with your Order ID (#AKI-...).`,
  },
  googleMerchant: {
    returnWindowDays: 14,
    returnShippingPayer: "seller_on_defect",
    restockingFeePercentage: 0,
    returnAddress: "Miaso, Kwahu East, Eastern Region, Ghana",
    acceptedPaymentMethods: ["MTN Mobile Money", "Telecel Cash", "ATMoney", "Visa", "Mastercard"],
    handlingTimeDays: 1,
    transitTimeDays: 2,
  },
};

const SETTINGS_STORAGE_KEY = "techhub_store_settings";

export function getStoreSettings(): StoreSettings {
  if (typeof window === "undefined") {
    return DEFAULT_STORE_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_STORE_SETTINGS));
      return DEFAULT_STORE_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STORE_SETTINGS,
      ...parsed,
      socials: { ...DEFAULT_STORE_SETTINGS.socials, ...(parsed.socials || {}) },
      policies: { ...DEFAULT_STORE_SETTINGS.policies, ...(parsed.policies || {}) },
      googleMerchant: { ...DEFAULT_STORE_SETTINGS.googleMerchant, ...(parsed.googleMerchant || {}) },
    };
  } catch (error) {
    console.error("Error reading store settings:", error);
    return DEFAULT_STORE_SETTINGS;
  }
}

export function saveStoreSettings(settings: StoreSettings): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("settings_updated"));

    // Sync to backend Supabase API in background
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).catch((e) => console.warn("Settings cloud sync notice:", e));
  } catch (error) {
    console.error("Error saving store settings:", error);
  }
}

export async function syncStoreSettingsFromCloud(): Promise<StoreSettings> {
  if (typeof window === "undefined") return DEFAULT_STORE_SETTINGS;

  try {
    const res = await fetch("/api/settings");
    const data = await res.json();
    if (data.success && data.settings) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data.settings));
      window.dispatchEvent(new Event("settings_updated"));
      return data.settings;
    }
  } catch (err) {
    console.warn("Could not sync settings from cloud:", err);
  }
  return getStoreSettings();
}

export function updateStoreSettings(updates: Partial<StoreSettings>): StoreSettings {
  const current = getStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...updates,
    socials: { ...current.socials, ...(updates.socials || {}) },
    policies: { ...current.policies, ...(updates.policies || {}) },
    googleMerchant: { ...current.googleMerchant, ...(updates.googleMerchant || {}) },
  };
  saveStoreSettings(updated);
  return updated;
}
