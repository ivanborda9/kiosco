"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

async function resolveImageUrl(formData: FormData) {
  const currentImageUrl = String(formData.get("currentImageUrl") || "").trim() || null;
  const removeImage = formData.get("removeImage") === "true";
  const file = formData.get("image");

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("La imagen no puede pesar más de 8 MB.");
    }
    const blob = await put(`productos/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  return removeImage ? null : currentImageUrl;
}

async function parseProductForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    price: Number(formData.get("price") || 0),
    category: String(formData.get("category") || "").trim(),
    stock: Math.max(0, Math.floor(Number(formData.get("stock") || 0))),
    imageUrl: await resolveImageUrl(formData),
  };
}

export async function createProduct(formData: FormData) {
  const data = await parseProductForm(formData);
  await prisma.product.create({ data });
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function updateProduct(id: string, formData: FormData) {
  const data = await parseProductForm(formData);
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
