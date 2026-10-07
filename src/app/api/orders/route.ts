import { NextRequest, NextResponse } from "next/server";
import { db, orders, products } from "@/db";
import { ensureSeeded, generateLicenseKey } from "@/db/seed";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();

    const { searchParams } = new URL(request.url);
    const buyerEmail = searchParams.get("buyerEmail")?.trim().toLowerCase();

    const rows = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        buyerEmail: orders.buyerEmail,
        buyerName: orders.buyerName,
        amountCents: orders.amountCents,
        licenseKey: orders.licenseKey,
        status: orders.status,
        createdAt: orders.createdAt,
        productTitle: products.title,
        productSlug: products.slug,
        productCategory: products.category,
        productFileFormat: products.fileFormat,
        productFileSizeMb: products.fileSizeMb,
        productVersion: products.version,
        productCoverImage: products.coverImage,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));

    const filtered = buyerEmail
      ? rows.filter((r) => r.buyerEmail.toLowerCase() === buyerEmail)
      : rows;

    return NextResponse.json({ orders: filtered });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const body = await request.json();

    const buyerEmail = String(body.buyerEmail || "").trim();
    const buyerName = String(body.buyerName || "Studio Member").trim();

    const productIds: number[] = Array.isArray(body.productIds)
      ? body.productIds.map((id: unknown) => Number(id))
      : body.productId
      ? [Number(body.productId)]
      : [];

    if (!buyerEmail || productIds.length === 0) {
      return NextResponse.json(
        { error: "buyerEmail and productId are required" },
        { status: 400 }
      );
    }

    const createdOrders = [];

    for (const pid of productIds) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, pid));

      if (!product) {
        continue;
      }

      const licenseKey = generateLicenseKey();

      const [newOrder] = await db
        .insert(orders)
        .values({
          productId: product.id,
          buyerEmail,
          buyerName,
          amountCents: product.priceCents,
          licenseKey,
          status: "completed",
        })
        .returning();

      await db
        .update(products)
        .set({
          salesCount: sql`${products.salesCount} + 1`,
        })
        .where(eq(products.id, product.id));

      createdOrders.push({
        ...newOrder,
        productTitle: product.title,
        productSlug: product.slug,
        productCategory: product.category,
        productFileFormat: product.fileFormat,
        productFileSizeMb: product.fileSizeMb,
        productVersion: product.version,
        productCoverImage: product.coverImage,
      });
    }

    if (createdOrders.length === 0) {
      return NextResponse.json(
        { error: "Valid product not found for order" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        order: createdOrders[0],
        orders: createdOrders,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout order" },
      { status: 500 }
    );
  }
}
