import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ProductDetailActions } from "@/components/ProductDetailActions";
import { ProductImage } from "@/components/ProductImage";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });

  if (!product || !product.active) {
    notFound();
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-brand-50">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          category={product.category}
          fill
          className="object-cover"
          priority
        />
      </div>
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
        {process.env.SITE_MODE !== "cancha" && (
          <p className="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
            ¿Sos revendedora? Ingresá tu código de descuento al finalizar la compra.
          </p>
        )}
      </div>
    </div>
  );
}
