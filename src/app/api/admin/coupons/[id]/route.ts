import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const couponId = parseInt(id, 10);
    if (isNaN(couponId)) {
      return NextResponse.json({ ok: false, error: "Invalid coupon ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.code !== undefined) updateData.code = body.code.trim().toUpperCase();
    if (body.discountType !== undefined) updateData.discountType = body.discountType;
    if (body.discountValue !== undefined) updateData.discountValue = Number(body.discountValue);
    if (body.minSpendCents !== undefined) updateData.minSpendCents = Number(body.minSpendCents);
    if (body.maxUses !== undefined) updateData.maxUses = Number(body.maxUses);
    if (body.usedCount !== undefined) updateData.usedCount = Number(body.usedCount);
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const [updated] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, couponId))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, coupon: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating coupon";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const couponId = parseInt(id, 10);
    if (isNaN(couponId)) {
      return NextResponse.json({ ok: false, error: "Invalid coupon ID" }, { status: 400 });
    }

    const [deleted] = await db.delete(coupons).where(eq(coupons.id, couponId)).returning();

    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deletedId: couponId });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error deleting coupon";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
