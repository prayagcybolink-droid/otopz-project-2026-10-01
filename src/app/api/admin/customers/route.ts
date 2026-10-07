import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

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
        licenseKey: orders.licenseKey,
        status: orders.status,
        createdAt: orders.createdAt,
        productTitle: products.title,
        productCategory: products.category,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));

    const map = new Map<
      string,
      {
        email: string;
        name: string;
        ordersCount: number;
        completedCount: number;
        totalSpentCents: number;
        licenses: string[];
        status: "active" | "flagged";
        firstOrderDate: string;
        lastOrderDate: string;
        orders: Array<{
          id: number;
          productId: number;
          buyerEmail: string;
          buyerName: string;
          amountCents: number;
          licenseKey: string;
          status: "completed" | "refunded" | "cancelled";
          createdAt: string;
          product?: {
            id: number;
            title: string;
            slug: string;
            category: string;
            priceCents: number;
            fileFormat: string;
            fileSizeMb: string;
            version: string;
            coverImage: string;
          };
        }>;
      }
    >();

    allOrders.forEach((ord) => {
      const email = ord.buyerEmail.toLowerCase();
      const existing = map.get(email);
      const formattedOrder = {
        id: ord.id,
        productId: ord.productId ?? 0,
        buyerEmail: ord.buyerEmail,
        buyerName: ord.buyerName,
        amountCents: ord.amountCents,
        licenseKey: ord.licenseKey,
        status: ord.status as "completed" | "refunded" | "cancelled",
        createdAt: ord.createdAt.toISOString(),
        product: ord.productTitle
          ? {
              id: ord.productId ?? 0,
              title: ord.productTitle,
              slug: "",
              category: ord.productCategory || "",
              priceCents: ord.amountCents,
              fileFormat: "ZIP",
              fileSizeMb: "15 MB",
              version: "1.0.0",
              coverImage: "/images/p-automation.jpg",
            }
          : undefined,
      };

      if (!existing) {
        map.set(email, {
          email,
          name: ord.buyerName,
          ordersCount: 1,
          completedCount: ord.status === "completed" ? 1 : 0,
          totalSpentCents: ord.status === "completed" ? ord.amountCents : 0,
          licenses: [ord.licenseKey],
          status: "active",
          firstOrderDate: ord.createdAt.toISOString(),
          lastOrderDate: ord.createdAt.toISOString(),
          orders: [formattedOrder],
        });
      } else {
        existing.ordersCount += 1;
        if (ord.status === "completed") {
          existing.completedCount += 1;
          existing.totalSpentCents += ord.amountCents;
        }
        existing.licenses.push(ord.licenseKey);
        existing.orders.push(formattedOrder);
      }
    });

    const customers = Array.from(map.values()).sort((a, b) => b.totalSpentCents - a.totalSpentCents);

    return NextResponse.json({ ok: true, customers });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading customers";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
