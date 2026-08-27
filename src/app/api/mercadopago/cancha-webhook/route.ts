import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMercadoPagoPayment, mapMercadoPagoStatus, verifyMercadoPagoWebhookSignature } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  const dataId = req.nextUrl.searchParams.get("data.id") || req.nextUrl.searchParams.get("id");
  const type = req.nextUrl.searchParams.get("type") || req.nextUrl.searchParams.get("topic");

  const valid = verifyMercadoPagoWebhookSignature({
    xSignature: req.headers.get("x-signature"),
    xRequestId: req.headers.get("x-request-id"),
    dataId,
  });

  if (!valid) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  if (type !== "payment" || !dataId) {
    // Otros tipos de notificación (merchant_order, etc.) se ignoran.
    return NextResponse.json({ received: true });
  }

  try {
    const payment = await getMercadoPagoPayment(dataId);
    const bookingId = payment.external_reference;
    if (!bookingId) {
      return NextResponse.json({ received: true });
    }

    const paymentStatus = mapMercadoPagoStatus(payment.status);

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ received: true });
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus,
        mpPaymentId: String(payment.id ?? ""),
        ...(paymentStatus === "APROBADO" && booking.status === "PENDIENTE"
          ? { status: "CONFIRMADO" }
          : {}),
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago (cancha):", err);
    return NextResponse.json({ error: "No se pudo procesar la notificación." }, { status: 500 });
  }
}
