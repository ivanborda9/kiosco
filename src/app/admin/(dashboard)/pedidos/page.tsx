import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate, OrderStatus } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getAdminRole } from "@/lib/adminSession";
import { deleteCancelledOrder } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [orders, role] = await Promise.all([
    prisma.order.findMany({
      include: { reseller: true },
      orderBy: { createdAt: "desc" },
    }),
    getAdminRole(),
  ]);
  const isOwner = role === "owner";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Pedidos</h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Localidad</th>
              <th className="px-4 py-3">Revendedora</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-mono text-gray-500">#{o.id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{o.reseller?.city || "—"}</td>
                <td className="px-4 py-3">{o.reseller?.code ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  {o.paymentMethod === "MERCADOPAGO" ? (
                    <span
                      className={
                        o.paymentStatus === "APROBADO"
                          ? "font-medium text-green-700"
                          : o.paymentStatus === "RECHAZADO"
                            ? "font-medium text-red-600"
                            : "font-medium text-yellow-700"
                      }
                    >
                      MP ·{" "}
                      {o.paymentStatus === "APROBADO"
                        ? "Aprobado"
                        : o.paymentStatus === "RECHAZADO"
                          ? "Rechazado"
                          : "Pendiente"}
                    </span>
                  ) : (
                    <span className="text-gray-500">WhatsApp</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status as OrderStatus} />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/pedidos/${o.id}`} className="text-brand-600 hover:underline">
                      Ver
                    </Link>
                    {isOwner && o.status === "CANCELADO" && (
                      <form action={deleteCancelledOrder.bind(null, o.id)}>
                        <ConfirmSubmitButton
                          confirmMessage="¿Eliminar este pedido cancelado? Esta acción no se puede deshacer."
                          className="text-red-500 hover:underline"
                        >
                          Eliminar
                        </ConfirmSubmitButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-500">Todavía no hay pedidos.</p>
        )}
      </div>
    </div>
  );
}
