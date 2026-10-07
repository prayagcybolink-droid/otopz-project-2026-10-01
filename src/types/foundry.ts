export interface ReviewItem {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductItem {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  priceCents: number;
  category: string;
  fileFormat: string;
  fileSizeMb: string;
  version: string;
  coverImage: string;
  previewUrl: string;
  status: "published" | "draft" | "archived" | string;
  salesCount: number;
  creatorId: number | null;
  createdAt: string;
  reviewCount: number;
  avgRating: number;
  reviews: ReviewItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  buyerEmail: string;
  buyerName: string;
  amountCents: number;
  licenseKey: string;
  status: "completed" | "refunded" | string;
  createdAt: string;
  productTitle: string;
  productSlug: string;
  productCategory: string;
  productFileFormat: string;
  productFileSizeMb: string;
  productVersion: string;
  productCoverImage: string;
}

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: "creator" | "buyer" | string;
  avatarUrl: string;
}

export type WorkspaceMode = "storefront" | "library" | "creator";
export type CreatorSubTab = "catalog" | "orders" | "analytics";

export const PRODUCT_CATEGORIES = [
  "All",
  "Automation Tools",
  "Workflows",
  "E-Books",
  "Doc Templates",
  "Preset Kits",
  "Workflow Packs",
  "Digital Packs",
] as const;

export const COVER_PRESETS = [
  { label: "Automation — Laptop Workflow", url: "/images/p-automation.jpg" },
  { label: "Automation — Creator at Desk", url: "/images/cat-automation.jpg" },
  { label: "E-Book — Book & Tablet", url: "/images/p-ebook.jpg" },
  { label: "E-Book — Reader Portrait", url: "/images/cat-ebooks.jpg" },
  { label: "Doc Files — Flat Lay", url: "/images/p-docs.jpg" },
  { label: "Presets — Phone & Camera", url: "/images/p-presets.jpg" },
  { label: "Presets — Photographer", url: "/images/cat-presets.jpg" },
  { label: "Workflow — Kanban Desk", url: "/images/p-workflow.jpg" },
  { label: "Digital Pack — Editorial Portrait", url: "/images/new-vibes.jpg" },
];

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
