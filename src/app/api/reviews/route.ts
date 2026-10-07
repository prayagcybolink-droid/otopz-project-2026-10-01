import { NextRequest, NextResponse } from "next/server";
import { db, reviews } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      const pid = Number(productId);
      const list = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, pid))
        .orderBy(desc(reviews.createdAt));
      return NextResponse.json({ reviews: list });
    }

    const list = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt));
    return NextResponse.json({ reviews: list });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const body = await request.json();

    const productId = Number(body.productId);
    const authorName = String(body.authorName || "Verified Buyer").trim();
    const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating || 5))));
    const comment = String(body.comment || "").trim();

    if (!productId || !comment) {
      return NextResponse.json(
        { error: "productId and comment are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(reviews)
      .values({
        productId,
        authorName,
        rating,
        comment,
      })
      .returning();

    return NextResponse.json({ review: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
