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
  title: "AKI ADUNI VENTURES | Phones, Electronics & Accessories (Ghana)",
  description:
    "AKI ADUNI VENTURES - Certified electronics store in Ghana. Brand new & Grade-A UK-used iPhones, Samsung smartphones, fast chargers, power banks, and computer accessories with warranty. Physical shop at Miaso, Kwahu East, Ghana.",
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
  verification: {
    other: {
      "facebook-domain-verification": "eu3wmu09awyjoqtv3hzpxfnws85r7c",
    },
  },
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
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <CartProvider>
          <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
