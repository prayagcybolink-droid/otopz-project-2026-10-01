import { NextRequest, NextResponse } from "next/server";
import { db, users, auditLogs } from "@/db";
import { eq } from "drizzle-orm";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  verifyAdminSession,
} from "@/lib/admin-session";
import { hashAdminPassword, verifyAdminPassword } from "@/lib/admin-password";

export const dynamic = "force-dynamic";
const STORE_SESSION_COOKIE = "atelier_session_email";

function matchesSecret(candidate: string, expected: string): boolean {
  const candidateHash = new TextEncoder().encode(candidate);
  const expectedHash = new TextEncoder().encode(expected);
  let diff = candidateHash.length ^ expectedHash.length;
  const maxLength = Math.max(candidateHash.length, expectedHash.length);
  for (let index = 0; index < maxLength; index += 1) {
    diff |= (candidateHash[index] ?? 0) ^ (expectedHash[index] ?? 0);
  }
  return diff === 0;
}

function adminUserResponse(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    avatarUrl: user.avatarUrl,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );
    if (!session) return NextResponse.json({ ok: false, user: null });

    const [user] = await db.select().from(users).where(eq(users.email, session.email));
    if (!user || !["admin", "super_admin", "product_manager", "support"].includes(user.role)) {
      return NextResponse.json({ ok: false, user: null });
    }

    return NextResponse.json({ ok: true, user: adminUserResponse(user) });
  } catch (error) {
    console.error("GET /api/admin/auth error:", error);
    return NextResponse.json({ ok: false, error: "Could not verify admin session" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === "logout") {
      const response = NextResponse.json({ ok: true, message: "Logged out" });
      response.cookies.delete(ADMIN_SESSION_COOKIE);
      response.cookies.delete(STORE_SESSION_COOKIE);
      return response;
    }

    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const configuredPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (
      !configuredEmail ||
      !configuredPassword ||
      configuredPassword.length < 16 ||
      !sessionSecret ||
      sessionSecret.length < 32
    ) {
      return NextResponse.json(
        { ok: false, error: "Admin credentials are not configured on this server" },
        { status: 503 }
      );
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Invalid admin credentials" }, { status: 401 });
    }

    let [user] = await db.select().from(users).where(eq(users.email, configuredEmail));
    const isConfiguredAdmin = matchesSecret(email, configuredEmail);
    if (isConfiguredAdmin && !matchesSecret(password, configuredPassword)) {
      return NextResponse.json({ ok: false, error: "Invalid admin credentials" }, { status: 401 });
    }

    if (!isConfiguredAdmin) {
      [user] = await db.select().from(users).where(eq(users.email, email));
      if (
        !user ||
        !["admin", "super_admin", "product_manager", "support"].includes(user.role) ||
        !verifyAdminPassword(password, user.passwordHash)
      ) {
        return NextResponse.json({ ok: false, error: "Invalid admin credentials" }, { status: 401 });
      }
    }

    const lastLoginAt = new Date();
    if (user) {
      [user] = await db
        .update(users)
        .set(
          isConfiguredAdmin
            ? {
                passwordHash: hashAdminPassword(configuredPassword),
                role: "super_admin",
                permissions: "all",
                lastLoginAt,
              }
            : { lastLoginAt }
        )
        .where(eq(users.id, user.id))
        .returning();
    } else if (isConfiguredAdmin) {
      [user] = await db
        .insert(users)
        .values({
          name: configuredEmail.split("@")[0].replace(/[._-]/g, " "),
          email: configuredEmail,
          passwordHash: "",
          role: "super_admin",
          permissions: "all",
          avatarUrl: "OT",
          lastLoginAt,
        })
        .returning();
    } else {
      return NextResponse.json({ ok: false, error: "Invalid admin credentials" }, { status: 401 });
    }

    await db.insert(auditLogs).values({
      adminEmail: user.email,
      action: "ADMIN_LOGIN",
      entity: "AUTH",
      details: "Admin signed in successfully.",
    });

    const response = NextResponse.json({ ok: true, user: adminUserResponse(user) });
    response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(user.email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    response.cookies.set(STORE_SESSION_COOKIE, user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    console.error("POST /api/admin/auth error:", error);
    return NextResponse.json({ ok: false, error: "Admin sign-in failed" }, { status: 500 });
  }
}
