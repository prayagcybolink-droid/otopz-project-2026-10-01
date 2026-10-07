import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ ok: false, error: "Invalid category ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateData.name = body.name.trim();
      updateData.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    if (body.description !== undefined) updateData.description = body.description;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const [updated] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, catId))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, category: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating category";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ ok: false, error: "Invalid category ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, catId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deletedId: catId });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error deleting category";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
