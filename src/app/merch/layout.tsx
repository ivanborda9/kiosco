import Link from "next/link";
import { CartProvider } from "@/components/CartProvider";

export default function MerchLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/merch" className="text-xl font-bold text-brand-700">
              ⚽ Merch PORTE
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/cancha" className="text-gray-500 hover:text-brand-600">
                Reservar cancha
              </Link>
              <Link href="/carrito" className="text-gray-500 hover:text-brand-600">
                Carrito
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
        <footer className="mt-16 border-t border-brand-100 bg-white py-6 text-center text-sm text-gray-500">
          <p>Pagá con Mercado Pago en el checkout o coordiná el retiro por WhatsApp.</p>
        </footer>
      </div>
    </CartProvider>
  );
}
