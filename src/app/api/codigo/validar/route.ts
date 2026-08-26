import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";

  if (!code) {
    return NextResponse.json({ valid: false, message: "Ingresá un código." }, { status: 400 });
  }

  const reseller = await prisma.reseller.findFirst({
    where: { code: { equals: code }, active: true },
  });

  if (!reseller) {
    return NextResponse.json({ valid: false, message: "Código no válido." }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    name: reseller.name,
    discountPercent: reseller.discountPercent,
  });
}
