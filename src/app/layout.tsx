import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { StoreLayoutWrapper } from "@/components/store-layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#F26A00",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://akiaduniventures.com"),
  title: {
    default: "AKI ADUNI VENTURES | Phones, Electronics & Accessories (Ghana)",
    template: "%s | AKI ADUNI VENTURES",
  },
  description:
    "AKI ADUNI VENTURES - Certified electronics store in Ghana. Brand new & Grade-A UK-used iPhones, Samsung smartphones, fast chargers, power banks, and computer accessories with warranty. Physical shop at Miaso, Kwahu East, Ghana.",
  keywords: [
    "AKI ADUNI VENTURES",
    "phones in Ghana",
    "buy iPhone Ghana",
    "Samsung Galaxy Ghana",
    "UK used phones Ghana",
    "Kwahu East electronics",
    "Miaso phone shop",
    "Anker chargers Ghana",
    "Oraimo power banks Ghana",
    "computer accessories Ghana",
  ],
  authors: [{ name: "AKI ADUNI VENTURES" }],
  creator: "AKI ADUNI VENTURES",
  publisher: "AKI ADUNI VENTURES",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AKI ADUNI VENTURES",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [
      { url: "/icons/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "AKI ADUNI VENTURES | Phones, Electronics & Accessories (Ghana)",
    description:
      "Certified Ghanaian electronics store. Brand new & Grade-A UK-used iPhones, Samsung smartphones, fast chargers, power banks, and computer accessories with full store warranty.",
    url: "https://akiaduniventures.com",
    siteName: "AKI ADUNI VENTURES",
    locale: "en_GH",
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "AKI ADUNI VENTURES - Certified Electronics & Phones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AKI ADUNI VENTURES | Phones, Electronics & Accessories (Ghana)",
    description:
      "Certified Ghanaian electronics store. Phones, chargers, power banks & smart accessories with store warranty.",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    other: {
      "facebook-domain-verification": "eu3wmu09awyjoqtv3hzpxfnws85r7c",
    },
  },
};

const storeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ElectronicsStore", "LocalBusiness"],
      "@id": "https://akiaduniventures.com/#store",
      "name": "AKI ADUNI VENTURES",
      "legalName": "AKI ADUNI VENTURES",
      "url": "https://akiaduniventures.com",
      "logo": "https://akiaduniventures.com/icons/icon-512.png",
      "image": "https://akiaduniventures.com/icons/icon-512.png",
      "description":
        "Certified commercial electronics retailer in Ghana. Phones, laptops, chargers, power banks, and accessories with written shop warranty.",
      "telephone": "+233551243372",
      "email": "support@akiaduniventures.com",
      "priceRange": "GH₵₵",
      "paymentAccepted": "Mobile Money, MTN MoMo, Telecel Cash, Cash, Bank Transfer",
      "currenciesAccepted": "GHS",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Miaso Commercial Center",
        "addressLocality": "Kwahu East",
        "addressRegion": "Eastern Region",
        "addressCountry": "GH"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "6.6853",
        "longitude": "-0.7635"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "08:00",
          "closes": "19:00"
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://akiaduniventures.com/#website",
      "url": "https://akiaduniventures.com",
      "name": "AKI ADUNI VENTURES",
      "publisher": {
        "@id": "https://akiaduniventures.com/#store"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://akiaduniventures.com/products?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta name="facebook-domain-verification" content="eu3wmu09awyjoqtv3hzpxfnws85r7c" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <CartProvider>
          <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
