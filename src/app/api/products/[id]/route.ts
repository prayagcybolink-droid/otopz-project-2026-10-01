import { requireAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";
import { db, products, reviews } from "@/db";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const prodReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    const avgRating =
      prodReviews.length > 0
        ? Number(
            (
              prodReviews.reduce((acc, r) => acc + r.rating, 0) /
              prodReviews.length
            ).toFixed(1)
          )
        : 5.0;

    return NextResponse.json({
      product: {
        ...product,
        reviewCount: prodReviews.length,
        avgRating,
        reviews: prodReviews,
      },
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();

    const updateData: Partial<typeof products.$inferInsert> = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.tagline !== undefined)
      updateData.tagline = String(body.tagline).trim();
    if (body.description !== undefined)
      updateData.description = String(body.description).trim();
    if (body.priceCents !== undefined)
      updateData.priceCents = Math.max(0, Math.round(Number(body.priceCents)));
    if (body.category !== undefined)
      updateData.category = String(body.category).trim();
    if (body.fileFormat !== undefined)
      updateData.fileFormat = String(body.fileFormat).trim();
    if (body.fileSizeMb !== undefined)
      updateData.fileSizeMb = String(body.fileSizeMb).trim();
    if (body.version !== undefined)
      updateData.version = String(body.version).trim();
    if (body.coverImage !== undefined)
      updateData.coverImage = String(body.coverImage).trim();
    if (body.previewUrl !== undefined)
      updateData.previewUrl = String(body.previewUrl).trim();
    if (body.status !== undefined)
      updateData.status = String(body.status).trim();

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const prodReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    const avgRating =
      prodReviews.length > 0
        ? Number(
            (
              prodReviews.reduce((acc, r) => acc + r.rating, 0) /
              prodReviews.length
            ).toFixed(1)
          )
        : 5.0;

    return NextResponse.json({
      product: {
        ...updated,
        reviewCount: prodReviews.length,
        avgRating,
        reviews: prodReviews,
      },
    });
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted, success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
