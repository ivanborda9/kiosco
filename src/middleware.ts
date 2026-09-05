import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  RESELLER_SESSION_COOKIE_NAME,
  verifySessionToken,
  verifyResellerSessionToken,
} from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const role = await verifySessionToken(token);

    if (!role) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    if (role === "empleado" && !pathname.startsWith("/admin/pedidos")) {
      return NextResponse.redirect(new URL("/admin/pedidos", req.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/revendedora/panel")) {
    const token = req.cookies.get(RESELLER_SESSION_COOKIE_NAME)?.value;
    const resellerId = await verifyResellerSessionToken(token);

    if (!resellerId) {
      return NextResponse.redirect(new URL("/revendedora/login", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/revendedora/panel/:path*"],
};
