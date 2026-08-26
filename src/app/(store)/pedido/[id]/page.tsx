import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { buildWhatsappOrderLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, reseller: true },
  });

  if (!order) notFound();

  const whatsappLink = buildWhatsappOrderLink({
    orderId: order.id,
    customerName: order.customerName,
    items: order.items,
    total: order.total,
    resellerCode: order.reseller?.code,
  });

  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-gray-900">¡Gracias por tu pedido!</h1>
      <p className="mt-2 text-gray-500">
        Pedido #{order.id.slice(-6).toUpperCase()} recibido. Te contactaremos a la brevedad para
        coordinar el pago y el envío.
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-left">
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between text-gray-700">
              <span>
                {i.quantity}x {i.productName}
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-gray-200 pt-2 text-gray-700">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Descuento {order.reseller ? `(${order.reseller.code})` : ""}</span>
            <span>-{formatPrice(order.discountAmount)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
        >
          Coordinar por WhatsApp
        </a>
        <Link
          href="/"
          className="rounded-lg border border-brand-600 px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
