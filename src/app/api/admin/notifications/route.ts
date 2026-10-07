import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt));
    const formatted = logs.map((l) => ({
      ...l,
      sentAt: l.sentAt.toISOString(),
    }));
    return NextResponse.json({ ok: true, emailLogs: formatted });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading email logs";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, recipient, subject, previewContent } = body;

    if (!recipient || !subject) {
      return NextResponse.json({ ok: false, error: "Recipient and Subject are required" }, { status: 400 });
    }

    const [created] = await db
      .insert(emailLogs)
      .values({
        type: type || "discount_drop",
        subject: subject.trim(),
        recipient: recipient.trim().toLowerCase(),
        status: "sent",
        previewContent: previewContent?.trim() || "Test message dispatch from OTOPZ Admin Panel.",
      })
      .returning();

    return NextResponse.json({
      ok: true,
      emailLog: {
        ...created,
        sentAt: created.sentAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error sending notification";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
