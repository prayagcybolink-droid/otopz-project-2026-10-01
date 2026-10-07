import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { digitalFiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileId = parseInt(id, 10);
    if (isNaN(fileId)) {
      return NextResponse.json({ ok: false, error: "Invalid file ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.fileName !== undefined) updateData.fileName = body.fileName;
    if (body.fileFormat !== undefined) updateData.fileFormat = body.fileFormat;
    if (body.fileSizeMb !== undefined) updateData.fileSizeMb = body.fileSizeMb;
    if (body.version !== undefined) updateData.version = body.version;
    if (body.storagePath !== undefined) updateData.storagePath = body.storagePath;
    if (body.productId !== undefined) updateData.productId = body.productId ? Number(body.productId) : null;
    if (body.recalculateChecksum) {
      updateData.sha256Checksum = crypto.randomBytes(32).toString("hex");
    }

    const [updated] = await db
      .update(digitalFiles)
      .set(updateData)
      .where(eq(digitalFiles.id, fileId))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Digital file not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, digitalFile: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating digital file";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileId = parseInt(id, 10);
    if (isNaN(fileId)) {
      return NextResponse.json({ ok: false, error: "Invalid file ID" }, { status: 400 });
    }

    const [deleted] = await db.delete(digitalFiles).where(eq(digitalFiles.id, fileId)).returning();

    if (!deleted) {
      return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deletedId: fileId });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error deleting file";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
