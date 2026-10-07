import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

/**
 * Returns null only for a valid, signed admin session.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const session = await verifyAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ error: "Sign in as an admin to do this." }, { status: 401 });
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  if (!user || !["admin", "super_admin", "product_manager", "support"].includes(user.role)) {
    return NextResponse.json({ error: "Only admins can manage products and orders." }, { status: 403 });
  }
  return null;
}
