"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Navbar({ storeName }: { storeName: string }) {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-brand-700">
          {storeName}
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-brand-600">
            Catálogo
          </Link>
          <Link href="/revendedora" className="hover:text-brand-600">
            Quiero ser revendedora
          </Link>
          <Link href="/cancha" className="hover:text-brand-600">
            Reservar cancha
          </Link>
          <Link href="/carrito" className="relative flex items-center gap-1 hover:text-brand-600">
            <span>Carrito</span>
            {totalCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
                {totalCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
