"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
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
  CustomerItem,
  MediaItem,
  UserSession,
} from "@/types/admin";

export type AdminSection =
  | "dashboard"
  | "reports"
  | "products"
  | "categories"
  | "media"
  | "orders"
  | "customers"
  | "payments"
  | "coupons"
  | "digital_files"
  | "downloads"
  | "reviews"
  | "banners"
  | "notifications"
  | "admin_users"
  | "settings";

export type ToastTone = "success" | "error" | "info";

export interface AdminInitialData {
  initialSession: UserSession | null;
  initialProducts: ProductItem[];
  initialCategories: CategoryItem[];
  initialOrders: OrderItem[];
  initialPayments: PaymentItem[];
  initialCoupons: CouponItem[];
  initialDigitalFiles: DigitalFileItem[];
  initialDownloads: DownloadItem[];
  initialReviews: ReviewItem[];
  initialBanner: HomepageBannerConfig | null;
  initialEmailLogs: EmailLogItem[];
  initialAdminUsers: AdminUserItem[];
  initialAuditLogs: AuditLogItem[];
  initialSettings: Record<string, string>;
  initialMedia?: MediaItem[];
}

interface AdminStore {
  /* session */
  session: UserSession | null;
  setSession: (u: UserSession | null) => void;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;

  /* ui */
  activeTab: AdminSection;
  setActiveTab: (t: AdminSection) => void;
  toast: { msg: string; tone: ToastTone } | null;
  showToast: (msg: string, tone?: ToastTone) => void;
  copiedKey: string | null;
  copy: (text: string, label?: string) => void;
  isRefreshing: boolean;
  reloadAll: () => Promise<void>;
  busy: boolean;

  /* data */
  products: ProductItem[];
  categoriesList: CategoryItem[];
  orders: OrderItem[];
  payments: PaymentItem[];
  couponsList: CouponItem[];
  digitalFilesList: DigitalFileItem[];
  downloadsList: DownloadItem[];
  reviewsList: ReviewItem[];
  bannerConfig: HomepageBannerConfig | null;
  setBannerConfig: React.Dispatch<React.SetStateAction<HomepageBannerConfig | null>>;
  emailLogsList: EmailLogItem[];
  adminUsersList: AdminUserItem[];
  auditLogsList: AuditLogItem[];
  settingsState: Record<string, string>;
  setSettingsState: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mediaList: MediaItem[];
  addMedia: (m: MediaItem) => void;
  deleteMedia: (id: number) => Promise<void>;
  refreshMedia: () => Promise<void>;

  /* derived */
  customerList: CustomerItem[];
  completedOrders: OrderItem[];
  refundedOrders: OrderItem[];
  grossRevenueCents: number;
  refundedRevenueCents: number;
  netRevenueCents: number;
  totalFeesCents: number;
  avgOrderValueCents: number;

  /* actions: products */
  deleteProduct: (id: number) => Promise<void>;
  setProductStatus: (id: number, status: "published" | "draft" | "archived") => Promise<void>;
  bulkProductStatus: (ids: number[], status: "published" | "draft" | "archived") => Promise<void>;
  bulkDeleteProducts: (ids: number[]) => Promise<void>;

  /* actions: categories */
  saveCategory: (
    payload: { name: string; description: string; coverImage: string; displayOrder: number },
    editingId?: number
  ) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<void>;
  toggleCategory: (cat: CategoryItem) => Promise<void>;

  /* actions: coupons */
  saveCoupon: (payload: {
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    minSpendCents: number;
    maxUses: number;
  }) => Promise<boolean>;
  toggleCoupon: (c: CouponItem) => Promise<void>;
  deleteCoupon: (id: number) => Promise<void>;

  /* actions: digital files */
  saveDigitalFile: (payload: {
    fileName: string;
    fileFormat: string;
    fileSizeMb: string;
    version: string;
    productId: number | null;
  }) => Promise<boolean>;
  recalcChecksum: (id: number) => Promise<void>;

  /* actions: downloads */
  toggleDownloadStatus: (id: number, current: string) => Promise<void>;
  regenerateDownloadToken: (id: number) => Promise<void>;

  /* actions: orders */
  toggleOrderStatus: (id: number, current: string) => Promise<void>;
  reissueLicense: (id: number) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;

  /* actions: reviews */
  updateReviewStatus: (id: number, status: "approved" | "flagged" | "pending") => Promise<void>;
  replyToReview: (id: number, reply: string) => Promise<boolean>;
  deleteReview: (id: number) => Promise<void>;

