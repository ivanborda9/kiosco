"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/format";

export async function updateOrderStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") || "");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order || order.status === status) return;

    // Cancelar libera el stock reservado; reactivar un pedido cancelado lo vuelve a reservar.
    if (status === "CANCELADO" && order.status !== "CANCELADO") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    } else if (status !== "CANCELADO" && order.status === "CANCELADO") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    await tx.order.update({ where: { id }, data: { status } });
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
}
