import { prisma } from "./prisma";

function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 6);
}

export async function generateUniqueResellerCode(name: string): Promise<string> {
  const base = slugifyName(name) || "REVENDEDORA";

  for (let attempt = 0; attempt < 20; attempt++) {
    const suffix = Math.floor(10 + Math.random() * 90);
    const candidate = `${base}${suffix}`;
    const existing = await prisma.reseller.findUnique({ where: { code: candidate } });
    if (!existing) return candidate;
  }

  throw new Error("No se pudo generar un código único para la revendedora.");
}
