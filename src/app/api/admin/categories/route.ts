import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allCats = await db.select().from(categories).orderBy(asc(categories.displayOrder));
    const allProds = await db.select().from(products);

    const enriched = allCats.map((cat) => ({
      ...cat,
      productCount: allProds.filter((p) => p.category === cat.name).length,
      createdAt: cat.createdAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, categories: enriched });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading categories";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, coverImage, displayOrder = 0, isActive = true } = body;

    if (!name) {
      return NextResponse.json({ ok: false, error: "Category name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const [created] = await db
      .insert(categories)
      .values({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        coverImage: coverImage || "/images/cat-automation.jpg",
        displayOrder: Number(displayOrder) || 0,
        isActive: Boolean(isActive),
      })
      .returning();

    return NextResponse.json({ ok: true, category: created }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error creating category";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
