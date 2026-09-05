"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";

type VariantOption = { id: string; color: string | null; size: string | null; stock: number };
type ProductOption = { id: string; name: string; price: number; stock: number; variants: VariantOption[] };
type SaleLine = { productId: string; variantId: string; quantity: number };

function variantLabel(v: VariantOption): string {
  const parts = [v.color, v.size ? `Talle ${v.size}` : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Sin variante";
}

export function ManualSaleForm({
  action,
  products,
}: {
  action: (formData: FormData) => void;
  products: ProductOption[];
}) {
  const [lines, setLines] = useState<SaleLine[]>([{ productId: "", variantId: "", quantity: 1 }]);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  function updateLine(index: number, patch: Partial<SaleLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: "", variantId: "", quantity: 1 }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const validLines = lines.filter((l) => l.productId);
  const total = validLines.reduce((sum, l) => sum + (productMap.get(l.productId)?.price ?? 0) * l.quantity, 0);

  if (products.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
        Todavía no hay productos activos para vender. Cargá alguno primero en Productos.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Cliente (opcional)</label>
        <input
          name="customerName"
          placeholder="Venta mostrador"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Productos vendidos</label>
        <div className="flex flex-col gap-3">
          {lines.map((line, index) => {
            const product = productMap.get(line.productId);
            return (
              <div
                key={index}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-3"
              >
                <select
                  value={line.productId}
                  onChange={(e) => updateLine(index, { productId: e.target.value, variantId: "" })}
                  className="min-w-[180px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Elegí un producto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {formatPrice(p.price)}
                    </option>
                  ))}
                </select>

                {product && product.variants.length > 0 ? (
                  <select
                    value={line.variantId}
                    onChange={(e) => updateLine(index, { variantId: e.target.value })}
                    className="min-w-[160px] rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Elegí color/talle</option>
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {variantLabel(v)} · stock {v.stock}
                      </option>
                    ))}
                  </select>
                ) : product ? (
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                ) : null}

                <input
                  type="number"
                  min={1}
                  step="1"
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(index, { quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)) })
                  }
                  className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />

                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Quitar
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addLine}
          className="mt-2 text-sm font-medium text-brand-600 hover:underline"
        >
          + Agregar producto
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <input
        type="hidden"
        name="itemsJson"
        value={JSON.stringify(
          validLines.map((l) => ({ productId: l.productId, variantId: l.variantId || null, quantity: l.quantity }))
        )}
      />

      <button
        type="submit"
        disabled={validLines.length === 0}
        className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        Registrar venta
      </button>
    </form>
  );
}
