"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";

export function ProductDetailActions({
  product,
}: {
  product: { id: string; name: string; price: number; imageUrl: string | null; stock: number };
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm font-medium text-gray-700">
          Cantidad
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={product.stock}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
          disabled={outOfStock}
          className="w-20 rounded-lg border border-gray-300 px-3 py-2"
        />
        <span className="text-sm text-gray-500">{product.stock} disponibles</span>
      </div>
      <div className="flex gap-3">
        <button
          disabled={outOfStock}
          onClick={() => {
            addItem(
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
              },
              qty
            );
          }}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {outOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>
        <button
          disabled={outOfStock}
          onClick={() => {
            addItem(
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
              },
              qty
            );
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
