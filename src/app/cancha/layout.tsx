import Link from "next/link";
import { getCanchaConfig } from "@/lib/cancha";

export default async function CanchaLayout({ children }: { children: React.ReactNode }) {
  const config = await getCanchaConfig();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/cancha" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-brand-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.logoUrl || "/club-logo.svg"}
              alt={config.courtName}
              className="h-11 w-11 object-contain"
            />
            {config.courtName}
          </Link>
          <nav className="flex items-center gap-5 text-base font-bold">
            <Link href="/merch" className="text-brand-600 hover:underline">
              Merch PORTE
            </Link>
            <Link href="/carrito" className="text-gray-500 hover:text-brand-600">
              Carrito
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      <footer className="mt-16 border-t border-brand-100 bg-white py-6 text-center text-sm text-gray-500">
        <p>Reservá tu turno y pagá la seña online para confirmarlo al instante.</p>
        <p className="mt-2">
          <Link href="/admin" className="hover:text-brand-600 hover:underline">
            Acceso administrador
          </Link>
        </p>
      </footer>
    </div>
  );
}
