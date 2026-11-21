import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "AKI ENTERPRISE | Phones, Electronics & Accessories (Ghana)",
  description:
    "Aki Enterprise - Official electronics store in Ghana. Authentic brand new & Grade-A UK-used iPhones, Samsung smartphones, fast chargers, power banks, and computer accessories with warranty. Delivery across Accra & Ghana.",
  manifest: "/manifest.json",
  themeColor: "#F26A00",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aki Enterprise",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.png",
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
