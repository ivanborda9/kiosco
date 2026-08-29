import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  RESELLER_SESSION_COOKIE_NAME,
  verifySessionToken,
  verifyResellerSessionToken,
} from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Despliegues dedicados a la cancha (SITE_MODE=cancha en las variables de entorno)
  // usan /cancha como portada en vez del catálogo de ropa.
  if (pathname === "/" && process.env.SITE_MODE === "cancha") {
    return NextResponse.redirect(new URL("/cancha", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const valid = await verifySessionToken(token);

    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
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
  matcher: ["/", "/admin/:path*", "/revendedora/panel/:path*"],
};
