"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { formatVariantLabel } from "@/lib/format";

type Variant = { id: string; color: string | null; size: string | null; stock: number };

export function ProductDetailActions({
  product,
  variants,
}: {
  product: { id: string; name: string; price: number; imageUrl: string | null; stock: number };
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState(variants.find((v) => v.stock > 0)?.id ?? "");

  const hasVariants = variants.length > 0;
  const selectedVariant = hasVariants ? variants.find((v) => v.id === variantId) ?? null : null;
  const availableStock = hasVariants ? selectedVariant?.stock ?? 0 : product.stock;
  const outOfStock = hasVariants ? !selectedVariant || availableStock <= 0 : product.stock <= 0;

  function buildCartItem() {
    return {
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      variantLabel: selectedVariant
        ? formatVariantLabel(selectedVariant.color, selectedVariant.size)
        : null,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: availableStock,
    };
  }

  return (
    <div className="flex flex-col gap-3">
      {hasVariants && (
        <div>
          <label htmlFor="variant" className="mb-1 block text-sm font-medium text-gray-700">
            Color / Talle
          </label>
          <select
            id="variant"
            value={variantId}
            onChange={(e) => {
              setVariantId(e.target.value);
              setQty(1);
            }}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>
              Elegí una opción
            </option>
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {formatVariantLabel(v.color, v.size)} {v.stock <= 0 ? "(sin stock)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm font-medium text-gray-700">
          Cantidad
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={Math.max(1, availableStock)}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(availableStock, Number(e.target.value) || 1)))}
          disabled={outOfStock}
          className="w-20 rounded-lg border border-gray-300 px-3 py-2"
        />
        <span className="text-sm text-gray-500">{availableStock} disponibles</span>
      </div>
      <div className="flex gap-3">
        <button
          disabled={outOfStock}
          onClick={() => addItem(buildCartItem(), qty)}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {outOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>
        <button
          disabled={outOfStock}
          onClick={() => {
            addItem(buildCartItem(), qty);
            router.push("/carrito");
          }}
          className="rounded-lg border border-brand-600 px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
