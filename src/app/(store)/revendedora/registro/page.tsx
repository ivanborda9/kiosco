import { registerReseller } from "../actions";

export default function RegistroRevendedoraPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Registrate como revendedora</h1>
      <p className="mb-6 text-sm text-gray-500">
        Vamos a revisar tu solicitud y activar tu código en poco tiempo.
      </p>

      {searchParams.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {searchParams.error}
        </p>
      )}

      <form action={registerReseller} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre y apellido</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono (opcional)</label>
          <input name="phone" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-400">Mínimo 6 caracteres.</p>
        </div>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
        >
          Crear mi cuenta
        </button>
      </form>
    </div>
  );
}
