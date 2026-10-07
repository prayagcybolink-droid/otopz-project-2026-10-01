import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, readImageDimensions } from "@/lib/imageMeta";

export const dynamic = "force-dynamic";

function toItem(row: {
  id: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    width: row.width,
    height: row.height,
    url: `/api/media/${row.id}`,
    createdAt: row.createdAt.toISOString(),
  };
}

/** List uploaded media (metadata only, never the binary payload). */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: media.id,
        fileName: media.fileName,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        width: media.width,
        height: media.height,
        createdAt: media.createdAt,
      })
      .from(media)
      .orderBy(desc(media.createdAt));

    return NextResponse.json({ ok: true, media: rows.map(toItem) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error listing media";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/** Upload an image via multipart/form-data (field name: `file`). */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file === "string" || typeof (file as Blob).arrayBuffer !== "function") {
      return NextResponse.json({ ok: false, error: "No file received" }, { status: 400 });
    }

    const blob = file as File;
    const mimeType = blob.type || "application/octet-stream";

    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported file type. Use JPG, PNG, WebP or GIF." },
        { status: 400 }
      );
    }

    if (blob.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `Image is too large. Maximum size is ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const dims = readImageDimensions(buffer);

    const rawName = (blob.name || "upload").trim();
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-120) || "upload";

    const [row] = await db
      .insert(media)
      .values({
        fileName: safeName,
        mimeType,
        sizeBytes: buffer.length,
        width: dims?.width ?? null,
        height: dims?.height ?? null,
        data: buffer.toString("base64"),
      })
      .returning({
        id: media.id,
        fileName: media.fileName,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        width: media.width,
        height: media.height,
        createdAt: media.createdAt,
      });

    return NextResponse.json({ ok: true, media: toItem(row) }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
