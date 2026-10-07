import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, string> = {
      store_name: "OTOPZ",
      tagline: "AUTOMATE. / RELAX. / REPEAT.",
      announcement: "⚡ NEW RELEASE: n8n AI Agent Kit v3.1 is live — 20% off with code OTOPZ20",
      currency: "USD",
      license_prefix: "OTOPZ",
    };

    allSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ ok: true, settings: settingsMap });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading settings";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await db
          .insert(settings)
          .values({ key, value })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value, updatedAt: new Date() },
          });
      }
    }

    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, string> = {};
    allSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ ok: true, settings: settingsMap });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating settings";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
