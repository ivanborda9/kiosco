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
    costPrice: formData.get("costPrice") ? Number(formData.get("costPrice")) : null,
    category: String(formData.get("category") || "").trim(),
    stock: Math.max(0, Math.floor(Number(formData.get("stock") || 0))),
    imageUrl: String(formData.get("imageUrl") || "").trim() || null,
  };
}

type ParsedVariant = { id?: string; color: string | null; size: string | null; stock: number };

function parseVariantsForm(formData: FormData): ParsedVariant[] {
  let parsed: unknown[] = [];
  try {
    parsed = JSON.parse(String(formData.get("variantsJson") || "[]"));
  } catch {
    parsed = [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((v: any) => ({
      id: typeof v?.id === "string" && v.id ? v.id : undefined,
      color: typeof v?.color === "string" ? v.color.trim() : "",
      size: typeof v?.size === "string" ? v.size.trim() : "",
      stock: Math.max(0, Math.floor(Number(v?.stock) || 0)),
    }))
    .filter((v) => v.color || v.size)
    .map((v) => ({ id: v.id, color: v.color || null, size: v.size || null, stock: v.stock }));
}

async function syncVariants(productId: string, variants: ParsedVariant[]) {
  const existing = await prisma.productVariant.findMany({ where: { productId } });
  const incomingIds = new Set(variants.filter((v) => v.id).map((v) => v.id));
  const toDelete = existing.filter((v) => !incomingIds.has(v.id));
  if (toDelete.length > 0) {
    await prisma.productVariant.deleteMany({ where: { id: { in: toDelete.map((v) => v.id) } } });
  }
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    if (v.id) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { color: v.color, size: v.size, stock: v.stock, position: i },
      });
    } else {
      await prisma.productVariant.create({
        data: { productId, color: v.color, size: v.size, stock: v.stock, position: i },
      });
    }
  }
}

function getUploadedFiles(formData: FormData, field: string): File[] {
  return formData
    .getAll(field)
    .filter((f): f is File => f instanceof File && f.size > 0);
}

/**
 * Un solo campo de subida de fotos: si el producto todavía no tiene foto
 * principal, la primera que se suba la establece como tal; el resto (y
 * todas, si ya había una) se agregan a la galería.
 */
async function uploadPhotos(formData: FormData, productId: string, hasMainImage: boolean) {
  const files = getUploadedFiles(formData, "photoFiles");
  let mainImageUrl: string | null = null;

  for (const file of files) {
    const url = await uploadImageFile(file, `productos/${productId}`);
    if (!hasMainImage && mainImageUrl === null) {
      mainImageUrl = url;
    } else {
      await prisma.productImage.create({ data: { productId, url } });
    }
  }

  return mainImageUrl;
}

export async function createProduct(formData: FormData) {
  const data = parseProductForm(formData);
  const product = await prisma.product.create({ data });

  const variants = parseVariantsForm(formData);
  if (variants.length > 0) {
    await syncVariants(product.id, variants);
  }

  if (isBlobConfigured()) {
    const mainImageUrl = await uploadPhotos(formData, product.id, Boolean(data.imageUrl));
    if (mainImageUrl) {
      await prisma.product.update({ where: { id: product.id }, data: { imageUrl: mainImageUrl } });
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function updateProduct(id: string, formData: FormData) {
  const data = parseProductForm(formData);

  await prisma.product.update({ where: { id }, data });

  const variants = parseVariantsForm(formData);
  await syncVariants(id, variants);

  if (isBlobConfigured()) {
    const deleteIds = formData.getAll("deleteImageIds").map(String).filter(Boolean);
    if (deleteIds.length > 0) {
      const toDelete = await prisma.productImage.findMany({ where: { id: { in: deleteIds } } });
      await prisma.productImage.deleteMany({ where: { id: { in: deleteIds } } });
      await Promise.all(toDelete.map((img) => deleteImageFile(img.url)));
    }

    const mainImageUrl = await uploadPhotos(formData, id, Boolean(data.imageUrl));
    if (mainImageUrl) {
      await prisma.product.update({ where: { id }, data: { imageUrl: mainImageUrl } });
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
