import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, payments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d"; // '7d' | '30d' | 'ytd' | 'all'

    const allOrders = await db
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
        productCategory: products.category,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));

    const allPayments = await db.select().from(payments);

    // Filter by date range
    const now = Date.now();
    let cutoff = 0;
    if (range === "7d") cutoff = now - 7 * 86400000;
    else if (range === "30d") cutoff = now - 30 * 86400000;
    else if (range === "ytd") cutoff = new Date(new Date().getFullYear(), 0, 1).getTime();

    const filtered = allOrders.filter((o) => o.createdAt.getTime() >= cutoff);

    const completed = filtered.filter((o) => o.status === "completed");
    const refunded = filtered.filter((o) => o.status === "refunded");

    const grossRevenueCents = completed.reduce((sum, o) => sum + o.amountCents, 0);
    const refundedRevenueCents = refunded.reduce((sum, o) => sum + o.amountCents, 0);
    const netRevenueCents = grossRevenueCents - refundedRevenueCents;

    // Fees calculation
    const totalFeesCents = allPayments.reduce((sum, p) => sum + p.feeCents, 0);

    // Sales by Category
    const categoryMap: Record<string, { count: number; revenueCents: number }> = {};
    completed.forEach((o) => {
      const cat = o.productCategory || "Other";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, revenueCents: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].revenueCents += o.amountCents;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([cat, data]) => ({
      category: cat,
      count: data.count,
      revenueCents: data.revenueCents,
    }));

    // Sales by Product
    const productSalesMap: Record<string, { count: number; revenueCents: number }> = {};
    completed.forEach((o) => {
      const title = o.productTitle || "Digital Product";
      if (!productSalesMap[title]) productSalesMap[title] = { count: 0, revenueCents: 0 };
      productSalesMap[title].count += 1;
      productSalesMap[title].revenueCents += o.amountCents;
    });

    const topProducts = Object.entries(productSalesMap)
      .map(([title, data]) => ({
        title,
        count: data.count,
        revenueCents: data.revenueCents,
      }))
      .sort((a, b) => b.revenueCents - a.revenueCents);

    return NextResponse.json({
      ok: true,
      report: {
        range,
        orderCount: filtered.length,
        completedCount: completed.length,
        refundedCount: refunded.length,
        grossRevenueCents,
        refundedRevenueCents,
        netRevenueCents,
        totalFeesCents,
        avgOrderValueCents: completed.length > 0 ? Math.round(grossRevenueCents / completed.length) : 0,
        categoryBreakdown,
        topProducts,
        orders: filtered.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
        })),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error generating sales report";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
