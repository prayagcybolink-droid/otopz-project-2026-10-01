import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) {
      return NextResponse.json({ ok: false, error: "Invalid payment ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const [updated] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, paymentId))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Payment not found" }, { status: 404 });
    }

    // If marked refunded, also reflect on order
    if (body.status === "refunded" && updated.orderId) {
      await db
        .update(orders)
        .set({ status: "refunded" })
        .where(eq(orders.id, updated.orderId));
    }

    return NextResponse.json({ ok: true, payment: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating payment";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
