import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCanchaConfig } from "@/lib/cancha";
import { createBookingPreference, isMercadoPagoEnabled } from "@/lib/mercadopago";

export async function POST(req: NextRequest, { params }: { params: { bookingId: string } }) {
  if (!isMercadoPagoEnabled()) {
    return NextResponse.json({ error: "Mercado Pago no está disponible." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: params.bookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }
  if (booking.paymentStatus === "APROBADO") {
    return NextResponse.json({ error: "Esta reserva ya tiene la seña pagada." }, { status: 400 });
  }
  if (booking.status === "CANCELADO") {
    return NextResponse.json({ error: "Esta reserva fue cancelada." }, { status: 400 });
  }

  const config = await getCanchaConfig();

  try {
    const { preferenceId, checkoutUrl } = await createBookingPreference({
      bookingId: booking.id,
      title: `Seña ${config.courtName} - ${booking.date} ${booking.startTime}`,
      depositAmount: booking.depositAmount,
      baseUrl: req.nextUrl.origin,
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { mpPreferenceId: preferenceId, paymentStatus: "PENDIENTE" },
    });
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("Error reintentando el pago de la seña:", err);
    return NextResponse.json({ error: "No se pudo generar el link de pago." }, { status: 500 });
  }
}
