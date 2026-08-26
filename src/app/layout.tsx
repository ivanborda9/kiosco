import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";
import { generateBrandShades, isValidHexColor, BRAND_SHADE_KEYS } from "@/lib/colors";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.storeName,
    description: "Catálogo de ropa por mayor y menor con red de revendedoras.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const primaryColor = isValidHexColor(settings.primaryColor) ? settings.primaryColor : "#db2777";
  const shades = generateBrandShades(primaryColor);

  return (
    <html lang="es">
      <head>
        <style>{`:root{${BRAND_SHADE_KEYS.map((key) => `--brand-${key}:${shades[key]};`).join("")}}`}</style>
      </head>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
