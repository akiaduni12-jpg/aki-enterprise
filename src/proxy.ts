import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow login page and auth API endpoints
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth")
  ) {
    return NextResponse.next();
  }

  // 2. Direct /admin root navigation
  if (pathname === "/admin") {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await verifyAdminToken(token) : null;
    const target = session ? "/admin/dashboard" : "/admin/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Protect all other /admin/* pages and /api/admin/* endpoints
  if (pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await verifyAdminToken(token) : null;

    if (!session) {
      // API call -> return 401 Unauthorized
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized admin access." },
          { status: 401 }
        );
      }

      // Web page -> redirect to admin login with original redirect destination
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};

export default proxy;
