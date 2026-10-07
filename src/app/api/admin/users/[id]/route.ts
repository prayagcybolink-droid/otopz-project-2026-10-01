import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashAdminPassword } from "@/lib/admin-password";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ ok: false, error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.role !== undefined) {
      if (!["product_manager", "support"].includes(body.role)) {
        return NextResponse.json({ ok: false, error: "Invalid staff role" }, { status: 400 });
      }
      updateData.role = body.role;
    }
    if (body.permissions !== undefined) updateData.permissions = body.permissions;
    if (body.password !== undefined && body.password.trim()) {
      if (body.password.length < 12) {
        return NextResponse.json(
          { ok: false, error: "Passwords must contain at least 12 characters" },
          { status: 400 }
        );
      }
      updateData.passwordHash = hashAdminPassword(body.password);
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const session = await verifyAdminSession(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );
    await db.insert(auditLogs).values({
      adminEmail: session?.email || process.env.ADMIN_EMAIL || "admin",
      action: "ADMIN_PERMISSIONS_UPDATED",
      entity: "USERS",
      details: `Updated role/permissions for ${updated.email}.`,
    });

    const { passwordHash: _passwordHash, ...safeUpdated } = updated;
    return NextResponse.json({ ok: true, user: safeUpdated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating admin user";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ ok: false, error: "Invalid user ID" }, { status: 400 });
    }

    const [target] = await db.select().from(users).where(eq(users.id, userId));
    if (!target) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }
    if (target.email === process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
      return NextResponse.json({ ok: false, error: "The primary admin cannot be deleted" }, { status: 409 });
    }
    const [deleted] = await db.delete(users).where(eq(users.id, userId)).returning();

    if (!deleted) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const session = await verifyAdminSession(
      _request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );
    await db.insert(auditLogs).values({
      adminEmail: session?.email || process.env.ADMIN_EMAIL || "admin",
      action: "ADMIN_DELETED",
      entity: "USERS",
      details: `Removed admin user ${deleted.email}.`,
    });

    return NextResponse.json({ ok: true, deletedId: userId });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error deleting admin user";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
