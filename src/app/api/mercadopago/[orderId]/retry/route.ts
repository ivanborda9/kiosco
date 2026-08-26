import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderPreference, isMercadoPagoEnabled } from "@/lib/mercadopago";

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  if (!isMercadoPagoEnabled()) {
    return NextResponse.json({ error: "Mercado Pago no está disponible." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.orderId } });
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }
  if (order.paymentStatus === "APROBADO") {
    return NextResponse.json({ error: "Este pedido ya está pagado." }, { status: 400 });
  }

  try {
    const { preferenceId, checkoutUrl } = await createOrderPreference({
      orderId: order.id,
      title: `Pedido #${order.id.slice(-6).toUpperCase()}`,
      total: order.total,
      baseUrl: req.nextUrl.origin,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preferenceId, paymentMethod: "MERCADOPAGO", paymentStatus: "PENDIENTE" },
    });
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("Error reintentando el pago de Mercado Pago:", err);
    return NextResponse.json({ error: "No se pudo generar el link de pago." }, { status: 500 });
  }
}
