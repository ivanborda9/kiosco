import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { isBlobConfigured } from "@/lib/blob";
import { updateProduct } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar producto</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        initial={{
          name: product.name,
          description: product.description,
          price: product.price,
          costPrice: product.costPrice,
          category: product.category,
          stock: product.stock,
          imageUrl: product.imageUrl,
        }}
        submitLabel="Guardar cambios"
        blobEnabled={isBlobConfigured()}
        existingImages={product.images.map((img) => ({ id: img.id, url: img.url }))}
        categories={categories.map((c) => c.name)}
        initialVariants={product.variants.map((v) => ({
          id: v.id,
          color: v.color ?? "",
          size: v.size ?? "",
          stock: v.stock,
        }))}
      />
    </div>
  );
}
