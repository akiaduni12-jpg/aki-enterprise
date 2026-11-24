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
  title: "AKI ADUNI VENTURES | Genuine Electronics, Phones & Accessories (Ghana)",
  description:
    "AKI ADUNI VENTURES - Certified electronics store in Ghana. Authentic brand new & Grade-A UK-used iPhones, Samsung smartphones, fast chargers, power banks, and computer accessories with warranty. Physical shop at Miaso, Kwahu East, Ghana.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AKI ADUNI VENTURES",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <CartProvider>
          <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
