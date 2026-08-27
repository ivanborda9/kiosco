"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  stock: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-brand-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/producto/${product.id}`} className="relative block aspect-[4/5] w-full bg-brand-50">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          category={product.category}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {outOfStock && (
          <span className="absolute right-2 top-2 rounded bg-gray-900/80 px-2 py-1 text-xs font-semibold text-white">
            Sin stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs uppercase tracking-wide text-brand-500">{product.category}</span>
        <Link href={`/producto/${product.id}`} className="line-clamp-2 font-medium text-gray-900 hover:text-brand-700">
          {product.name}
        </Link>
        <span className="mt-1 text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="mt-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {outOfStock ? "Sin stock" : added ? "¡Agregado!" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
