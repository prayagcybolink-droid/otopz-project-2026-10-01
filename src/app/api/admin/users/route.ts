import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { desc, eq, ne } from "drizzle-orm";
import { hashAdminPassword } from "@/lib/admin-password";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only return admin / staff users (not regular buyers)
    const staff = await db
      .select()
      .from(users)
      .where(ne(users.role, "buyer"))
      .orderBy(desc(users.createdAt));

    const audits = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(30);

    const formattedStaff = staff.map(({ passwordHash: _passwordHash, ...u }) => ({
      ...u,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    }));

    const formattedAudits = audits.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      users: formattedStaff,
      auditLogs: formattedAudits,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading admin users";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role = "product_manager", permissions, password } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 12
    ) {
      return NextResponse.json(
        { ok: false, error: "Name, email, and a password of at least 12 characters are required" },
        { status: 400 }
      );
    }
    if (!["product_manager", "support"].includes(role)) {
      return NextResponse.json({ ok: false, error: "Invalid staff role" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
      return NextResponse.json({ ok: false, error: "That email is reserved for the primary admin" }, { status: 409 });
    }

    const [created] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: cleanEmail,
        passwordHash: hashAdminPassword(password),
        role,
        permissions: permissions || (role === "super_admin" ? "all" : JSON.stringify(["products", "orders"])),
        avatarUrl: "https://images.pexels.com/photos/20235870/pexels-photo-20235870.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
      })
      .returning();

    // Audit log
    const session = await verifyAdminSession(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );
    await db.insert(auditLogs).values({
      adminEmail: session?.email || process.env.ADMIN_EMAIL || "admin",
      action: "ADMIN_INVITED",
      entity: "USERS",
      details: `Invited new admin user ${created.name} (${created.email}) with role ${created.role}.`,
    });

    const { passwordHash: _passwordHash, ...safeCreated } = created;
    return NextResponse.json(
      {
        ok: true,
        user: {
          ...safeCreated,
          lastLoginAt: null,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error adding admin user";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
