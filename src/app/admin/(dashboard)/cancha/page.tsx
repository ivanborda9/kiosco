import { getCanchaConfig, BOOKING_STATUSES, BOOKING_STATUS_LABELS } from "@/lib/cancha";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { saveCanchaConfig, updateBookingStatus } from "./actions";

export const dynamic = "force-dynamic";

const WEEKDAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  APROBADO: "font-medium text-green-700",
  RECHAZADO: "font-medium text-red-600",
  PENDIENTE: "font-medium text-yellow-700",
};

const BOOKING_STATUS_STYLES: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export default async function AdminCanchaPage({
  searchParams,
}: {
  searchParams: { guardado?: string };
}) {
  const config = await getCanchaConfig();
  const closedWeekdays = new Set(config.closedWeekdays.split(",").filter(Boolean).map(Number));
  const bookings = await prisma.booking.findMany({
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Cancha de fútbol</h1>
      <p className="mb-6 text-sm text-gray-500">
        Configurá los horarios, el precio y la seña de la cancha, y revisá las reservas.
      </p>

      {searchParams.guardado && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
          Cambios guardados.
        </p>
      )}

      <form action={saveCanchaConfig} className="mb-10 flex max-w-xl flex-col gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de la cancha</label>
          <input
            name="courtName"
            required
            defaultValue={config.courtName}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Precio del turno</label>
            <input
              type="number"
              name="pricePerSlot"
              min={0}
              step={100}
              required
              defaultValue={config.pricePerSlot}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Seña para reservar</label>
            <input
              type="number"
              name="depositAmount"
              min={0}
              step={100}
              required
              defaultValue={config.depositAmount}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Apertura</label>
            <input
              type="time"
              name="openTime"
              required
              defaultValue={config.openTime}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cierre</label>
            <input
              type="time"
              name="closeTime"
              required
              defaultValue={config.closeTime}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Duración del turno (min)
            </label>
            <input
              type="number"
              name="slotDurationMin"
              min={15}
              step={15}
              required
              defaultValue={config.slotDurationMin}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-gray-700">Días cerrados</span>
          <div className="flex flex-wrap gap-3">
            {WEEKDAYS.map((day) => (
              <label key={day.value} className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="closedWeekdays"
                  value={day.value}
                  defaultChecked={closedWeekdays.has(day.value)}
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Número de WhatsApp de contacto
          </label>
          <input
            name="whatsappNumber"
            placeholder="5491122334455"
            defaultValue={config.whatsappNumber}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-400">
            A este número le llegan los avisos de WhatsApp cuando alguien reserva o cancela un
            turno (necesita la API key de abajo).
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            API key de CallMeBot (avisos de WhatsApp)
          </label>
          <input
            name="callmebotApiKey"
            placeholder="Ej: 123456"
            defaultValue={config.callmebotApiKey}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-400">
            Sin esta clave no se envían los avisos. Se consigue gratis en 2 minutos: guardá el
            contacto de CallMeBot desde{" "}
            <a
              href="https://www.callmebot.com/blog/free-api-whatsapp-messages/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              callmebot.com/whatsapp
            </a>
            , mandale el mensaje que piden desde el WhatsApp del número de arriba, y te responde
            con la API key.
          </p>
        </div>

        <button
          type="submit"
          className="mt-2 self-start rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
        >
          Guardar cambios
        </button>
      </form>

      <h2 className="mb-4 text-lg font-bold text-gray-900">Reservas</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Horario</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Celular</th>
              <th className="px-4 py-3">Seña</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Cambiar estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 text-gray-700">{b.date.split("-").reverse().join("/")}</td>
                <td className="px-4 py-3 text-gray-700">
                  {b.startTime} - {b.endTime}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{b.customerName}</td>
                <td className="px-4 py-3 text-gray-700">{b.customerPhone}</td>
                <td className="px-4 py-3">{formatPrice(b.depositAmount)}</td>
                <td className="px-4 py-3">
                  <span className={PAYMENT_STATUS_STYLES[b.paymentStatus] ?? "text-gray-500"}>
                    {b.paymentStatus === "APROBADO"
                      ? "Aprobado"
                      : b.paymentStatus === "RECHAZADO"
                        ? "Rechazado"
                        : "Pendiente"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      BOOKING_STATUS_STYLES[b.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS] ?? b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={updateBookingStatus.bind(null, b.id)} className="inline-flex gap-2">
                    <select
                      name="status"
                      defaultValue={b.status}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {BOOKING_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      Guardar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-500">Todavía no hay reservas.</p>
        )}
      </div>
    </div>
  );
}
