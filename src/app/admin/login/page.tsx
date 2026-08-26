import { loginAction } from "./actions";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <form
        action={loginAction}
        className="w-full max-w-sm rounded-xl border border-brand-100 bg-white p-6 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-bold text-gray-900">Panel de administración</h1>
        <p className="mb-4 text-sm text-gray-500">Ingresá tus credenciales para continuar.</p>

        {searchParams.error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Usuario o contraseña incorrectos.
          </p>
        )}

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Usuario</label>
          <input
            name="username"
            required
            autoFocus
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
