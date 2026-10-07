import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);
    if (isNaN(mediaId)) {
      return NextResponse.json({ ok: false, error: "Invalid ID" }, { status: 400 });
    }

    const [deleted] = await db.delete(media).where(eq(media.id, mediaId)).returning({ id: media.id });
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deletedId: mediaId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting media";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
