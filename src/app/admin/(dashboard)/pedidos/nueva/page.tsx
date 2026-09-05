import { prisma } from "@/lib/prisma";
import { ManualSaleForm } from "@/components/admin/ManualSaleForm";
import { registerManualSale } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewManualSalePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { variants: { orderBy: { position: "asc" } } },
  });

  const productsForForm = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
    category: p.category,
    variants: p.variants.map((v) => ({ id: v.id, color: v.color, size: v.size, stock: v.stock })),
  }));

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Registrar venta</h1>
      <p className="mb-6 text-sm text-gray-500">
        Para ventas hechas en persona (mostrador), así se descuenta el stock correctamente.
      </p>

      {searchParams.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{searchParams.error}</p>
      )}

      <ManualSaleForm action={registerManualSale} products={productsForForm} />
    </div>
  );
}
