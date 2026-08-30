import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  const showReseller = process.env.SITE_MODE !== "cancha";

  return (
    <CartProvider>
      <Navbar storeName={settings.storeName} showReseller={showReseller} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <Footer storeName={settings.storeName} showReseller={showReseller} />
    </CartProvider>
  );
}
