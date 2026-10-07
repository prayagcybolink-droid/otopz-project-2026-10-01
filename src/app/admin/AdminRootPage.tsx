import { db } from "@/db";
import {
  users,
  categories,
  products,
  orders,
  payments,
  coupons,
  digitalFiles,
  downloads,
  reviews,
  homepageBanners,
  emailLogs,
  auditLogs,
  settings,
  media,
} from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { AdminControlPanel } from "@/components/admin/AdminControlPanel";
import { cookies } from "next/headers";
import { desc, asc, eq, ne } from "drizzle-orm";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import {
  ProductItem,
  CategoryItem,
  OrderItem,
  PaymentItem,
  CouponItem,
  DigitalFileItem,
  DownloadItem,
  ReviewItem,
  HomepageBannerConfig,
  EmailLogItem,
  AuditLogItem,
  AdminUserItem,
  MediaItem,
  UserSession,
} from "@/types/admin";

export const dynamic = "force-dynamic";

export default async function AdminRootPage() {
  const cookieStore = await cookies();
  const session = await verifyAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  );
  if (!session) {
    return <AdminControlPanel {...emptyAdminData} />;
  }

  await ensureSeeded();
  const sessionUser = await db.query.users.findFirst({
    where: eq(users.email, session.email),
  });
  if (!sessionUser || !["admin", "super_admin"].includes(sessionUser.role)) {
    return <AdminControlPanel {...emptyAdminData} />;
  }

  const userSession: UserSession | null = sessionUser
    ? {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role as any,
        permissions: sessionUser.permissions,
        avatarUrl: sessionUser.avatarUrl,
      }
    : null;

  // Load Categories
  const allCats = await db.select().from(categories).orderBy(asc(categories.displayOrder));
  const allProds = await db.select().from(products).orderBy(desc(products.createdAt));
  const allReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));

  const initialCategories: CategoryItem[] = allCats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    coverImage: c.coverImage,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    productCount: allProds.filter((p) => p.category === c.name).length,
    createdAt: c.createdAt.toISOString(),
  }));

  // Load Products
  const initialProducts: ProductItem[] = allProds.map((p) => {
    const prodReviews = allReviews.filter((r) => r.productId === p.id);
    const count = prodReviews.length;
    const sum = prodReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = count > 0 ? Number((sum / count).toFixed(1)) : 5.0;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      priceCents: p.priceCents,
      category: p.category,
      fileFormat: p.fileFormat,
      fileSizeMb: p.fileSizeMb,
      version: p.version,
      coverImage: p.coverImage,
      previewUrl: p.previewUrl,
      salesCount: p.salesCount,
      creatorId: p.creatorId,
      avgRating: avg,
      reviewCount: count,
      status: p.status as "published" | "draft" | "archived",
      createdAt: p.createdAt.toISOString(),
    };
  });

  // Load Orders
  const orderRows = await db
    .select({
      id: orders.id,
      productId: orders.productId,
      buyerEmail: orders.buyerEmail,
      buyerName: orders.buyerName,
      amountCents: orders.amountCents,
      licenseKey: orders.licenseKey,
      status: orders.status,
      couponCode: orders.couponCode,
      createdAt: orders.createdAt,
      productTitle: products.title,
      productSlug: products.slug,
      productCategory: products.category,
      productPriceCents: products.priceCents,
      productFileFormat: products.fileFormat,
      productFileSizeMb: products.fileSizeMb,
      productVersion: products.version,
      productCoverImage: products.coverImage,
    })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .orderBy(desc(orders.createdAt));

  const initialOrders: OrderItem[] = orderRows.map((row) => ({
    id: row.id,
    productId: row.productId ?? 0,
    buyerEmail: row.buyerEmail,
    buyerName: row.buyerName,
    amountCents: row.amountCents,
    licenseKey: row.licenseKey,
    status: (row.status as any) || "completed",
    couponCode: row.couponCode,
    createdAt: row.createdAt.toISOString(),
    product: row.productTitle
      ? {
          id: row.productId ?? 0,
          title: row.productTitle,
          slug: row.productSlug || "",
          category: row.productCategory || "",
          priceCents: row.productPriceCents || 0,
          fileFormat: row.productFileFormat || "ZIP",
          fileSizeMb: row.productFileSizeMb || "15 MB",
          version: row.productVersion || "1.0.0",
          coverImage: row.productCoverImage || "/images/p-automation.jpg",
        }

      : undefined,
  }));

  // Load Payments
  const paymentRows = await db
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

  const initialPayments: PaymentItem[] = paymentRows.map((r) => ({
    id: r.id,
    orderId: r.orderId ?? 0,
    transactionId: r.transactionId,
    gateway: (r.gateway as any) || "Stripe",
    amountCents: r.amountCents,
    feeCents: r.feeCents,
    currency: r.currency,
    status: (r.status as any) || "succeeded",
    createdAt: r.createdAt.toISOString(),
    order: {
      id: r.orderId ?? 0,
      buyerName: r.buyerName || "Guest",
      buyerEmail: r.buyerEmail || "unknown",
      productTitle: r.productTitle || "Digital Product",
    },
  }));

  // Load Coupons
  const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  const initialCoupons: CouponItem[] = allCoupons.map((c) => ({
    id: c.id,
    code: c.code,
    discountType: c.discountType as any,
    discountValue: c.discountValue,
    minSpendCents: c.minSpendCents,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  }));

  // Load Digital Files
  const fileRows = await db
    .select({
      id: digitalFiles.id,
      productId: digitalFiles.productId,
      fileName: digitalFiles.fileName,
      fileFormat: digitalFiles.fileFormat,
      fileSizeMb: digitalFiles.fileSizeMb,
      version: digitalFiles.version,
      sha256Checksum: digitalFiles.sha256Checksum,
      storagePath: digitalFiles.storagePath,
      downloadCount: digitalFiles.downloadCount,
      createdAt: digitalFiles.createdAt,
      productTitle: products.title,
    })
    .from(digitalFiles)
    .leftJoin(products, eq(digitalFiles.productId, products.id))
    .orderBy(desc(digitalFiles.createdAt));

  const initialDigitalFiles: DigitalFileItem[] = fileRows.map((f) => ({
    ...f,
    productTitle: f.productTitle || "Standalone Asset",
    createdAt: f.createdAt.toISOString(),
  }));

  // Load Downloads
  const downloadRows = await db
    .select({
      id: downloads.id,
      orderId: downloads.orderId,
      productId: downloads.productId,
      buyerEmail: downloads.buyerEmail,
      ipAddress: downloads.ipAddress,
      downloadToken: downloads.downloadToken,
      status: downloads.status,
      downloadCount: downloads.downloadCount,
      downloadedAt: downloads.downloadedAt,
      productTitle: products.title,
    })
    .from(downloads)
    .leftJoin(products, eq(downloads.productId, products.id))
    .orderBy(desc(downloads.downloadedAt));

  const initialDownloads: DownloadItem[] = downloadRows.map((d) => ({
    id: d.id,
    orderId: d.orderId ?? 0,
    productId: d.productId ?? 0,
    buyerEmail: d.buyerEmail,
    ipAddress: d.ipAddress,
    downloadToken: d.downloadToken,
    status: (d.status as any) || "active",
    downloadCount: d.downloadCount,
    productTitle: d.productTitle || "Digital Product",
    downloadedAt: d.downloadedAt.toISOString(),
  }));

  // Load Reviews
  const reviewRows = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      authorName: reviews.authorName,
      rating: reviews.rating,
      comment: reviews.comment,
      status: reviews.status,
      adminReply: reviews.adminReply,
      createdAt: reviews.createdAt,
      productTitle: products.title,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .orderBy(desc(reviews.createdAt));

  const initialReviews: ReviewItem[] = reviewRows.map((r) => ({
    id: r.id,
    productId: r.productId ?? 0,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    status: (r.status as any) || "approved",
    adminReply: r.adminReply,
    productTitle: r.productTitle || "Digital Product",
    createdAt: r.createdAt.toISOString(),
  }));

  // Load Banners
  const bannerRow = await db.query.homepageBanners.findFirst({
    orderBy: desc(homepageBanners.id),
  });
  const initialBanner: HomepageBannerConfig | null = bannerRow
    ? {
        id: bannerRow.id,
        announcementText: bannerRow.announcementText,
        promoCode: bannerRow.promoCode,
        heroTitle: bannerRow.heroTitle,
        heroSubtitle: bannerRow.heroSubtitle,
        heroCtaText: bannerRow.heroCtaText,
        heroImage: bannerRow.heroImage,
        isBannerActive: bannerRow.isBannerActive,
        updatedAt: bannerRow.updatedAt.toISOString(),
      }
    : null;

  // Load Email Logs
  const emailRows = await db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt));
  const initialEmailLogs: EmailLogItem[] = emailRows.map((e) => ({
    id: e.id,
    type: e.type as any,
    subject: e.subject,
    recipient: e.recipient,
    status: e.status as any,
    previewContent: e.previewContent,
    sentAt: e.sentAt.toISOString(),
  }));

  // Load Admin Users & Audits
  const staffRows = await db
    .select()
    .from(users)
    .where(ne(users.role, "buyer"))
    .orderBy(desc(users.createdAt));

  const initialAdminUsers: AdminUserItem[] = staffRows.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role as any,
    permissions: s.permissions,
    avatarUrl: s.avatarUrl,
    lastLoginAt: s.lastLoginAt ? s.lastLoginAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
  }));

  const auditRows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(30);
  const initialAuditLogs: AuditLogItem[] = auditRows.map((a) => ({
    id: a.id,
    adminEmail: a.adminEmail,
    action: a.action,
    entity: a.entity,
    details: a.details,
    createdAt: a.createdAt.toISOString(),
  }));

  // Load Settings
  const allSettings = await db.select().from(settings);
  const initialSettingsMap: Record<string, string> = {};
  allSettings.forEach((s) => {
    initialSettingsMap[s.key] = s.value;
  });

  // Load Media library (metadata only)
  const mediaRows = await db
    .select({
      id: media.id,
      fileName: media.fileName,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      width: media.width,
      height: media.height,
      createdAt: media.createdAt,
    })
    .from(media)
    .orderBy(desc(media.createdAt));
  const initialMedia: MediaItem[] = mediaRows.map((m) => ({
    ...m,
    url: `/api/media/${m.id}`,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <AdminControlPanel
      initialSession={userSession}
      initialMedia={initialMedia}
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialOrders={initialOrders}
      initialPayments={initialPayments}
      initialCoupons={initialCoupons}
      initialDigitalFiles={initialDigitalFiles}
      initialDownloads={initialDownloads}
      initialReviews={initialReviews}
      initialBanner={initialBanner}
      initialEmailLogs={initialEmailLogs}
      initialAdminUsers={initialAdminUsers}
      initialAuditLogs={initialAuditLogs}
      initialSettings={initialSettingsMap}
    />
  );
}

const emptyAdminData = {
  initialSession: null,
  initialProducts: [],
  initialCategories: [],
  initialOrders: [],
  initialPayments: [],
  initialCoupons: [],
  initialDigitalFiles: [],
  initialDownloads: [],
  initialReviews: [],
  initialBanner: null,
  initialEmailLogs: [],
  initialAdminUsers: [],
  initialAuditLogs: [],
  initialSettings: {},
  initialMedia: [],
};
