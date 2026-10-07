import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allOrders = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        buyerEmail: orders.buyerEmail,
        buyerName: orders.buyerName,
        amountCents: orders.amountCents,
        status: orders.status,
        createdAt: orders.createdAt,
        productTitle: products.title,
        productCategory: products.category,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));

    const allProducts = await db.select().from(products);
    const allReviews = await db.select().from(reviews);
    const allUsers = await db.select().from(users);

    const completedOrders = allOrders.filter((o) => o.status === "completed");
    const refundedOrders = allOrders.filter((o) => o.status === "refunded");

    const totalRevenueCents = completedOrders.reduce((sum, o) => sum + o.amountCents, 0);
    const refundedRevenueCents = refundedOrders.reduce((sum, o) => sum + o.amountCents, 0);

    const avgOrderValueCents =
      completedOrders.length > 0
        ? Math.round(totalRevenueCents / completedOrders.length)
        : 0;

    // Unique customers
    const uniqueBuyers = new Set(allOrders.map((o) => o.buyerEmail.toLowerCase()));

    // Category breakdown
    const categoryRevenueMap: Record<string, { count: number; revenueCents: number }> = {};
    completedOrders.forEach((o) => {
      const cat = o.productCategory || "Other";
      if (!categoryRevenueMap[cat]) {
        categoryRevenueMap[cat] = { count: 0, revenueCents: 0 };
      }
      categoryRevenueMap[cat].count += 1;
      categoryRevenueMap[cat].revenueCents += o.amountCents;
    });

    const categoryBreakdown = Object.entries(categoryRevenueMap).map(([category, data]) => ({
      category,
      count: data.count,
      revenueCents: data.revenueCents,
    }));

    // Status breakdown for products
    const productStatusCount = {
      published: allProducts.filter((p) => p.status === "published").length,
      draft: allProducts.filter((p) => p.status === "draft").length,
      archived: allProducts.filter((p) => p.status === "archived").length,
      total: allProducts.length,
    };

    // Review metrics
    const reviewCount = allReviews.length;
    const avgRating =
      reviewCount > 0
        ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 5.0;

    // Top 5 products by sales
    const topProducts = [...allProducts]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        priceCents: p.priceCents,
        salesCount: p.salesCount,
        coverImage: p.coverImage,
      }));

    return NextResponse.json({
      ok: true,
      stats: {
        totalRevenueCents,
        refundedRevenueCents,
        completedOrdersCount: completedOrders.length,
        refundedOrdersCount: refundedOrders.length,
        totalOrdersCount: allOrders.length,
        uniqueCustomersCount: uniqueBuyers.size,
        avgOrderValueCents,
        productStatusCount,
        reviewCount,
        avgRating,
        registeredUsersCount: allUsers.length,
        categoryBreakdown,
        topProducts,
        recentOrders: allOrders.slice(0, 8).map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
        })),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error generating stats";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
