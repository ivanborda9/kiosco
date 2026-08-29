"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured, uploadImageFile, deleteImageFile } from "@/lib/blob";

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

function getUploadedFile(formData: FormData, field: string): File | null {
  const file = formData.get(field);
  return file instanceof File && file.size > 0 ? file : null;
}

function getUploadedFiles(formData: FormData, field: string): File[] {
  return formData
    .getAll(field)
    .filter((f): f is File => f instanceof File && f.size > 0);
}

export async function createProduct(formData: FormData) {
  const data = parseProductForm(formData);
  const product = await prisma.product.create({ data });

  if (isBlobConfigured()) {
    const imageFile = getUploadedFile(formData, "imageFile");
    if (imageFile) {
      const url = await uploadImageFile(imageFile, `productos/${product.id}`);
      await prisma.product.update({ where: { id: product.id }, data: { imageUrl: url } });
    }

    const galleryFiles = getUploadedFiles(formData, "galleryFiles");
    for (const file of galleryFiles) {
      const url = await uploadImageFile(file, `productos/${product.id}`);
      await prisma.productImage.create({ data: { productId: product.id, url } });
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function updateProduct(id: string, formData: FormData) {
  const data = parseProductForm(formData);

  if (isBlobConfigured()) {
    const imageFile = getUploadedFile(formData, "imageFile");
    if (imageFile) {
      data.imageUrl = await uploadImageFile(imageFile, `productos/${id}`);
    }
  }

  await prisma.product.update({ where: { id }, data });

  if (isBlobConfigured()) {
    const deleteIds = formData.getAll("deleteImageIds").map(String).filter(Boolean);
    if (deleteIds.length > 0) {
      const toDelete = await prisma.productImage.findMany({ where: { id: { in: deleteIds } } });
      await prisma.productImage.deleteMany({ where: { id: { in: deleteIds } } });
      await Promise.all(toDelete.map((img) => deleteImageFile(img.url)));
    }

    const galleryFiles = getUploadedFiles(formData, "galleryFiles");
    for (const file of galleryFiles) {
      const url = await uploadImageFile(file, `productos/${id}`);
      await prisma.productImage.create({ data: { productId: id, url } });
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath(`/producto/${id}`);
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
