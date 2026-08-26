"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/format";

export async function updateOrderStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") || "");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin");
}
