import { VariantsEditor, type VariantRow } from "./VariantsEditor";
import { PriceCostFields } from "./PriceCostFields";

type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  costPrice: number | null;
  category: string;
  stock: number;
  imageUrl: string | null;
};

type GalleryImage = { id: string; url: string };

export function ProductForm({
  action,
  initial,
  submitLabel,
  blobEnabled,
  existingImages,
  categories,
  initialVariants = [],
}: {
  action: (formData: FormData) => void;
  initial?: ProductFormValues;
  submitLabel: string;
  blobEnabled: boolean;
  existingImages?: GalleryImage[];
  categories: string[];
  initialVariants?: VariantRow[];
}) {
  const categoryOptions =
    initial?.category && !categories.includes(initial.category)
      ? [...categories, initial.category]
      : categories;
  return (
    <form action={action} encType="multipart/form-data" className="flex max-w-xl flex-col gap-4">
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
      <PriceCostFields initialPrice={initial?.price} initialCostPrice={initial?.costPrice} />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Stock {initialVariants.length > 0 ? "(sin variantes)" : ""}
        </label>
        <input
          name="stock"
          type="number"
          min={0}
          step="1"
          required
          defaultValue={initial?.stock}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-400">
          Se ignora si cargás variantes de color/talle abajo.
        </p>
      </div>

      <VariantsEditor initial={initialVariants} />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
        {categoryOptions.length > 0 ? (
          <select
            name="category"
            required
            defaultValue={initial?.category ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>
              Elegí una categoría
            </option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        ) : (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            Todavía no cargaste categorías. Creá una primero en{" "}
            <a href="/admin/categorias" className="text-brand-600 hover:underline">
              Categorías
            </a>
            .
          </p>
        )}
      </div>

      {initial?.imageUrl && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Foto principal actual</label>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={initial.imageUrl}
            alt=""
            className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
          />
        </div>
      )}

      {existingImages && existingImages.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Fotos cargadas</label>
          <div className="grid grid-cols-4 gap-3">
            {existingImages.map((img) => (
              <label key={img.id} className="relative block cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="aspect-square w-full rounded-lg border border-gray-200 object-cover"
                />
                <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <input type="checkbox" name="deleteImageIds" value={img.id} />
                  Eliminar
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {blobEnabled ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Subir fotos</label>
          <input
            name="photoFiles"
            type="file"
            accept="image/*"
            multiple
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-400">
            Podés elegir una o varias. La primera reemplaza la foto principal (la anterior pasa a
            la galería); el resto se agrega a la galería directamente.
          </p>
        </div>
      ) : (
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
          Para poder cargar fotos de producto, conectá Vercel Blob Storage en tu proyecto (ver
          README).
        </p>
      )}

      <button
        type="submit"
        className="mt-2 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
