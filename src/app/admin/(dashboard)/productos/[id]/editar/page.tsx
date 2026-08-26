import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "../../actions";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
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
          category: product.category,
          stock: product.stock,
          imageUrl: product.imageUrl,
        }}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
