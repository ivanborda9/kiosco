import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getCanchaConfig } from "@/lib/cancha";
import { getMercadoPagoPayment, mapMercadoPagoStatus } from "@/lib/mercadopago";
import { RetryBookingPaymentButton } from "@/components/RetryBookingPaymentButton";

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { payment_id?: string };
}) {
  let booking = await prisma.booking.findUnique({ where: { id: params.id } });

  if (!booking) notFound();

  // MP redirige acá antes de que llegue la notificación del webhook: si tenemos el
  // payment_id, confirmamos el estado real contra la API de Mercado Pago al toque
  // en vez de esperar. Nunca confiamos en el "status" que viene por la URL.
  if (booking.paymentStatus === "PENDIENTE" && searchParams.payment_id) {
    try {
      const payment = await getMercadoPagoPayment(searchParams.payment_id);
      if (payment.external_reference === booking.id) {
        const paymentStatus = mapMercadoPagoStatus(payment.status);
        booking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus,
            mpPaymentId: String(payment.id ?? ""),
            ...(paymentStatus === "APROBADO" && booking.status === "PENDIENTE"
              ? { status: "CONFIRMADO" }
              : {}),
          },
        });
      }
    } catch {
      // Si falla, nos quedamos con el estado actual; el webhook lo va a actualizar después.
    }
  }

  const config = await getCanchaConfig();

  const header = {
    APROBADO: { icon: "✓", color: "green", title: "¡Turno confirmado!" },
    RECHAZADO: { icon: "✕", color: "red", title: "El pago de la seña fue rechazado" },
    PENDIENTE: { icon: "…", color: "yellow", title: "Tu pago está siendo procesado" },
  }[booking.paymentStatus] ?? { icon: "…", color: "yellow", title: "Reserva recibida" };

  const colorClasses: Record<string, string> = {
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  const whatsappText = encodeURIComponent(
    [
      `Hola! Quiero coordinar mi turno en ${config.courtName}.`,
      `Fecha: ${booking.date} a las ${booking.startTime}`,
      `Nombre: ${booking.customerName}`,
    ].join("\n")
  );

  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${colorClasses[header.color]}`}
      >
        {header.icon}
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{header.title}</h1>
      <p className="mt-2 text-gray-500">
        {booking.paymentStatus === "RECHAZADO"
          ? "El pago de la seña no se pudo procesar. Podés reintentar con otra tarjeta."
          : booking.paymentStatus === "PENDIENTE"
            ? "Te vamos a avisar apenas se confirme el pago de la seña."
            : `Reserva #${booking.id.slice(-6).toUpperCase()} confirmada. ¡Te esperamos!`}
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-left text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Cancha</span>
          <span className="font-medium">{config.courtName}</span>
        </div>
        <div className="mt-2 flex justify-between">
          <span>Fecha</span>
          <span className="font-medium">{booking.date.split("-").reverse().join("/")}</span>
        </div>
        <div className="mt-2 flex justify-between">
          <span>Horario</span>
          <span className="font-medium">
            {booking.startTime} - {booking.endTime}
          </span>
        </div>
        <div className="mt-2 flex justify-between">
          <span>A nombre de</span>
          <span className="font-medium">{booking.customerName}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-200 pt-2">
          <span>Precio total</span>
          <span>{formatPrice(booking.price)}</span>
        </div>
        <div className="mt-1 flex justify-between text-lg font-bold text-gray-900">
          <span>Seña {booking.paymentStatus === "APROBADO" ? "pagada" : "a pagar"}</span>
          <span>{formatPrice(booking.depositAmount)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {booking.paymentStatus === "RECHAZADO" && (
          <RetryBookingPaymentButton bookingId={booking.id} />
        )}
        {config.whatsappNumber && (
          <a
            href={`https://wa.me/${config.whatsappNumber}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
          >
            Coordinar por WhatsApp
          </a>
        )}
        <Link
          href="/cancha"
          className="rounded-lg border border-brand-600 px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50"
        >
          Reservar otro turno
        </Link>
      </div>
    </div>
  );
}
