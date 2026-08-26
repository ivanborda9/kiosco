import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { toggleResellerActive, deleteReseller } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminResellersPage() {
  const resellers = await prisma.reseller.findMany({
    include: { orders: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Revendedoras</h1>
        <Link
          href="/admin/revendedoras/nueva"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Nueva revendedora
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Descuento clienta</th>
              <th className="px-4 py-3">Comisión</th>
              <th className="px-4 py-3">Ventas</th>
              <th className="px-4 py-3">Comisión ganada</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resellers.map((r) => {
              const activeOrders = r.orders.filter((o) => o.status !== "CANCELADO");
              const earned = activeOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
              return (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-brand-700">{r.code}</td>
                  <td className="px-4 py-3">{r.discountPercent}%</td>
                  <td className="px-4 py-3">{r.commissionPercent}%</td>
                  <td className="px-4 py-3">{activeOrders.length}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(earned)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/revendedoras/${r.id}/editar`} className="text-brand-600 hover:underline">
                        Editar
                      </Link>
                      <form action={toggleResellerActive.bind(null, r.id, !r.active)}>
                        <button type="submit" className="text-gray-600 hover:underline">
                          {r.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                      <form action={deleteReseller.bind(null, r.id)}>
                        <ConfirmSubmitButton
                          confirmMessage="¿Eliminar esta revendedora? Si tiene ventas asociadas, se desactivará en su lugar."
                          className="text-red-500 hover:underline"
                        >
                          Eliminar
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {resellers.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-500">Todavía no cargaste revendedoras.</p>
        )}
      </div>
    </div>
  );
}
