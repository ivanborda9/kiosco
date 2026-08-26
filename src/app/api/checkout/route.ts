import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderPreference, isMercadoPagoEnabled } from "@/lib/mercadopago";

type CheckoutItem = { productId: string; quantity: number };

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const customerPhone = typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";
  const customerAddress = typeof body?.customerAddress === "string" ? body.customerAddress.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const resellerCode =
    typeof body?.resellerCode === "string" && body.resellerCode.trim()
      ? body.resellerCode.trim().toUpperCase()
      : null;
  const paymentMethod = body?.paymentMethod === "MERCADOPAGO" ? "MERCADOPAGO" : "WHATSAPP";
  const items: CheckoutItem[] = Array.isArray(body?.items)
    ? body.items
        .filter((i: any) => typeof i?.productId === "string" && Number(i?.quantity) > 0)
        .map((i: any) => ({ productId: i.productId, quantity: Math.floor(Number(i.quantity)) }))
    : [];

  if (!customerName || !customerPhone || !customerAddress) {
    return NextResponse.json(
      { error: "Nombre, teléfono y dirección son obligatorios." },
      { status: 400 }
    );
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }
  if (paymentMethod === "MERCADOPAGO" && !isMercadoPagoEnabled()) {
    return NextResponse.json(
      { error: "El pago con Mercado Pago no está disponible en este momento." },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItemsData = items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product || !product.active) {
          throw new Error(`Producto no disponible: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Sin stock suficiente de "${product.name}".`);
        }
        subtotal += product.price * item.quantity;
        return {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      });

      let reseller = null;
      if (resellerCode) {
        reseller = await tx.reseller.findFirst({ where: { code: resellerCode, active: true } });
      }

      const discountAmount = reseller ? Math.round(subtotal * (reseller.discountPercent / 100)) : 0;
      const total = subtotal - discountAmount;
      const commissionAmount = reseller ? Math.round(total * (reseller.commissionPercent / 100)) : 0;

      const createdOrder = await tx.order.create({
        data: {
          customerName,
          customerPhone,
          customerAddress,
          notes: notes || null,
          subtotal,
          discountAmount,
          total,
          commissionAmount,
          resellerId: reseller?.id ?? null,
          paymentMethod,
          items: { create: orderItemsData },
        },
        include: { items: true, reseller: true },
      });

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return createdOrder;
    });

    if (paymentMethod === "MERCADOPAGO") {
      try {
        const { preferenceId, checkoutUrl } = await createOrderPreference({
          orderId: order.id,
          title: `Pedido #${order.id.slice(-6).toUpperCase()}`,
          total: order.total,
          baseUrl: req.nextUrl.origin,
        });
        await prisma.order.update({ where: { id: order.id }, data: { mpPreferenceId: preferenceId } });
        return NextResponse.json({ orderId: order.id, checkoutUrl });
      } catch (mpError) {
        console.error("Error creando la preferencia de Mercado Pago:", mpError);
        // El pedido ya está creado y el stock reservado: dejamos que coordine el pago
        // por WhatsApp en vez de perder la venta.
        return NextResponse.json({ orderId: order.id });
      }
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo procesar el pedido.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
