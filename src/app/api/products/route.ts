import { NextRequest, NextResponse } from "next/server";
import { db, products, reviews } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 6)
  );
}

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim().toLowerCase();
    const wantsAll = searchParams.get("includeAll") === "true";
    const includeAll = wantsAll && (await requireAdmin(request)) === null;
    const sort = searchParams.get("sort") || "popular";

    const allProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    const allReviews = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt));

    const reviewsByProduct = new Map<number, typeof allReviews>();
    for (const rev of allReviews) {
      const list = reviewsByProduct.get(rev.productId) || [];
      list.push(rev);
      reviewsByProduct.set(rev.productId, list);
    }

    let enriched = allProducts.map((p) => {
      const prodReviews = reviewsByProduct.get(p.id) || [];
      const avgRating =
        prodReviews.length > 0
          ? Number(
              (
                prodReviews.reduce((acc, r) => acc + r.rating, 0) /
                prodReviews.length
              ).toFixed(1)
            )
          : 5.0;
      return {
        ...p,
        reviewCount: prodReviews.length,
        avgRating,
        reviews: prodReviews,
      };
    });

    if (!includeAll) {
      enriched = enriched.filter((p) => p.status === "published");
    }

    if (category && category !== "All") {
      enriched = enriched.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      enriched = enriched.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.tagline.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.fileFormat.toLowerCase().includes(search)
      );
    }

    if (sort === "popular") {
      enriched.sort((a, b) => b.salesCount - a.salesCount);
    } else if (sort === "price-asc") {
      enriched.sort((a, b) => a.priceCents - b.priceCents);
    } else if (sort === "price-desc") {
      enriched.sort((a, b) => b.priceCents - a.priceCents);
    } else if (sort === "newest") {
      enriched.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return NextResponse.json({ products: enriched });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    await ensureSeeded();
    const body = await request.json();

    const title = String(body.title || "").trim();
    const tagline = String(
      body.tagline || "Architectural digital asset crafted for modern studios."
    ).trim();
    const description = String(
      body.description ||
        "Complete production-ready digital product archive with commercial foundry license."
    ).trim();
    const priceCents =
      typeof body.priceCents === "number"
        ? Math.max(0, Math.round(body.priceCents))
        : Math.max(0, Math.round(Number(body.priceDollars || 49) * 100));
    const category = String(body.category || "Automation Tools").trim();
    const fileFormat = String(body.fileFormat || ".JSON, .PDF").trim();
    const fileSizeMb = String(body.fileSizeMb || "42.0 MB").trim();
    const version = String(body.version || "v1.0.0").trim();
    const coverImage = String(
      body.coverImage || "/images/p-automation.jpg"
    ).trim();
    const previewUrl = String(
      body.previewUrl || "https://atelierfoundry.io/specimens/preview"
    ).trim();
    const status =
      body.status === "draft" || body.status === "archived"
        ? body.status
        : "published";

    if (!title) {
      return NextResponse.json(
        { error: "Product title is required" },
        { status: 400 }
      );
    }

    const slug = body.slug ? String(body.slug).trim() : slugify(title);

    const [created] = await db
      .insert(products)
      .values({
        title,
        slug,
        tagline,
        description,
        priceCents,
        category,
        fileFormat,
        fileSizeMb,
        version,
        coverImage,
        previewUrl,
        status,
        salesCount: 0,
        creatorId: body.creatorId ? Number(body.creatorId) : 1,
      })
      .returning();

    return NextResponse.json(
      {
        product: {
          ...created,
          reviewCount: 0,
          avgRating: 5.0,
          reviews: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
