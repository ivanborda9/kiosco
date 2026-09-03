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
    // Si la variante ya no existe (se borró desde el admin), no hay nada que ajustar.
    if (status === "CANCELADO" && order.status !== "CANCELADO") {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant
            .update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } })
            .catch(() => {});
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    } else if (status !== "CANCELADO" && order.status === "CANCELADO") {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant
            .update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } })
            .catch(() => {});
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }

    await tx.order.update({ where: { id }, data: { status } });
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
}

export async function deleteCancelledOrder(id: string) {
  // Por seguridad, solo se puede borrar un pedido que ya esté cancelado
  // (el stock ya se liberó al cancelarlo, así que no hay nada más que revertir).
  await prisma.order.deleteMany({ where: { id, status: "CANCELADO" } });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}
