import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { homepageBanners } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let banner = await db.query.homepageBanners.findFirst({
      orderBy: desc(homepageBanners.id),
    });

    if (!banner) {
      const [created] = await db
        .insert(homepageBanners)
        .values({
          announcementText: "⚡ NEW RELEASE: n8n AI Agent Kit v3.1 is live — 20% off with code",
          promoCode: "OTOPZ20",
          heroTitle: "AUTOMATE. / RELAX. / REPEAT.",
          heroSubtitle: "Production-ready automation tools, battle-tested workflows, and brutalist digital presets.",
          heroCtaText: "EXPLORE CATALOG",
          heroImage: "/images/hero-model.jpg",
          isBannerActive: true,
        })
        .returning();
      banner = created;
    }

    return NextResponse.json({
      ok: true,
      banner: {
        ...banner,
        updatedAt: banner.updatedAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error reading banner config";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      announcementText,
      promoCode,
      heroTitle,
      heroSubtitle,
      heroCtaText,
      heroImage,
      isBannerActive,
    } = body;

    const existing = await db.query.homepageBanners.findFirst({
      orderBy: desc(homepageBanners.id),
    });

    let updated;
    if (existing) {
      const [u] = await db
        .update(homepageBanners)
        .set({
          announcementText: announcementText ?? existing.announcementText,
          promoCode: promoCode ?? existing.promoCode,
          heroTitle: heroTitle ?? existing.heroTitle,
          heroSubtitle: heroSubtitle ?? existing.heroSubtitle,
          heroCtaText: heroCtaText ?? existing.heroCtaText,
          heroImage: heroImage ?? existing.heroImage,
          isBannerActive: isBannerActive !== undefined ? Boolean(isBannerActive) : existing.isBannerActive,
          updatedAt: new Date(),
        })
        .where(desc(homepageBanners.id))
        .returning();
      updated = u;
    } else {
      const [c] = await db
        .insert(homepageBanners)
        .values({
          announcementText: announcementText || "⚡ NEW RELEASE: n8n AI Agent Kit v3.1",
          promoCode: promoCode || "OTOPZ20",
          heroTitle: heroTitle || "AUTOMATE. / RELAX. / REPEAT.",
          heroSubtitle: heroSubtitle || "Digital Tools & Workflows",
          heroCtaText: heroCtaText || "EXPLORE CATALOG",
          heroImage: heroImage || "/images/hero-model.jpg",
          isBannerActive: Boolean(isBannerActive),
        })
        .returning();
      updated = c;
    }

    return NextResponse.json({
      ok: true,
      banner: {
        ...updated,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error saving banner config";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
