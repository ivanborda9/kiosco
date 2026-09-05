"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkAdminCredentials, createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  const role = checkAdminCredentials(username, password);
  if (!role) {
    redirect("/admin/login?error=1");
  }

  const token = await createSessionToken(role);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  redirect(role === "empleado" ? "/admin/pedidos" : "/admin");
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
