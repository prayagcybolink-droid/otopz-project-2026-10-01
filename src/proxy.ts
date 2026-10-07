import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  const session = await verifyAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ ok: false, error: "Admin sign-in required" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
