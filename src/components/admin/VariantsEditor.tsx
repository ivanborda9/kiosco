"use client";

import { useState } from "react";

export type VariantRow = { id?: string; color: string; size: string; stock: number };

export function VariantsEditor({ initial }: { initial: VariantRow[] }) {
  const [rows, setRows] = useState<VariantRow[]>(initial);

  function updateRow(index: number, patch: Partial<VariantRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { color: "", size: "", stock: 0 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Variantes de color / talle (opcional)
      </label>
      <p className="mb-2 text-xs text-gray-400">
        Si este producto viene en distintos colores o talles, agregalos acá con su stock propio.
        Dejá vacío si el producto no tiene variantes: en ese caso se usa el stock general de
        arriba. Podés completar solo color, solo talle, o ambos en cada fila.
      </p>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              placeholder="Color (ej: Negro)"
              value={row.color}
              onChange={(e) => updateRow(index, { color: e.target.value })}
              className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Talle (ej: M)"
              value={row.size}
              onChange={(e) => updateRow(index, { size: e.target.value })}
              className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={0}
              step="1"
              placeholder="Stock"
              value={row.stock}
              onChange={(e) => updateRow(index, { stock: Math.max(0, Number(e.target.value) || 0) })}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="text-sm text-red-500 hover:underline"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-sm font-medium text-brand-600 hover:underline"
      >
        + Agregar variante
      </button>
      <input type="hidden" name="variantsJson" value={JSON.stringify(rows)} />
    </div>
  );
}
