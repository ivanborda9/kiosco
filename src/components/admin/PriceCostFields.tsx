"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { computeProfit } from "@/lib/margin";

export function PriceCostFields({
  initialPrice,
  initialCostPrice,
}: {
  initialPrice?: number;
  initialCostPrice?: number | null;
}) {
  const [price, setPrice] = useState(initialPrice ?? 0);
  const [costPrice, setCostPrice] = useState(initialCostPrice ?? 0);

  const profit = computeProfit(price, costPrice);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Precio de venta (ARS)</label>
          <input
            name="price"
            type="number"
            min={0}
            step="1"
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Precio de costo (opcional)
          </label>
          <input
            name="costPrice"
            type="number"
            min={0}
            step="1"
            value={costPrice || ""}
            onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        El costo es privado: solo se usa para calcular tu ganancia, nunca se muestra en la tienda.
      </p>
      {profit && (
        <p className="mt-2 text-sm font-medium text-brand-700">
          Ganancia: {formatPrice(profit.profit)} ({profit.marginPercent.toFixed(0)}% sobre el costo)
        </p>
      )}
    </div>
  );
}
