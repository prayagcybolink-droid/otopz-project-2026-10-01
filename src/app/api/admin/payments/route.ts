import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, orders, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gateway = searchParams.get("gateway");

    let query = db
      .select({
        id: payments.id,
        orderId: payments.orderId,
        transactionId: payments.transactionId,
        gateway: payments.gateway,
        amountCents: payments.amountCents,
        feeCents: payments.feeCents,
        currency: payments.currency,
        status: payments.status,
        createdAt: payments.createdAt,
        buyerName: orders.buyerName,
        buyerEmail: orders.buyerEmail,
        productTitle: products.title,
      })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(payments.createdAt));

    let rows;
    if (gateway && gateway !== "All") {
      rows = await query.where(eq(payments.gateway, gateway));
    } else {
      rows = await query;
    }

    const formatted = rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      transactionId: r.transactionId,
      gateway: r.gateway as "Stripe" | "PayPal" | "Crypto" | "Manual",
      amountCents: r.amountCents,
      feeCents: r.feeCents,
      currency: r.currency,
      status: r.status as "succeeded" | "refunded" | "failed",
      createdAt: r.createdAt.toISOString(),
      order: {
        id: r.orderId,
        buyerName: r.buyerName || "Guest",
        buyerEmail: r.buyerEmail || "unknown",
        productTitle: r.productTitle || "Digital Product",
      },
    }));

    return NextResponse.json({ ok: true, payments: formatted });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading payments";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, transactionId, gateway = "Stripe", amountCents, feeCents = 0 } = body;

    if (!orderId || !amountCents) {
      return NextResponse.json({ ok: false, error: "orderId and amountCents required" }, { status: 400 });
    }

    const txId = transactionId || `tx_${gateway.toLowerCase()}_${Date.now().toString().slice(-6)}`;

    const [created] = await db
      .insert(payments)
      .values({
        orderId: Number(orderId),
        transactionId: txId,
        gateway,
        amountCents: Number(amountCents),
        feeCents: Number(feeCents),
        currency: "USD",
        status: "succeeded",
      })
      .returning();

    return NextResponse.json({ ok: true, payment: created }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error creating payment";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
