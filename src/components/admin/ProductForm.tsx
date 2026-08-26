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
        <label className="mb-1 block text-sm font-medium text-gray-700">URL de imagen</label>
        <input
          name="imageUrl"
          placeholder="https://..."
          defaultValue={initial?.imageUrl ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
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
