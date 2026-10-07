import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    const formatted = allCoupons.map((c) => ({
      ...c,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
    }));
    return NextResponse.json({ ok: true, coupons: formatted });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading coupons";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      discountType = "percent",
      discountValue,
      minSpendCents = 0,
      maxUses = 100,
      expiresAt,
      isActive = true,
    } = body;

    if (!code || discountValue === undefined) {
      return NextResponse.json(
        { ok: false, error: "Code and discountValue are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(coupons)
      .values({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minSpendCents: Number(minSpendCents) || 0,
        maxUses: Number(maxUses) || 100,
        usedCount: 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: Boolean(isActive),
      })
      .returning();

    return NextResponse.json({ ok: true, coupon: created }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error creating coupon";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
