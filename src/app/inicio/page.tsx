import Link from "next/link";
import { getCanchaConfig } from "@/lib/cancha";

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const config = await getCanchaConfig();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-4 py-12 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={config.logoUrl || "/club-logo.svg"}
        alt={config.courtName}
        className="h-32 w-32 object-contain"
      />
      <h1 className="text-4xl font-extrabold uppercase tracking-tight text-red-600 sm:text-5xl">
        Porteño de Cachari
      </h1>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/cancha"
          className="rounded-xl bg-brand-600 px-6 py-4 text-lg font-bold text-white shadow-sm hover:bg-brand-700"
        >
          TURNOS FÚTBOL 7
        </Link>
        <Link
          href="/merch"
          className="rounded-xl border-2 border-brand-600 px-6 py-4 text-lg font-bold text-brand-700 hover:bg-brand-50"
        >
          TIENDA PORTE
        </Link>
        <Link
          href="/admin"
          className="rounded-xl border-2 border-gray-300 px-6 py-4 text-lg font-bold text-gray-700 hover:bg-gray-50"
        >
          ADMIN
        </Link>
      </div>
    </div>
  );
}
