export interface StoreSettings {
  storeName: string;
  tagline: string;
  businessName: string;
  legalBusinessName: string;
  registrationNumber: string;
  tin: string;
  digitalAddress: string;
  domain: string;
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
    cancellationPolicy: string;
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
  storeName: "AKI ADUNI VENTURES",
  tagline: "Trading as Aki Enterprise • Genuine Electronics & Smart Devices • Ghana",
  businessName: "AKI ADUNI VENTURES",
  legalBusinessName: "AKI ADUNI VENTURES",
  registrationNumber: "BN987061122",
  tin: "P0062373706",
  digitalAddress: "EF35051780",
  domain: "akiaduniventures.com",
  ownerName: "Aki Aduni",
  phone: "0551243372",
  whatsapp: "0551243372",
  email: "support@akiaduniventures.com",
  address: "Miaso Near The Market, Kwahu East, Eastern Region, Ghana (Digital Address: EF35051780)",
  city: "Miaso, Kwahu East",
  region: "Eastern Region",
  country: "Ghana",
  currency: "GH₵",
  announcementText: "Free Delivery on Orders Above GH₵ 500 across Ghana | Genuine Warranty Guaranteed by AKI ADUNI VENTURES",
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
    aboutUs: `Welcome to AKI ADUNI VENTURES (Trading as Aki Enterprise) — Ghana's certified commercial destination for 100% original smartphones, verified UK-used devices, certified GaN fast chargers, high-capacity power banks, and computer electronics.

1. LEGAL BUSINESS ENTITY & REGISTRATION DETAILS
AKI ADUNI VENTURES is an officially registered Sole Proprietorship in the Republic of Ghana under the Registration of Business Names Act, 1962 (Act 151):
• Business Name: AKI ADUNI VENTURES
• Official Registration Number: BN987061122
• Physical Place of Business: Miaso, Kwahu East District, Eastern Region, Ghana.
• Principal Business Activity: General Trading & Mobile Money Services (Electronics, Certified Smartphones, Gadgets & Peripherals).
• Official Store Domain: https://akiaduniventures.com

2. 100% IN-STOCK PHYSICAL INVENTORY (NOT DROPSHIPPING)
We maintain a strict in-house inventory policy: ALL devices, phones, chargers, and accessories listed on our website are physically held in stock at our Miaso retail and distribution premises. We do NOT operate an unverified dropshipping model. Every single device is in-hand, cataloged, and dispatched directly by our own staff.

3. QUALITY TESTING & CERTIFICATION
Every smartphone in our physical inventory undergoes a rigorous 25-point quality inspection before being listed for sale, including battery health verification, IMEI validation against international blacklists, camera sensor testing, Face ID/fingerprint checks, and factory unlocked network verification. Whether you select a factory-sealed brand-new device or a certified UK-Used Grade A device, you receive authentic hardware backed by our written store warranty.

4. NATIONWIDE FULFILLMENT & REGULATED PAYMENTS
We provide secure online payment processing powered by Paystack for instant, safe Mobile Money (MTN MoMo, Telecel Cash, ATMoney) and Visa / Mastercard checkouts, complemented by fast express courier delivery across the Eastern Region, Greater Accra, Kumasi, and nationwide Ghana.`,

    returnRefundPolicy: `At AKI ADUNI VENTURES (Trading as Aki Enterprise), we stand behind the authenticity and quality of every product we sell. Our Return & Refund Policy complies with Ghana Consumer Protection regulations and international merchant standards.

1. RETURN TIMEFRAME
Customers may initiate a return within 14 days of receiving their delivery or picking up an order at our Miaso retail store.

2. ELIGIBILITY & ITEM CONDITION
- Defective or Damaged Upon Delivery: If an item arrives defective, malfunctioning, or not matching the ordered specification, please notify us within 48 hours. AKI ADUNI VENTURES covers 100% of return shipping costs, and you may choose between an immediate replacement from our physical stock or a full refund.
- Customer Remorse / Change of Mind: Unopened items with intact factory seals, original packaging, and all included accessories may be returned within 14 days. For change of mind returns, the customer covers courier return shipping. We charge 0% restocking fee.
- Exclusions: Devices with user-inflicted physical cracks, water damage, or altered software/firmware cannot be returned.

3. RETURN ADDRESS
All returns must be securely packaged and delivered to:
AKI ADUNI VENTURES (Aki Enterprise)
Digital Address: EF35051780
Miaso Near The Market, Kwahu East, Eastern Region, Ghana
Contact Person: Store Manager (+233 55 124 3372)

4. REFUND PROCESS & TIMELINE
Once the returned product is physically inspected and verified at our shop (within 24 to 48 hours of receipt):
- Refunds are issued via the original payment method: Mobile Money (MTN MoMo, Telecel Cash, ATMoney) or Bank Card through Paystack.
- Processing takes 1 to 3 business days with zero deduction.`,

