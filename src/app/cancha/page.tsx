import { getCanchaConfig, todayDateString } from "@/lib/cancha";
import { formatPrice } from "@/lib/format";
import { isMercadoPagoEnabled } from "@/lib/mercadopago";
import { BookingCalendar } from "@/components/cancha/BookingCalendar";

export const dynamic = "force-dynamic";

export default async function CanchaPage() {
  const config = await getCanchaConfig();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reservá tu turno</h1>
      <p className="mt-1 text-sm text-gray-500">
        Elegí el día y el horario en el calendario. Para confirmar el turno pagás una seña de{" "}
        {formatPrice(config.depositAmount)} con Mercado Pago — no hace falta registrarte, solo tu
        nombre y celular.
      </p>
      <BookingCalendar
        initialConfig={{
          courtName: config.courtName,
          pricePerSlot: config.pricePerSlot,
          depositAmount: config.depositAmount,
          slotDurationMin: config.slotDurationMin,
        }}
        mercadoPagoEnabled={isMercadoPagoEnabled()}
        today={todayDateString()}
      />
    </div>
  );
}
