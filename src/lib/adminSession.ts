import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken, type AdminRole } from "@/lib/auth";

export async function getAdminRole(): Promise<AdminRole | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
