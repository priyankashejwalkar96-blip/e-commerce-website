import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { FlyingCartImage } from "@/components/storefront/FlyingCartImage";

export const metadata: Metadata = {
  title: {
    default: "LUXE | Elevated Contemporary Essentials",
    template: "%s | LUXE",
  },
  description: "Curated luxury e-commerce platform built with Next.js 14 & Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-primary-text min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {children}
              <FlyingCartImage />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
