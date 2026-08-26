type ResellerFormValues = {
  name: string;
  email: string | null;
  phone: string | null;
  code: string;
  discountPercent: number;
  commissionPercent: number;
};

export function ResellerForm({
  action,
  initial,
  submitLabel,
  errorMessage,
  hasPassword,
}: {
  action: (formData: FormData) => void;
  initial?: ResellerFormValues;
  submitLabel: string;
  errorMessage?: string;
  hasPassword?: boolean;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email (opcional)</label>
          <input
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono (opcional)</label>
          <input
            name="phone"
            defaultValue={initial?.phone ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Código de descuento</label>
        <input
          name="code"
          required
          placeholder="Ej: ANA10"
          defaultValue={initial?.code}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase"
        />
        <p className="mt-1 text-xs text-gray-400">
          Este es el código que la revendedora comparte con sus clientas.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Descuento para la clienta (%)
          </label>
          <input
            name="discountPercent"
            type="number"
            min={0}
            max={100}
            step="0.1"
            required
            defaultValue={initial?.discountPercent}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Comisión para la revendedora (%)
          </label>
          <input
            name="commissionPercent"
            type="number"
            min={0}
            max={100}
            step="0.1"
            required
            defaultValue={initial?.commissionPercent}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400">
        La comisión se calcula sobre el total de la venta ya con el descuento aplicado.
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {hasPassword ? "Nueva contraseña para su panel (opcional)" : "Contraseña para su panel (opcional)"}
        </label>
        <input
          name="password"
          type="password"
          minLength={6}
          placeholder={hasPassword ? "Dejar vacío para no cambiarla" : "Sin contraseña no puede loguearse"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-400">
          Con email y esta contraseña, la revendedora puede entrar a /revendedora/login a ver sus
          ventas y comisión.
        </p>
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
