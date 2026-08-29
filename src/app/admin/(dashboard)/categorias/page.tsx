import { prisma } from "@/lib/prisma";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createCategory, deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
  const counts = await prisma.product.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const countByName = new Map(counts.map((c) => [c.category, c._count._all]));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Categorías</h1>
      <p className="mb-6 text-sm text-gray-500">
        Estas categorías son las que vas a poder elegir al cargar un producto y las que se
        muestran como filtro en el catálogo.
      </p>

      {searchParams.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {searchParams.error}
        </p>
      )}

      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {categories.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">Todavía no cargaste ninguna categoría.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((cat) => {
              const count = countByName.get(cat.name) ?? 0;
              return (
                <li key={cat.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-500">
                      {count} producto{count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <form action={deleteCategory.bind(null, cat.id)}>
                    <ConfirmSubmitButton
                      confirmMessage={`¿Eliminar la categoría "${cat.name}"?`}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Eliminar
                    </ConfirmSubmitButton>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-bold text-gray-900">Agregar categoría</h2>
        <form action={createCategory} className="flex gap-3">
          <input
            name="name"
            required
            placeholder="Ej: Vestidos"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <button
            type="submit"
            className="flex-shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}
