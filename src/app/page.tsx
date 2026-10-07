import React from "react";
import { cookies } from "next/headers";
import { db, products, orders, reviews, users } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { desc, eq } from "drizzle-orm";
import { FoundryWorkspace } from "@/components/FoundryWorkspace";
import { ProductItem, OrderItem, UserSession } from "@/types/foundry";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialProducts: ProductItem[] = [];
  let initialOrders: OrderItem[] = [];
  let initialUser: UserSession | null = null;

  try {
    await ensureSeeded();

    const [allProducts, allReviews, rawOrders] = await Promise.all([
      db.select().from(products).orderBy(desc(products.salesCount)),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)),
      db
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
          productSlug: products.slug,
          productCategory: products.category,
          productFileFormat: products.fileFormat,
          productFileSizeMb: products.fileSizeMb,
          productVersion: products.version,
          productCoverImage: products.coverImage,
        })
        .from(orders)
        .innerJoin(products, eq(orders.productId, products.id))
        .orderBy(desc(orders.createdAt)),
    ]);

    const reviewsMap = new Map<
      number,
      {
        id: number;
        productId: number;
        authorName: string;
        rating: number;
        comment: string;
        createdAt: string;
      }[]
    >();

    for (const r of allReviews) {
      const list = reviewsMap.get(r.productId) || [];
      list.push({
        id: r.id,
        productId: r.productId,
        authorName: r.authorName,
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date(r.createdAt).toISOString(),
      });
      reviewsMap.set(r.productId, list);
    }

    initialProducts = allProducts.map((p) => {
      const prodReviews = reviewsMap.get(p.id) || [];
      const avgRating =
        prodReviews.length > 0
          ? Number(
              (
                prodReviews.reduce((acc, rev) => acc + rev.rating, 0) /
                prodReviews.length
              ).toFixed(1)
            )
          : 5.0;

      return {
        ...p,
        createdAt: new Date(p.createdAt).toISOString(),
        reviewCount: prodReviews.length,
        avgRating,
        reviews: prodReviews,
      };
    });

    initialOrders = rawOrders.map((o) => ({
      ...o,
      createdAt: new Date(o.createdAt).toISOString(),
    }));

    const cookieStore = await cookies();
    const sessionEmail =
      cookieStore.get("atelier_session_email")?.value || "marcus@studio.co";
    const adminSession = await verifyAdminSession(
      cookieStore.get(ADMIN_SESSION_COOKIE)?.value
    );

    if (sessionEmail !== "guest") {
      const [u] = await db
        .select()
        .from(users)
        .where(eq(users.email, sessionEmail));
      if (u) {
        const isAdminRole = [
          "admin",
          "super_admin",
          "product_manager",
          "support",
        ].includes(u.role) ||
          u.email === process.env.ADMIN_EMAIL?.trim().toLowerCase();
        if (!isAdminRole || adminSession?.email === u.email) {
          initialUser = {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatarUrl: u.avatarUrl,
          };
        }
      }
    }
    if (
      !initialUser ||
      !["admin", "super_admin", "product_manager", "support"].includes(initialUser.role)
    ) {
      initialProducts = initialProducts.filter((p) => p.status === "published");
    }
  } catch (err) {
    console.error("HomePage bootstrap query error:", err);
  }

  return (
    <FoundryWorkspace
      initialProducts={initialProducts}
      initialOrders={initialOrders}
      initialUser={initialUser}
    />
  );
}
