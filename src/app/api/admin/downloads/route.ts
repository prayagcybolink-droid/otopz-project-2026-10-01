import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { downloads, products, orders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: downloads.id,
        orderId: downloads.orderId,
        productId: downloads.productId,
        buyerEmail: downloads.buyerEmail,
        ipAddress: downloads.ipAddress,
        downloadToken: downloads.downloadToken,
        status: downloads.status,
        downloadCount: downloads.downloadCount,
        downloadedAt: downloads.downloadedAt,
        productTitle: products.title,
      })
      .from(downloads)
      .leftJoin(products, eq(downloads.productId, products.id))
      .orderBy(desc(downloads.downloadedAt));

    const formatted = rows.map((r) => ({
      ...r,
      productTitle: r.productTitle || "Digital Product",
      downloadedAt: r.downloadedAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, downloads: formatted });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading download logs";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, productId, buyerEmail, ipAddress = "127.0.0.1" } = body;

    if (!orderId || !productId || !buyerEmail) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const downloadToken = crypto.randomBytes(16).toString("hex");

    const [created] = await db
      .insert(downloads)
      .values({
        orderId: Number(orderId),
        productId: Number(productId),
        buyerEmail: buyerEmail.trim().toLowerCase(),
        ipAddress,
        downloadToken,
        status: "active",
        downloadCount: 1,
      })
      .returning();

    return NextResponse.json({ ok: true, download: created }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error creating download log";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
