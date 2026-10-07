import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { downloads } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const downloadId = parseInt(id, 10);
    if (isNaN(downloadId)) {
      return NextResponse.json({ ok: false, error: "Invalid download ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.regenerateToken) {
      updateData.downloadToken = crypto.randomBytes(16).toString("hex");
      updateData.status = "active";
    }

    const [updated] = await db
      .update(downloads)
      .set(updateData)
      .where(eq(downloads.id, downloadId))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Download record not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, download: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating download";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const downloadId = parseInt(id, 10);
    if (isNaN(downloadId)) {
      return NextResponse.json({ ok: false, error: "Invalid download ID" }, { status: 400 });
    }

    const [deleted] = await db.delete(downloads).where(eq(downloads.id, downloadId)).returning();

    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Download not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deletedId: downloadId });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error deleting download";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
