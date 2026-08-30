import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function MerchPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const categoria = searchParams.categoria;

  const [products, categoriesRaw] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, ...(categoria ? { category: categoria } : {}) },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const categories = categoriesRaw.map((c) => c.category).sort();

  return (
    <div>
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        Merch PORTE
      </h1>
      <p className="mb-6 text-base text-gray-600">
        Camisetas, bufandas y todo lo necesario para alentar al club.
      </p>

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
        <p className="py-16 text-center text-gray-500">No hay productos cargados todavía.</p>
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
