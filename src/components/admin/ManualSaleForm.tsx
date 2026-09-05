"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";

type VariantOption = { id: string; color: string | null; size: string | null; stock: number };
type ProductOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string;
  variants: VariantOption[];
};
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
  const [search, setSearch] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<SaleLine[]>([]);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, search]);

  function addProduct(productId: string) {
    const product = productMap.get(productId);
    if (!product) return;
    const variantId = product.variants.length > 0 ? selectedVariant[productId] || "" : "";
    if (product.variants.length > 0 && !variantId) return;

    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === productId && l.variantId === variantId);
      if (idx >= 0) {
        return prev.map((l, i) => (i === idx ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { productId, variantId, quantity: 1 }];
    });
  }

  function updateLineQuantity(index: number, quantity: number) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, quantity: Math.max(1, quantity) } : l)));
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + (productMap.get(l.productId)?.price ?? 0) * l.quantity, 0);

  if (products.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
        Todavía no hay productos activos para vender. Cargá alguno primero en Productos.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Cliente (opcional)</label>
        <input
          name="customerName"
          placeholder="Venta mostrador"
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-gray-700">Catálogo</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="grid max-h-[480px] grid-cols-2 gap-3 overflow-y-auto rounded-lg border border-gray-200 p-3 sm:grid-cols-3 md:grid-cols-4">
          {filteredProducts.map((p) => {
            const outOfStock = p.variants.length === 0 && p.stock <= 0;
            return (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="relative aspect-square w-full bg-gray-50">
                  <ProductImage src={p.imageUrl} alt={p.name} category={p.category} fill sizes="200px" className="object-cover" />
                  {outOfStock && (
                    <span className="absolute right-1 top-1 rounded bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Sin stock
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-2">
                  <p className="line-clamp-2 text-xs font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{formatPrice(p.price)}</p>

                  {p.variants.length > 0 ? (
                    <select
                      value={selectedVariant[p.id] ?? ""}
                      onChange={(e) => setSelectedVariant((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="mt-1 rounded border border-gray-300 px-1 py-1 text-xs"
                    >
                      <option value="">Color/talle</option>
                      {p.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {variantLabel(v)} · {v.stock}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-gray-400">Stock: {p.stock}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => addProduct(p.id)}
                    disabled={outOfStock || (p.variants.length > 0 && !selectedVariant[p.id])}
                    className="mt-1 rounded-lg bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-gray-500">
              No se encontraron productos.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Productos en esta venta</label>
        {lines.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
            Todavía no agregaste ningún producto. Elegilo del catálogo de arriba.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {lines.map((line, index) => {
              const product = productMap.get(line.productId);
              const variant = product?.variants.find((v) => v.id === line.variantId) ?? null;
              return (
                <div
                  key={`${line.productId}-${line.variantId}-${index}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-2"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-50">
                    {product && (
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        category={product.category}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product?.name}</p>
                    {variant && <p className="text-xs text-gray-500">{variantLabel(variant)}</p>}
                  </div>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    value={line.quantity}
                    onChange={(e) => updateLineQuantity(index, Math.floor(Number(e.target.value) || 1))}
                    className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  />
                  <p className="w-20 text-right text-sm font-semibold text-gray-700">
                    {formatPrice((product?.price ?? 0) * line.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <input
        type="hidden"
        name="itemsJson"
        value={JSON.stringify(
          lines.map((l) => ({ productId: l.productId, variantId: l.variantId || null, quantity: l.quantity }))
        )}
      />

      <button
        type="submit"
        disabled={lines.length === 0}
        className="self-start rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        Registrar venta
      </button>
    </form>
  );
}
