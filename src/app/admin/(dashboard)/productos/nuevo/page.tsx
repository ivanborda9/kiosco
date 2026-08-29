import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { isBlobConfigured } from "@/lib/blob";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nuevo producto</h1>
      <ProductForm
        action={createProduct}
        submitLabel="Crear producto"
        blobEnabled={isBlobConfigured()}
        categories={categories.map((c) => c.name)}
      />
    </div>
  );
}
