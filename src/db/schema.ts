import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("buyer"),
  permissions: text("permissions").notNull().default("all"),
  avatarUrl: text("avatar_url").notNull().default(""),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  coverImage: text("cover_image"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  category: text("category").notNull(), // 'Automation Tools' | 'Workflows' | 'E-Books' | 'Doc Templates' | 'Preset Kits' | 'Workflow Packs' | 'Digital Packs'
  fileFormat: text("file_format").notNull(), // e.g., '.JSON, .PDF'
  fileSizeMb: text("file_size_mb").notNull(), // e.g., '48.5 MB'
  version: text("version").notNull().default("v1.0.0"),
  coverImage: text("cover_image").notNull(),
  previewUrl: text("preview_url").notNull().default("https://atelierfoundry.io/preview"),
  status: text("status").notNull().default("published"), // 'published' | 'draft' | 'archived'
  salesCount: integer("sales_count").notNull().default(0),
  creatorId: integer("creator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  buyerEmail: text("buyer_email").notNull(),
  buyerName: text("buyer_name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  licenseKey: text("license_key").notNull().unique(), // e.g., 'OTOPZ-982F-441A-89BC'
  status: text("status").notNull().default("completed"), // 'completed' | 'refunded'
  couponCode: text("coupon_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  status: text("status").notNull().default("approved"),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  transactionId: text("transaction_id").notNull().unique(),
  gateway: text("gateway").notNull().default("Manual"),
  amountCents: integer("amount_cents").notNull(),
  feeCents: integer("fee_cents").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("succeeded"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull().default("percent"),
  discountValue: integer("discount_value").notNull(),
  minSpendCents: integer("min_spend_cents").notNull().default(0),
  maxUses: integer("max_uses").notNull().default(100),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const digitalFiles = pgTable("digital_files", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileFormat: text("file_format").notNull(),
  fileSizeMb: text("file_size_mb").notNull(),
  version: text("version").notNull().default("1.0.0"),
  sha256Checksum: text("sha256_checksum").notNull(),
  storagePath: text("storage_path").notNull(),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  buyerEmail: text("buyer_email").notNull(),
  ipAddress: text("ip_address").notNull().default("127.0.0.1"),
  downloadToken: text("download_token").notNull().unique(),
  status: text("status").notNull().default("active"),
  downloadCount: integer("download_count").notNull().default(1),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
});

export const homepageBanners = pgTable("homepage_banners", {
  id: serial("id").primaryKey(),
  announcementText: text("announcement_text").notNull(),
  promoCode: text("promo_code").notNull().default("OTOPZ20"),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  heroCtaText: text("hero_cta_text").notNull().default("EXPLORE CATALOG"),
  heroImage: text("hero_image").notNull().default("/images/hero-model.jpg"),
  isBannerActive: boolean("is_banner_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  recipient: text("recipient").notNull(),
  status: text("status").notNull().default("queued"),
  previewContent: text("preview_content"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
