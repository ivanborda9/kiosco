"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function parseResellerForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    code: String(formData.get("code") || "")
      .trim()
      .toUpperCase(),
    discountPercent: Number(formData.get("discountPercent") || 0),
    commissionPercent: Number(formData.get("commissionPercent") || 0),
  };
}

export async function createReseller(formData: FormData) {
  const data = parseResellerForm(formData);
  if (!data.code) {
    redirect("/admin/revendedoras/nueva?error=El código es obligatorio.");
  }

  let failed = false;
  try {
    await prisma.reseller.create({ data });
  } catch {
    failed = true;
  }

  if (failed) {
    redirect(`/admin/revendedoras/nueva?error=El código "${data.code}" ya está en uso.`);
  }

  revalidatePath("/admin/revendedoras");
  redirect("/admin/revendedoras");
}

export async function updateReseller(id: string, formData: FormData) {
  const data = parseResellerForm(formData);
  await prisma.reseller.update({ where: { id }, data });
  revalidatePath("/admin/revendedoras");
  redirect("/admin/revendedoras");
}

export async function toggleResellerActive(id: string, active: boolean) {
  await prisma.reseller.update({ where: { id }, data: { active } });
  revalidatePath("/admin/revendedoras");
}

export async function deleteReseller(id: string) {
  try {
    await prisma.reseller.delete({ where: { id } });
  } catch {
    await prisma.reseller.update({ where: { id }, data: { active: false } });
  }
  revalidatePath("/admin/revendedoras");
}
