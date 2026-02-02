import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Header from "@/components/Header";
import MiniCart from "@/components/MiniCart";
import WishlistDrawer from "@/components/WishlistDrawer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Country Natural Foods – Certified Organic Products",
  description: "Shop premium certified organic products. Fresh produce, wholesome grains, healthy snacks. Authentic, natural, and sustainably sourced.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased font-sans bg-warm-neutral`}
      >
        <CartProvider>
          <WishlistProvider>
            <Header />
            <main className="pt-16">{children}</main>
            <MiniCart />
            <WishlistDrawer />
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
