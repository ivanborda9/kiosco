"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured, uploadImageFile, deleteImageFile } from "@/lib/blob";

export async function createBanner(formData: FormData) {
  if (!isBlobConfigured()) {
    redirect("/admin/banners?error=" + encodeURIComponent("Conectá Vercel Blob Storage para subir banners."));
  }

  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/banners?error=" + encodeURIComponent("Elegí una imagen para el banner."));
  }

  const title = String(formData.get("title") || "").trim() || null;
  const subtitle = String(formData.get("subtitle") || "").trim() || null;
  const linkUrl = String(formData.get("linkUrl") || "").trim() || null;

  const url = await uploadImageFile(file, "banners");
  const maxPosition = await prisma.banner.aggregate({ _max: { position: true } });

  await prisma.banner.create({
    data: {
      imageUrl: url,
      title,
      subtitle,
      linkUrl,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function deleteBanner(id: string) {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return;
  await prisma.banner.delete({ where: { id } });
  await deleteImageFile(banner.imageUrl);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function toggleBannerActive(id: string, active: boolean) {
  await prisma.banner.update({ where: { id }, data: { active } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function moveBanner(id: string, direction: "up" | "down") {
  const banners = await prisma.banner.findMany({ orderBy: { position: "asc" } });
  const index = banners.findIndex((b) => b.id === id);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= banners.length) return;

  const a = banners[index];
  const b = banners[swapWith];
  await prisma.$transaction([
    prisma.banner.update({ where: { id: a.id }, data: { position: b.position } }),
    prisma.banner.update({ where: { id: b.id }, data: { position: a.position } }),
  ]);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}
