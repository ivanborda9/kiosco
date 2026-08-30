import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function MerchPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const categoria = searchParams.categoria;

  const [products, categoriesRaw, settings] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, ...(categoria ? { category: categoria } : {}) },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
    }),
    getSiteSettings(),
  ]);

  const categories = categoriesRaw.map((c) => c.category).sort();

  return (
    <div>
      <section
        className="mb-8 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 bg-cover bg-center px-6 py-10 text-white"
        style={
          settings.bannerImageUrl
            ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${settings.bannerImageUrl})` }
            : undefined
        }
      >
        <h1 className="text-3xl font-bold sm:text-4xl">Merch {settings.storeName}</h1>
        <p className="mt-2 max-w-xl text-brand-50">
          Camisetas, bufandas y todo lo necesario para alentar al club.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/merch"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            !categoria
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-brand-200 text-brand-700 hover:bg-brand-50"
          }`}
        >
          Todas
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/merch?categoria=${encodeURIComponent(cat)}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              categoria === cat
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-brand-200 text-brand-700 hover:bg-brand-50"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No hay productos en esta categoría todavía.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                price: p.price,
                imageUrl: p.imageUrl,
                category: p.category,
                stock: p.stock,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
