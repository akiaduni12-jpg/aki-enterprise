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
    "AKI ADUNI VENTURES (Trading as Aki Enterprise) - Official registered electronics store in Ghana (Reg: 2118270). Authentic brand new & Grade-A UK-used iPhones, Samsung smartphones, fast chargers, power banks, and computer accessories with warranty. Physical shop at Miaso, Kwahu East, Ghana.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AKI ADUNI VENTURES",
  },
  icons: {
    icon: "/icons/logo-icon.webp",
    apple: "/icons/logo-icon.webp",
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
