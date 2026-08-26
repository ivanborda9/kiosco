import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME || "Mi Catálogo",
  description: "Catálogo de ropa por mayor y menor con red de revendedoras.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
