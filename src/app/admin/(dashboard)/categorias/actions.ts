"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) {
    redirect("/admin/categorias?error=" + encodeURIComponent("Ingresá un nombre para la categoría."));
  }

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    redirect("/admin/categorias?error=" + encodeURIComponent("Ya existe una categoría con ese nombre."));
  }

  const maxPosition = await prisma.category.aggregate({ _max: { position: true } });
  await prisma.category.create({
    data: { name, position: (maxPosition._max.position ?? -1) + 1 },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  redirect("/admin/categorias");
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return;

  const productCount = await prisma.product.count({ where: { category: category.name } });
  if (productCount > 0) {
    redirect(
      "/admin/categorias?error=" +
        encodeURIComponent(
          `No podés eliminar "${category.name}": tiene ${productCount} producto(s) cargado(s). Cambiales la categoría o eliminalos primero.`
        )
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}
