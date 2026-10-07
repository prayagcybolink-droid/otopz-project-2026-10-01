export type ProductCategory =
  | "Automation Tools"
  | "Workflows"
  | "E-Books"
  | "Doc Templates"
  | "Preset Kits"
  | "Workflow Packs"
  | "Digital Packs";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Automation Tools",
  "Workflows",
  "E-Books",
  "Doc Templates",
  "Preset Kits",
  "Workflow Packs",
  "Digital Packs",
];

export interface CoverPreset {
  id: string;
  label: string;
  path: string;
  categoryTag: string;
}

export const COVER_PRESETS: CoverPreset[] = [
  { id: "hero", label: "Hero Studio Editorial", path: "/images/hero-model.jpg", categoryTag: "Brand" },
  { id: "cat-auto", label: "Dark Architecture / AI", path: "/images/cat-automation.jpg", categoryTag: "Automation" },
  { id: "cat-ebook", label: "Monochrome Editorial", path: "/images/cat-ebooks.jpg", categoryTag: "E-Books" },
  { id: "cat-preset", label: "Studio Portrait Framing", path: "/images/cat-presets.jpg", categoryTag: "Preset Kits" },
  { id: "new-vibes", label: "Minimalist Red Accent", path: "/images/new-vibes.jpg", categoryTag: "Digital Packs" },
  { id: "p-auto", label: "Modular Hardware & Tech", path: "/images/p-automation.jpg", categoryTag: "Automation Tools" },
  { id: "p-ebook", label: "Architectural Book Cover", path: "/images/p-ebook.jpg", categoryTag: "E-Books" },
  { id: "p-docs", label: "Pure Clean Minimal White", path: "/images/p-docs.jpg", categoryTag: "Doc Templates" },
  { id: "p-presets", label: "Moody Film Darkroom", path: "/images/p-presets.jpg", categoryTag: "Preset Kits" },
  { id: "p-workflow", label: "Acoustic / Systems Layout", path: "/images/p-workflow.jpg", categoryTag: "Workflows" },
];

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
}

export interface ReviewItem {
  id: number;
  productId: number;
  productTitle?: string;
  authorName: string;
  rating: number;
  comment: string;
  status?: "approved" | "pending" | "flagged";
  adminReply?: string | null;
  createdAt: string;
}

export interface ProductItem {
  id: number;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  priceCents: number;
  category: string;
  fileFormat: string;
  fileSizeMb: string;
  version: string;
  coverImage: string;
  previewUrl: string | null;
  status: "published" | "draft" | "archived";
  salesCount: number;
  creatorId: number | null;
  createdAt: string;
  avgRating?: number;
  reviewCount?: number;
  reviews?: ReviewItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  buyerEmail: string;
  buyerName: string;
  amountCents: number;
  licenseKey: string;
  status: "completed" | "refunded" | "cancelled";
  couponCode?: string | null;
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
  payment?: PaymentItem;
}

export interface PaymentItem {
  id: number;
  orderId: number;
  transactionId: string;
  gateway: "Stripe" | "PayPal" | "Crypto" | "Manual";
  amountCents: number;
  feeCents: number;
  currency: string;
  status: "succeeded" | "refunded" | "failed";
  createdAt: string;
  order?: {
    id: number;
    buyerName: string;
    buyerEmail: string;
    productTitle?: string;
  };
}

export interface CouponItem {
  id: number;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minSpendCents: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface DigitalFileItem {
  id: number;
  productId: number | null;
  productTitle?: string;
  fileName: string;
  fileFormat: string;
  fileSizeMb: string;
  version: string;
  sha256Checksum: string;
  storagePath: string;
  downloadCount: number;
  createdAt: string;
}

export interface DownloadItem {
  id: number;
  orderId: number;
  productId: number;
  productTitle?: string;
  buyerEmail: string;
  ipAddress: string;
  downloadToken: string;
  status: "active" | "revoked";
  downloadCount: number;
  downloadedAt: string;
}

export interface HomepageBannerConfig {
  id: number;
  announcementText: string;
  promoCode: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroImage: string;
  isBannerActive: boolean;
  updatedAt: string;
}

export interface EmailLogItem {
  id: number;
  type: "order_confirmation" | "license_delivery" | "discount_drop" | "security_alert";
  subject: string;
  recipient: string;
  status: "sent" | "queued" | "failed";
  previewContent: string | null;
  sentAt: string;
}

export interface AuditLogItem {
  id: number;
  adminEmail: string;
  action: string;
  entity: string;
  details: string | null;
  createdAt: string;
}

export interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "product_manager" | "support" | "creator" | "admin" | "buyer";
  permissions: string; // 'all' or JSON string
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CustomerItem {
  email: string;
  name: string;
  ordersCount: number;
  completedCount: number;
  totalSpentCents: number;
  licenses: string[];
  status: "active" | "flagged";
  notes?: string;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: OrderItem[];
}

export interface MediaItem {
  id: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  url: string;
  createdAt: string;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "product_manager" | "support" | "creator" | "admin" | "buyer";
  permissions?: string;
  avatarUrl?: string | null;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