  /* actions: banners / emails / admins / settings */
  saveBanner: (cfg: HomepageBannerConfig) => Promise<void>;
  sendEmail: (payload: {
    recipient: string;
    subject: string;
    type: string;
    previewContent: string;
  }) => Promise<boolean>;
  inviteAdmin: (payload: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => Promise<boolean>;
  deleteAdmin: (id: number) => Promise<void>;
  saveSettings: (data: Record<string, string>) => Promise<void>;

  /* sandbox tools */
  simulateOrder: () => Promise<void>;
  reseedDatabase: () => Promise<void>;
  exportCSV: (filename: string, headers: string[], rows: (string | number)[][]) => void;
  exportBackup: () => void;
}

const Ctx = createContext<AdminStore | null>(null);

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

export function AdminProvider({
  data,
  children,
}: {
  data: AdminInitialData;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<UserSession | null>(data.initialSession);
  const [activeTab, setActiveTab] = useState<AdminSection>("dashboard");

  const [products, setProducts] = useState<ProductItem[]>(data.initialProducts);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(data.initialCategories);
  const [orders, setOrders] = useState<OrderItem[]>(data.initialOrders);
  const [payments, setPayments] = useState<PaymentItem[]>(data.initialPayments);
  const [couponsList, setCouponsList] = useState<CouponItem[]>(data.initialCoupons);
  const [digitalFilesList, setDigitalFilesList] = useState<DigitalFileItem[]>(data.initialDigitalFiles);
  const [downloadsList, setDownloadsList] = useState<DownloadItem[]>(data.initialDownloads);
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(data.initialReviews);
  const [bannerConfig, setBannerConfig] = useState<HomepageBannerConfig | null>(data.initialBanner);
  const [emailLogsList, setEmailLogsList] = useState<EmailLogItem[]>(data.initialEmailLogs);
  const [adminUsersList, setAdminUsersList] = useState<AdminUserItem[]>(data.initialAdminUsers);
  const [auditLogsList, setAuditLogsList] = useState<AuditLogItem[]>(data.initialAuditLogs);
  const [settingsState, setSettingsState] = useState<Record<string, string>>(data.initialSettings);
  const [mediaList, setMediaList] = useState<MediaItem[]>(data.initialMedia ?? []);

  const [toast, setToast] = useState<{ msg: string; tone: ToastTone } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const showToast = useCallback((msg: string, tone: ToastTone = "success") => {
    setToast({ msg, tone });
    window.setTimeout(() => setToast((c) => (c && c.msg === msg ? null : c)), 3600);
  }, []);

  const copy = useCallback(
    (text: string, label = "Value") => {
      navigator.clipboard?.writeText(text);
      setCopiedKey(text);
      showToast(`${label} copied to clipboard`, "info");
      window.setTimeout(() => setCopiedKey((c) => (c === text ? null : c)), 2000);
    },
    [showToast]
  );

  const reloadAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const endpoints = [
        "/api/products?includeAll=true",
        "/api/admin/categories",
        "/api/orders",
        "/api/admin/payments",
        "/api/admin/coupons",
        "/api/admin/digital-files",
        "/api/admin/downloads",
        "/api/reviews",
        "/api/admin/banners",
        "/api/admin/notifications",
        "/api/admin/users",
        "/api/admin/settings",
        "/api/admin/media",
      ];
      const results = await Promise.all(endpoints.map((u) => fetch(u).then((r) => r.json())));
      const [p, c, o, pay, coup, df, d, r, b, e, u, s, m] = results;

      if (p?.ok && p.products) setProducts(p.products);
      if (c?.ok && c.categories) setCategoriesList(c.categories);
      if (o?.ok && o.orders) setOrders(o.orders);
      if (pay?.ok && pay.payments) setPayments(pay.payments);
      if (coup?.ok && coup.coupons) setCouponsList(coup.coupons);
      if (df?.ok && df.digitalFiles) setDigitalFilesList(df.digitalFiles);
      if (d?.ok && d.downloads) setDownloadsList(d.downloads);
      if (r?.ok && r.reviews) setReviewsList(r.reviews);
      if (b?.ok && b.banner) setBannerConfig(b.banner);
      if (e?.ok && e.emailLogs) setEmailLogsList(e.emailLogs);
      if (u?.ok && u.users) {
        setAdminUsersList(u.users);
        if (u.auditLogs) setAuditLogsList(u.auditLogs);
      }
      if (s?.ok && s.settings) setSettingsState(s.settings);
      if (m?.ok && m.media) setMediaList(m.media);
    } catch {
      showToast("Could not sync with the server", "error");
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  /* ------------------------- helpers ------------------------- */
  const api = useCallback(
    async (
      url: string,
      options?: RequestInit & { body?: BodyInit | null }
    ): Promise<Record<string, unknown> | null> => {
      setBusy(true);
      try {
        const res = await fetch(url, options);
        return (await res.json()) as Record<string, unknown>;
      } catch {
        showToast("Network error — please retry", "error");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [showToast]
  );

  const json = (body: unknown): RequestInit => ({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const patch = (body: unknown): RequestInit => ({
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  /* ------------------------- auth ------------------------- */
  const login = useCallback(
    async (email: string, password: string) => {
      const data2 = await api("/api/admin/auth", json({ email, password }));
      if (data2?.ok && data2.user) {
        setSession(data2.user as UserSession);
        showToast(`Welcome back, ${(data2.user as UserSession).name.split(" ")[0]}`);
        reloadAll();
        return null;
      }
      return (data2?.error as string) || "Invalid admin credentials";
    },
    [api, reloadAll, showToast]
  );

  const logout = useCallback(async () => {
    await api("/api/admin/auth", json({ action: "logout" }));
    setSession(null);
    showToast("Signed out of the admin panel", "info");
  }, [api, showToast]);

  /* ------------------------- derived ------------------------- */
  const customerList = useMemo<CustomerItem[]>(() => {
    const map = new Map<string, CustomerItem>();
    orders.forEach((ord) => {
      const email = ord.buyerEmail.toLowerCase();
      const ex = map.get(email);
      if (!ex) {
        map.set(email, {
          email,
          name: ord.buyerName,
          ordersCount: 1,
          completedCount: ord.status === "completed" ? 1 : 0,
          totalSpentCents: ord.status === "completed" ? ord.amountCents : 0,
          licenses: [ord.licenseKey],
          status: ord.status === "refunded" ? "flagged" : "active",
          firstOrderDate: ord.createdAt,
          lastOrderDate: ord.createdAt,
          orders: [ord],
        });
      } else {
        ex.ordersCount += 1;
        if (ord.status === "completed") {
          ex.completedCount += 1;
          ex.totalSpentCents += ord.amountCents;
        }
        if (ord.status === "refunded") ex.status = "flagged";
        ex.licenses.push(ord.licenseKey);
        ex.orders.push(ord);
        if (new Date(ord.createdAt) < new Date(ex.firstOrderDate)) ex.firstOrderDate = ord.createdAt;
        if (new Date(ord.createdAt) > new Date(ex.lastOrderDate)) ex.lastOrderDate = ord.createdAt;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpentCents - a.totalSpentCents);
  }, [orders]);

  const completedOrders = useMemo(() => orders.filter((o) => o.status === "completed"), [orders]);
  const refundedOrders = useMemo(() => orders.filter((o) => o.status === "refunded"), [orders]);
  const grossRevenueCents = useMemo(
    () => completedOrders.reduce((s, o) => s + o.amountCents, 0),
    [completedOrders]
  );
  const refundedRevenueCents = useMemo(
    () => refundedOrders.reduce((s, o) => s + o.amountCents, 0),
    [refundedOrders]
  );
  const totalFeesCents = useMemo(
    () => payments.filter((p) => p.status === "succeeded").reduce((s, p) => s + p.feeCents, 0),
    [payments]
  );
  const netRevenueCents = grossRevenueCents - totalFeesCents;
  const avgOrderValueCents =
    completedOrders.length > 0 ? Math.round(grossRevenueCents / completedOrders.length) : 0;

  /* ------------------------- products ------------------------- */
  const deleteProduct = useCallback(
    async (id: number) => {
      const res = await api(`/api/products/${id}`, { method: "DELETE" });
      if (res?.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast("Product deleted");
      } else showToast("Could not delete product", "error");
    },
    [api, showToast]
  );

  const setProductStatus = useCallback(
    async (id: number, status: "published" | "draft" | "archived") => {
      const res = await api(`/api/products/${id}`, patch({ status }));
      if (res?.ok) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
        showToast(`Product set to ${status}`);
      } else showToast("Could not update status", "error");
    },
    [api, showToast]
  );

  const bulkProductStatus = useCallback(
    async (ids: number[], status: "published" | "draft" | "archived") => {
      const res = await api("/api/admin/actions", json({ action: "bulk_status", ids, status }));
      if (res?.ok) {
        setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p)));
        showToast(`${ids.length} product(s) set to ${status}`);
      } else showToast("Bulk update failed", "error");
    },
    [api, showToast]
  );

  const bulkDeleteProducts = useCallback(
    async (ids: number[]) => {
      const res = await api("/api/admin/actions", json({ action: "bulk_delete", ids }));
      if (res?.ok) {
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
        showToast(`${ids.length} product(s) deleted`);
      } else showToast("Bulk delete failed", "error");
    },
    [api, showToast]
  );

  /* ------------------------- categories ------------------------- */
  const saveCategory = useCallback(
    async (
      payload: { name: string; description: string; coverImage: string; displayOrder: number },
      editingId?: number
    ) => {
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const res = await api(url, editingId ? patch(payload) : json(payload));
      if (res?.ok) {
        showToast(editingId ? "Category updated" : "Category created");
        reloadAll();
        return true;
      }
      showToast((res?.error as string) || "Could not save category", "error");
      return false;
    },
    [api, reloadAll, showToast]
  );

  const deleteCategory = useCallback(
    async (id: number) => {
      const res = await api(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res?.ok) {
        setCategoriesList((prev) => prev.filter((c) => c.id !== id));
        showToast("Category removed");
      } else showToast("Could not delete category", "error");
    },
    [api, showToast]
  );

  const toggleCategory = useCallback(
    async (cat: CategoryItem) => {
      const res = await api(`/api/admin/categories/${cat.id}`, patch({ isActive: !cat.isActive }));
      if (res?.ok) {
        setCategoriesList((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: !cat.isActive } : c))
        );
        showToast(`${cat.name} ${!cat.isActive ? "activated" : "hidden"}`);
      } else showToast("Could not update category", "error");
    },
    [api, showToast]
  );

  /* ------------------------- coupons ------------------------- */
  const saveCoupon = useCallback(
    async (payload: {
      code: string;
      discountType: "percent" | "fixed";
      discountValue: number;
      minSpendCents: number;
      maxUses: number;
    }) => {
      const res = await api("/api/admin/coupons", json(payload));
      if (res?.ok) {
        showToast("Coupon created");
        reloadAll();
        return true;
      }
      showToast((res?.error as string) || "Could not create coupon", "error");
      return false;
    },
    [api, reloadAll, showToast]
  );

  const toggleCoupon = useCallback(
    async (c: CouponItem) => {
      const res = await api(`/api/admin/coupons/${c.id}`, patch({ isActive: !c.isActive }));
      if (res?.ok) {
        setCouponsList((prev) =>
          prev.map((x) => (x.id === c.id ? { ...x, isActive: !c.isActive } : x))
        );
        showToast(`${c.code} ${!c.isActive ? "activated" : "paused"}`);
      } else showToast("Could not update coupon", "error");
    },
    [api, showToast]
  );

  const deleteCoupon = useCallback(
    async (id: number) => {
      const res = await api(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res?.ok) {
        setCouponsList((prev) => prev.filter((c) => c.id !== id));
        showToast("Coupon deleted");
      } else showToast("Could not delete coupon", "error");
    },
    [api, showToast]
  );

  /* ------------------------- digital files ------------------------- */
  const saveDigitalFile = useCallback(
    async (payload: {
      fileName: string;
      fileFormat: string;
      fileSizeMb: string;
      version: string;
      productId: number | null;
    }) => {
      const res = await api("/api/admin/digital-files", json(payload));
      if (res?.ok) {
        showToast("File registered with SHA-256 checksum");
        reloadAll();
        return true;
      }
      showToast((res?.error as string) || "Could not register file", "error");
      return false;
    },
    [api, reloadAll, showToast]
  );

  const recalcChecksum = useCallback(
    async (id: number) => {
      const res = await api(`/api/admin/digital-files/${id}`, patch({ recalculateChecksum: true }));
      if (res?.ok) {
        showToast("Checksum re-verified");
        reloadAll();
      } else showToast("Could not verify checksum", "error");
    },
    [api, reloadAll, showToast]
  );

  /* ------------------------- downloads ------------------------- */
  const toggleDownloadStatus = useCallback(
    async (id: number, current: string) => {
      const next = current === "active" ? "revoked" : "active";
      const res = await api(`/api/admin/downloads/${id}`, patch({ status: next }));
      if (res?.ok) {
        setDownloadsList((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: next as "active" | "revoked" } : d))
        );
        showToast(`Download access ${next}`);
      } else showToast("Could not update access", "error");
    },
    [api, showToast]
  );

  const regenerateDownloadToken = useCallback(
    async (id: number) => {
      const res = await api(`/api/admin/downloads/${id}`, patch({ regenerateToken: true }));
      if (res?.ok) {
        showToast("New download token issued");
        reloadAll();
      } else showToast("Could not reissue token", "error");
    },
    [api, reloadAll, showToast]
  );

  /* ------------------------- orders ------------------------- */
  const toggleOrderStatus = useCallback(
    async (id: number, current: string) => {
      const next = current === "completed" ? "refunded" : "completed";
      const res = await api(`/api/orders/${id}`, patch({ status: next }));
      if (res?.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: next as OrderItem["status"] } : o))
        );
        showToast(`Order #${id} marked ${next}`);
        reloadAll();
      } else showToast("Could not update order", "error");
    },
    [api, reloadAll, showToast]
  );

  const reissueLicense = useCallback(
    async (id: number) => {
      const res = await api(`/api/orders/${id}`, patch({ regenerateLicense: true }));
      const order = res?.order as { licenseKey?: string } | undefined;
      if (res?.ok && order?.licenseKey) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, licenseKey: order.licenseKey as string } : o))
        );
        showToast(`New license key issued: ${order.licenseKey}`);
      } else showToast("Could not reissue license", "error");
    },
    [api, showToast]
  );

  const deleteOrder = useCallback(
    async (id: number) => {
      const res = await api(`/api/orders/${id}`, { method: "DELETE" });
      if (res?.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        showToast(`Order #${id} revoked`);
      } else showToast("Could not revoke order", "error");
    },
    [api, showToast]
  );

  /* ------------------------- reviews ------------------------- */
  const updateReviewStatus = useCallback(
    async (id: number, status: "approved" | "flagged" | "pending") => {
      const res = await api(`/api/reviews/${id}`, patch({ status }));
      if (res?.ok) {
        setReviewsList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        showToast(`Review marked ${status}`);
      } else showToast("Could not update review", "error");
    },
    [api, showToast]
  );

  const replyToReview = useCallback(
    async (id: number, reply: string) => {
      const res = await api(`/api/reviews/${id}`, patch({ adminReply: reply }));
      if (res?.ok) {
        setReviewsList((prev) => prev.map((r) => (r.id === id ? { ...r, adminReply: reply } : r)));
        showToast("Reply published");
        return true;
      }
      showToast("Could not publish reply", "error");
      return false;
    },
    [api, showToast]
  );

  const deleteReview = useCallback(
    async (id: number) => {
      const res = await api(`/api/reviews/${id}`, { method: "DELETE" });
      if (res?.ok) {
        setReviewsList((prev) => prev.filter((r) => r.id !== id));
        showToast("Review deleted");
      } else showToast("Could not delete review", "error");
    },
    [api, showToast]
  );

  /* ------------------------- banners / email / admins / settings ------------------------- */
  const saveBanner = useCallback(
    async (cfg: HomepageBannerConfig) => {
      const res = await api("/api/admin/banners", json(cfg));
      if (res?.ok) {
        showToast("Homepage configuration saved");
        reloadAll();
      } else showToast("Could not save homepage config", "error");
    },
    [api, reloadAll, showToast]
  );

  const sendEmail = useCallback(
    async (payload: { recipient: string; subject: string; type: string; previewContent: string }) => {
      const res = await api("/api/admin/notifications", json(payload));
      if (res?.ok) {
        showToast(`Email dispatched to ${payload.recipient}`);
        reloadAll();
        return true;
      }
      showToast("Could not send email", "error");
      return false;
    },
    [api, reloadAll, showToast]
  );

  const inviteAdmin = useCallback(
    async (payload: { name: string; email: string; role: string; password: string }) => {
      const res = await api("/api/admin/users", json(payload));
      if (res?.ok) {
        showToast(`${payload.name} added to the team`);
        reloadAll();
        return true;
      }
      showToast((res?.error as string) || "Could not invite admin", "error");
      return false;
    },
    [api, reloadAll, showToast]
  );

  const deleteAdmin = useCallback(
    async (id: number) => {
      const res = await api(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res?.ok) {
        setAdminUsersList((prev) => prev.filter((u) => u.id !== id));
        showToast("Admin access revoked");
      } else showToast("Could not revoke access", "error");
    },
    [api, showToast]
  );

  const saveSettings = useCallback(
    async (dataIn: Record<string, string>) => {
      const res = await api("/api/admin/settings", json(dataIn));
      if (res?.ok) {
        setSettingsState((res.settings as Record<string, string>) || dataIn);
        showToast("Store settings saved");
      } else showToast("Could not save settings", "error");
    },
    [api, showToast]
  );

  /* ------------------------- media ------------------------- */
  const addMedia = useCallback((m: MediaItem) => {
    setMediaList((prev) => [m, ...prev.filter((x) => x.id !== m.id)]);
  }, []);

  const refreshMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      const d = await res.json();
      if (d.ok && d.media) setMediaList(d.media);
    } catch {
      /* ignore */
    }
  }, []);

  const deleteMedia = useCallback(
    async (id: number) => {
      const res = await api(`/api/admin/media/${id}`, { method: "DELETE" });
      if (res?.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
        showToast("Image deleted");
      } else showToast("Could not delete image", "error");
    },
    [api, showToast]
  );

  /* ------------------------- sandbox tools ------------------------- */
  const simulateOrder = useCallback(async () => {
    const res = await api("/api/admin/actions", json({ action: "create_test_order" }));
    if (res?.ok) {
      showToast("Simulated order created");
      reloadAll();
    } else showToast("Could not simulate order", "error");
  }, [api, reloadAll, showToast]);

  const reseedDatabase = useCallback(async () => {
    const res = await api("/api/admin/actions", json({ action: "reset_seed" }));
    if (res?.ok) {
      showToast("Database restored to baseline");
      reloadAll();
    } else showToast("Could not reseed database", "error");
  }, [api, reloadAll, showToast]);

  const exportCSV = useCallback(
    (filename: string, headers: string[], rows: (string | number)[][]) => {
      const content = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`${filename} exported`);
    },
    [showToast]
  );

  const exportBackup = useCallback(() => {
    const backup = {
      exportedAt: new Date().toISOString(),
      products,
      categories: categoriesList,
      orders,
      payments,
      coupons: couponsList,
      digitalFiles: digitalFilesList,
      downloads: downloadsList,
      reviews: reviewsList,
      banner: bannerConfig,
      settings: settingsState,
      adminUsers: adminUsersList,
      media: mediaList,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `otopz-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Full store backup downloaded");
  }, [
    products,
    categoriesList,
    orders,
    payments,
    couponsList,
    digitalFilesList,
    downloadsList,
    reviewsList,
    bannerConfig,
    settingsState,
    adminUsersList,
    mediaList,
    showToast,
  ]);

  const value: AdminStore = {
    session,
    setSession,
    login,
    logout,
    activeTab,
    setActiveTab,
    toast,
    showToast,
    copiedKey,
    copy,
    isRefreshing,
    reloadAll,
    busy,
    products,
    categoriesList,
    orders,
    payments,
    couponsList,
    digitalFilesList,
    downloadsList,
    reviewsList,
    bannerConfig,
    setBannerConfig,
    emailLogsList,
    adminUsersList,
    auditLogsList,
    settingsState,
    setSettingsState,
    mediaList,
    addMedia,
    deleteMedia,
    refreshMedia,
    customerList,
    completedOrders,
    refundedOrders,
    grossRevenueCents,
    refundedRevenueCents,
    netRevenueCents,
    totalFeesCents,
    avgOrderValueCents,
    deleteProduct,
    setProductStatus,
    bulkProductStatus,
    bulkDeleteProducts,
    saveCategory,
    deleteCategory,
    toggleCategory,
    saveCoupon,
    toggleCoupon,
    deleteCoupon,
    saveDigitalFile,
    recalcChecksum,
    toggleDownloadStatus,
    regenerateDownloadToken,
    toggleOrderStatus,
    reissueLicense,
    deleteOrder,
    updateReviewStatus,
    replyToReview,
    deleteReview,
    saveBanner,
    sendEmail,
    inviteAdmin,
    deleteAdmin,
    saveSettings,
    simulateOrder,
    reseedDatabase,
    exportCSV,
    exportBackup,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
