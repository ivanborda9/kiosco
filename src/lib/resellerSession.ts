import { cookies } from "next/headers";
import { RESELLER_SESSION_COOKIE_NAME, verifyResellerSessionToken } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentReseller() {
  const token = cookies().get(RESELLER_SESSION_COOKIE_NAME)?.value;
  const resellerId = await verifyResellerSessionToken(token);
  if (!resellerId) return null;
  return prisma.reseller.findUnique({ where: { id: resellerId } });
}
