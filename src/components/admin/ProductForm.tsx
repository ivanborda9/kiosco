"use client";

import Image from "next/image";
import { useState } from "react";

type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string | null;
};

export function ProductForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  initial?: ProductFormValues;
  submitLabel: string;
}) {
  const [preview, setPreview] = useState<string | null>(initial?.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setRemoveImage(true);
  };

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={initial?.description}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Precio (ARS)</label>
          <input
            name="price"
            type="number"
            min={0}
            step="1"
            required
            defaultValue={initial?.price}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
          <input
            name="stock"
            type="number"
            min={0}
            step="1"
            required
            defaultValue={initial?.stock}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
        <input
          name="category"
          required
          placeholder="Ej: Remeras, Pantalones, Vestidos"
          defaultValue={initial?.category}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Foto del producto</label>
        {preview && (
          <div className="relative mb-2 h-40 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <Image src={preview} alt="Vista previa" fill className="object-cover" unoptimized />
          </div>
        )}
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
        />
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Quitar imagen
          </button>
        )}
        <input type="hidden" name="currentImageUrl" value={initial?.imageUrl ?? ""} />
        <input type="hidden" name="removeImage" value={removeImage ? "true" : "false"} />
      </div>
      <button
        type="submit"
        className="mt-2 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
