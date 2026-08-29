import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ProductDetailActions } from "@/components/ProductDetailActions";
import { ProductGallery } from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!product || !product.active) {
    notFound();
  }

  const galleryImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...product.images.map((img) => img.url),
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery images={galleryImages} alt={product.name} category={product.category} />
      <div>
        <span className="text-xs uppercase tracking-wide text-brand-500">{product.category}</span>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>
        <p className="mt-3 text-3xl font-bold text-brand-700">{formatPrice(product.price)}</p>
        <p className="mt-4 text-gray-600">{product.description}</p>
        <div className="mt-6">
          <ProductDetailActions
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              stock: product.stock,
            }}
          />
        </div>
        <p className="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
          ¿Sos revendedora? Ingresá tu código de descuento al finalizar la compra.
        </p>
      </div>
    </div>
  );
}
