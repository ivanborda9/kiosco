"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { formatVariantLabel } from "@/lib/format";

type Variant = { id: string; color: string | null; size: string | null; stock: number };

function uniqueInOrder(values: (string | null)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const v of values) {
    if (v && !seen.has(v)) {
      seen.add(v);
      result.push(v);
    }
  }
  return result;
}

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

  const colors = useMemo(() => uniqueInOrder(variants.map((v) => v.color)), [variants]);
  const sizes = useMemo(() => uniqueInOrder(variants.map((v) => v.size)), [variants]);
  const hasColors = colors.length > 0;
  const hasSizes = sizes.length > 0;
  const hasVariants = variants.length > 0;

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Talles disponibles para el color elegido (si el producto tiene colores).
  const sizesForColor = useMemo(() => {
    if (!hasSizes) return [];
    if (!hasColors) return sizes;
    return sizes.filter((size) => variants.some((v) => v.color === selectedColor && v.size === size));
  }, [hasSizes, hasColors, sizes, variants, selectedColor]);

  const selectedVariant = hasVariants
    ? variants.find(
        (v) => (v.color ?? "") === selectedColor && (v.size ?? "") === selectedSize
      ) ?? null
    : null;

  const readyToPick = hasVariants
    ? (!hasColors || selectedColor) && (!hasSizes || selectedSize)
    : true;

  const availableStock = hasVariants ? selectedVariant?.stock ?? 0 : product.stock;
  const outOfStock = hasVariants
    ? !readyToPick || !selectedVariant || availableStock <= 0
    : product.stock <= 0;

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
      {hasColors && (
        <div>
          <label htmlFor="color" className="mb-1 block text-sm font-medium text-gray-700">
            Color
          </label>
          <select
            id="color"
            value={selectedColor}
            onChange={(e) => {
              setSelectedColor(e.target.value);
              setSelectedSize("");
              setQty(1);
            }}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>
              Elegí un color
            </option>
            {colors.map((color) => {
              const stockForColor = variants
                .filter((v) => v.color === color)
                .reduce((sum, v) => sum + v.stock, 0);
              return (
                <option key={color} value={color} disabled={stockForColor <= 0}>
                  {color} {stockForColor <= 0 ? "(sin stock)" : ""}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {hasSizes && (
        <div>
          <label htmlFor="size" className="mb-1 block text-sm font-medium text-gray-700">
            Talle
          </label>
          <select
            id="size"
            value={selectedSize}
            disabled={hasColors && !selectedColor}
            onChange={(e) => {
              setSelectedSize(e.target.value);
              setQty(1);
            }}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="" disabled>
              {hasColors && !selectedColor ? "Elegí primero un color" : "Elegí un talle"}
            </option>
            {sizesForColor.map((size) => {
              const variant = variants.find(
                (v) => v.size === size && (!hasColors || v.color === selectedColor)
              );
              const stock = variant?.stock ?? 0;
              return (
                <option key={size} value={size} disabled={stock <= 0}>
                  {size} {stock <= 0 ? "(sin stock)" : ""}
                </option>
              );
            })}
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
