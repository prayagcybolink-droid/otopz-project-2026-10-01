import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { digitalFiles, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const files = await db
      .select({
        id: digitalFiles.id,
        productId: digitalFiles.productId,
        fileName: digitalFiles.fileName,
        fileFormat: digitalFiles.fileFormat,
        fileSizeMb: digitalFiles.fileSizeMb,
        version: digitalFiles.version,
        sha256Checksum: digitalFiles.sha256Checksum,
        storagePath: digitalFiles.storagePath,
        downloadCount: digitalFiles.downloadCount,
        createdAt: digitalFiles.createdAt,
        productTitle: products.title,
      })
      .from(digitalFiles)
      .leftJoin(products, eq(digitalFiles.productId, products.id))
      .orderBy(desc(digitalFiles.createdAt));

    const formatted = files.map((f) => ({
      ...f,
      productTitle: f.productTitle || "Unlinked Asset",
      createdAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, digitalFiles: formatted });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading digital files";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, fileName, fileFormat, fileSizeMb, version = "1.0.0", storagePath } = body;

    if (!fileName || !fileFormat || !fileSizeMb) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: fileName, fileFormat, fileSizeMb" },
        { status: 400 }
      );
    }

    const sha256Checksum = crypto
      .createHash("sha256")
      .update(`${fileName}-${version}-${Date.now()}`)
      .digest("hex");

    const [created] = await db
      .insert(digitalFiles)
      .values({
        productId: productId ? Number(productId) : null,
        fileName: fileName.trim(),
        fileFormat: fileFormat.trim(),
        fileSizeMb: fileSizeMb.trim(),
        version: version.trim(),
        sha256Checksum,
        storagePath: storagePath?.trim() || `/vault/storage/${fileName}`,
        downloadCount: 0,
      })
      .returning();

    return NextResponse.json({ ok: true, digitalFile: created }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error creating digital file";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
