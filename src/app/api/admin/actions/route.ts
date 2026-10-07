import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, orders, reviews, users, settings } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { generateLicenseKey, ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "bulk_status") {
      const { ids, status } = body;
      if (!Array.isArray(ids) || ids.length === 0 || !status) {
        return NextResponse.json({ ok: false, error: "Missing ids or status" }, { status: 400 });
      }
      await db
        .update(products)
        .set({ status })
        .where(inArray(products.id, ids.map(Number)));
      return NextResponse.json({ ok: true, message: `Updated ${ids.length} products to ${status}` });
    }

    if (action === "bulk_delete") {
      const { ids } = body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ ok: false, error: "Missing ids" }, { status: 400 });
      }
      await db.delete(products).where(inArray(products.id, ids.map(Number)));
      return NextResponse.json({ ok: true, message: `Deleted ${ids.length} products` });
    }

    if (action === "create_test_order") {
      const allProds = await db.select().from(products).where(eq(products.status, "published"));
      if (allProds.length === 0) {
        return NextResponse.json({ ok: false, error: "No published products available" }, { status: 400 });
      }

      const randomProd = allProds[Math.floor(Math.random() * allProds.length)];
      const sampleNames = [
        "Maya Lin",
        "Kasper Jensen",
        "Amira Al-Mansoor",
        "Julian Cruz",
        "Siddharth Rao",
        "Elena Rostova",
      ];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomEmail = `${randomName.toLowerCase().replace(/[^a-z]/g, "")}@example.com`;

      const [newOrder] = await db
        .insert(orders)
        .values({
          productId: randomProd.id,
          buyerEmail: randomEmail,
          buyerName: randomName,
          amountCents: randomProd.priceCents,
          licenseKey: generateLicenseKey(),
          status: "completed",
        })
        .returning();

      await db
        .update(products)
        .set({ salesCount: randomProd.salesCount + 1 })
        .where(eq(products.id, randomProd.id));

      return NextResponse.json({ ok: true, order: newOrder });
    }

    if (action === "reset_seed") {
      // Clear data & reseed
      await db.delete(reviews);
      await db.delete(orders);
      await db.delete(products);
      await db.delete(users);
      await db.delete(settings);

      await ensureSeeded();
      return NextResponse.json({ ok: true, message: "Database reseeded successfully" });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error executing action";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
