import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  PENDING_HOLD_MINUTES,
  generateDaySlots,
  getCanchaConfig,
  isClosedWeekday,
  todayDateString,
} from "@/lib/cancha";
import { createBookingPreference, isMercadoPagoEnabled } from "@/lib/mercadopago";
import { sendCallMeBotMessage } from "@/lib/notify";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const date = typeof body?.date === "string" ? body.date : "";
  const startTime = typeof body?.startTime === "string" ? body.startTime : "";
  const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const customerPhone = typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";

  if (!DATE_RE.test(date) || !TIME_RE.test(startTime)) {
    return NextResponse.json({ error: "Fecha u horario inválido." }, { status: 400 });
  }
  if (!customerName || !customerPhone) {
    return NextResponse.json({ error: "Nombre y teléfono son obligatorios." }, { status: 400 });
  }
  if (date < todayDateString()) {
    return NextResponse.json({ error: "No se puede reservar una fecha pasada." }, { status: 400 });
  }
  if (!isMercadoPagoEnabled()) {
    return NextResponse.json(
      { error: "El pago de la seña no está disponible en este momento." },
      { status: 400 }
    );
  }

  const config = await getCanchaConfig();
  if (isClosedWeekday(config, date)) {
    return NextResponse.json({ error: "La cancha está cerrada ese día." }, { status: 400 });
  }
  const slot = generateDaySlots(config).find((s) => s.startTime === startTime);
  if (!slot) {
    return NextResponse.json({ error: "Ese turno no existe." }, { status: 400 });
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findUnique({
        where: { date_startTime: { date, startTime } },
      });

      const isBlocking =
        existing &&
        existing.status !== "CANCELADO" &&
        (existing.paymentStatus === "APROBADO" ||
          (existing.paymentStatus === "PENDIENTE" &&
            existing.createdAt.getTime() > Date.now() - PENDING_HOLD_MINUTES * 60_000));

      if (isBlocking) {
        throw new Error("SLOT_TAKEN");
      }

      const data = {
        endTime: slot.endTime,
        customerName,
        customerPhone,
        price: config.pricePerSlot,
        depositAmount: config.depositAmount,
        status: "PENDIENTE",
        paymentStatus: "PENDIENTE",
        mpPreferenceId: null,
        mpPaymentId: null,
        createdAt: new Date(),
      };

      // Reutilizamos la fila del turno si quedó libre (cancelada, rechazada o
      // una espera de seña vencida) en vez de crear una nueva: el turno es
      // único por fecha+hora, así que no se puede insertar otra fila para el
      // mismo horario.
      if (existing) {
        return tx.booking.update({ where: { id: existing.id }, data });
      }
      return tx.booking.create({ data: { date, startTime, ...data } });
    });

    await sendCallMeBotMessage({
      phone: config.whatsappNumber,
      apiKey: config.callmebotApiKey,
      message: `⚽ Nueva reserva en ${config.courtName}\nFecha: ${date} a las ${startTime}\nCliente: ${customerName} (${customerPhone})`,
    });

    try {
      const { preferenceId, checkoutUrl } = await createBookingPreference({
        bookingId: booking.id,
        title: `Seña ${config.courtName} - ${date} ${startTime}`,
        depositAmount: booking.depositAmount,
        baseUrl: req.nextUrl.origin,
      });
      await prisma.booking.update({ where: { id: booking.id }, data: { mpPreferenceId: preferenceId } });
      return NextResponse.json({ bookingId: booking.id, checkoutUrl });
    } catch (mpError) {
      console.error("Error creando la preferencia de Mercado Pago para la reserva:", mpError);
      // El turno ya está reservado a nombre del cliente; que reintente el pago desde
      // la página de la reserva en vez de perder el turno.
      return NextResponse.json({ bookingId: booking.id });
    }
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_TAKEN") {
      return NextResponse.json({ error: "Ese turno ya fue reservado. Elegí otro." }, { status: 409 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Ese turno ya fue reservado. Elegí otro." }, { status: 409 });
    }
    console.error("Error creando la reserva:", err);
    return NextResponse.json({ error: "No se pudo crear la reserva." }, { status: 500 });
  }
}
