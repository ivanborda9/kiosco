"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function parseProductForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    price: Number(formData.get("price") || 0),
    category: String(formData.get("category") || "").trim(),
    stock: Math.max(0, Math.floor(Number(formData.get("stock") || 0))),
    imageUrl: String(formData.get("imageUrl") || "").trim() || null,
  };
}

export async function createProduct(formData: FormData) {
  const data = parseProductForm(formData);
  await prisma.product.create({ data });
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function updateProduct(id: string, formData: FormData) {
  const data = parseProductForm(formData);
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function toggleProductActive(id: string, active: boolean) {
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    await prisma.product.update({ where: { id }, data: { active: false } });
  }
  revalidatePath("/admin/productos");
  revalidatePath("/");
}