    privacyPolicy: `AKI ADUNI VENTURES ("we", "us", or "our") respects your privacy and is committed to protecting your personal data in accordance with the Ghana Data Protection Act, 2012 (Act 843).

1. LEGAL BUSINESS IDENTITY
This website is operated by AKI ADUNI VENTURES (Registration No: BN987061122), situated at Miaso, Kwahu East, Eastern Region, Ghana. Official Website: https://akiaduniventures.com.

2. INFORMATION WE COLLECT
When you browse our store, create an account, place an order, or contact customer support, we collect:
- Full Name, Contact Phone Number, and Delivery Address.
- Email address (for order receipts, shipment tracking, and account management).
- Order history and product preferences.

3. PAYMENT INFORMATION SECURITY
We never store, see, or process your Mobile Money PINs or credit/debit card numbers. All payments are encrypted and processed through our verified, PCI-DSS certified payment gateway partner Paystack.

4. USE OF INFORMATION
Your information is strictly used to:
- Process and fulfill orders, including courier dispatch to your location.
- Send SMS and WhatsApp delivery tracking notifications.
- Provide warranty service, authenticity checks, and customer support.

5. SHARING & THIRD PARTIES
We do NOT sell, rent, or trade your personal data to any third party or marketing agency. We only share necessary delivery details with trusted courier riders and parcel services for order transit.`,

    termsConditions: `These Terms and Conditions govern your use of the AKI ADUNI VENTURES website (https://akiaduniventures.com) and purchases made online or in our physical retail store in Miaso, Kwahu East, Eastern Region, Ghana.

1. LEGAL CONTRACTING ENTITY
The merchant of record and contracting entity for all transactions is AKI ADUNI VENTURES (Registration No: BN987061122), located in Miaso, Kwahu East, Eastern Region, Ghana.

2. PHYSICAL INVENTORY & PRODUCT AVAILABILITY
All items listed for purchase are held in physical stock at our retail shop in Miaso. While we strive to maintain real-time inventory synchronization, in the rare event of an inventory discrepancy, we reserve the right to cancel unfulfilled orders with an immediate 100% refund.

3. CURRENCY & PRICING
All prices listed on our platform are denominated in Ghana Cedis (GH₵) and include applicable taxes unless specifically stated otherwise.

4. ORDERS & PAYMENT VERIFICATION
An order is confirmed once payment has been verified through our Paystack Mobile Money / Card payment gateway, or upon mutual confirmation for eligible store pickup.

5. LIMITATION OF LIABILITY
AKI ADUNI VENTURES is not liable for indirect, incidental, or consequential damages arising from the misuse of electronic gadgets, third-party software, or damage from power surges. We strongly recommend using original surge-protected adapters.

6. GOVERNING LAW & JURISDICTION
These terms are governed by and construed in accordance with the laws of the Republic of Ghana.`,

    deliveryPolicy: `AKI ADUNI VENTURES provides reliable, fast delivery across Ghana to ensure your gadgets reach you safely.

1. DISPATCH & HANDLING TIME
- All orders placed before 3:00 PM are processed and dispatched the same day (Monday - Saturday) directly from our Miaso stock hub.
- Orders placed after 3:00 PM or on Sunday are dispatched the next business day.

2. ESTIMATED DELIVERY TIMELINES BY REGION
- Kwahu & Eastern Region: Same day to 24 hours.
- Greater Accra & Kumasi: 24 to 48 hours via express courier / parcel service.
- Other Regions in Ghana (Northern, Western, Central, Volta, etc.): 2 to 3 business days.
- In-Store Shop Pickup: Immediate pickup available at our Miaso, Kwahu East shop (Mon-Sat, 8:00 AM - 7:00 PM).

3. DELIVERY FEES & FREE SHIPPING
- Standard Delivery: GH₵ 30 nationwide.
- FREE Delivery: All orders of GH₵ 500 or more qualify for 100% Free Express Delivery.
- In-Store Pickup: 100% Free at our Miaso retail store.

4. TRANSIT SECURITY & PARCEL INSPECTION
Every shipment is packaged in tamper-evident security wrapping and tracked. Customers are encouraged to inspect parcel seals upon delivery before accepting the package.`,

    warrantyPolicy: `Every electronic product sold by AKI ADUNI VENTURES comes with an official Shop Warranty.

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

    cancellationPolicy: `At AKI ADUNI VENTURES (Trading as Aki Enterprise), we believe in transparent, customer-friendly service. This Cancellation Policy outlines the straightforward process for canceling orders.

1. CANCELLATION BEFORE DISPATCH
- If you change your mind after placing an order, you can cancel it at ANY TIME before the order is dispatched by our fulfillment team.
- There is a 0% cancellation fee for cancellations made before courier dispatch.
- To cancel an order, simply call or WhatsApp Customer Care at +233 55 124 3372 or email support@akiaduniventures.com with your Order Number.

2. CANCELLATION AFTER DISPATCH
- If your parcel has already been handed over to the courier, the cancellation will be processed under our standard 14-Day Return Policy upon delivery.
- You may refuse the parcel upon delivery or return it unopened to our Miaso address for a full refund of the product price.

3. REFUND TIMELINE FOR CANCELED ORDERS
- For prepaid orders via Paystack (MTN Mobile Money, Telecel Cash, ATMoney, or Visa/Mastercard), the full payment will be reversed to your originating account.
- Refund processing is initiated within 24 hours of cancellation and typically reflects in your Mobile Money wallet or bank account within 24 to 48 business hours.

4. SELLER CANCELLATION
In rare instances where an item fails our pre-dispatch 25-point quality test or is suddenly out of stock, AKI ADUNI VENTURES reserves the right to cancel the order and immediately refund 100% of your payment with an explanatory notification.`,
  },
  googleMerchant: {
    returnWindowDays: 14,
    returnShippingPayer: "seller_on_defect",
    restockingFeePercentage: 0,
    returnAddress: "Miaso Near The Market, Kwahu East, Eastern Region, Ghana (Digital Address: EF35051780)",
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
