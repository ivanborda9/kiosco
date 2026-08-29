import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/blob";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createBanner, deleteBanner, toggleBannerActive, moveBanner } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const banners = await prisma.banner.findMany({ orderBy: { position: "asc" } });
  const blobEnabled = isBlobConfigured();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Banners</h1>
      <p className="mb-6 text-sm text-gray-500">
        El banner principal del sitio rota entre las imágenes activas, en el orden de la lista. Si
        no cargás ninguna, se muestra el banner de texto de siempre.
      </p>

      {searchParams.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {searchParams.error}
        </p>
      )}

      {!blobEnabled && (
        <p className="mb-6 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
          Para poder subir banners desde archivos, conectá Vercel Blob Storage en tu proyecto (ver
          README).
        </p>
      )}

      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {banners.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">Todavía no cargaste ningún banner.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {banners.map((banner, index) => (
              <li key={banner.id} className="flex items-center gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt=""
                  className="h-16 w-28 flex-shrink-0 rounded-lg border border-gray-200 object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{banner.title || "(sin título)"}</p>
                  {banner.subtitle && <p className="text-sm text-gray-500">{banner.subtitle}</p>}
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      banner.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {banner.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <form action={moveBanner.bind(null, banner.id, "up")}>
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveBanner.bind(null, banner.id, "down")}>
                    <button
                      type="submit"
                      disabled={index === banners.length - 1}
                      className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <form action={toggleBannerActive.bind(null, banner.id, !banner.active)}>
                    <button type="submit" className="text-sm text-gray-600 hover:underline">
                      {banner.active ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                  <form action={deleteBanner.bind(null, banner.id)}>
                    <ConfirmSubmitButton
                      confirmMessage="¿Eliminar este banner?"
                      className="text-sm text-red-500 hover:underline"
                    >
                      Eliminar
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {blobEnabled && (
        <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-bold text-gray-900">Agregar banner</h2>
          <form action={createBanner} encType="multipart/form-data" className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Imagen</label>
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-400">
                Recomendado: imagen apaisada, al menos 1200x500px.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Título (opcional)</label>
              <input name="title" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subtítulo (opcional)</label>
              <input name="subtitle" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Link al hacer clic (opcional)
              </label>
              <input
                name="linkUrl"
                placeholder="/?categoria=Remeras"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="self-start rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
            >
              Agregar banner
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
