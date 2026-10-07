"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AdminProvider, AdminInitialData, AdminSection, useAdmin } from "./AdminContext";
import { Avatar, Badge, Btn, Field, IconBtn, Input, cx } from "@/components/ui/kit";
import { DashboardSection, ReportsSection } from "./sections/DashboardSections";
import { ProductsSection, CategoriesSection } from "./sections/CatalogSections";
import {
  OrdersSection,
  CustomersSection,
  PaymentsSection,
  CouponsSection,
} from "./sections/CommerceSections";
import { DigitalFilesSection, DownloadsSection } from "./sections/DeliverySections";
import { ReviewsSection, BannersSection, NotificationsSection } from "./sections/EngagementSections";
import { SettingsSection, AdminUsersSection } from "./sections/SystemSections";
import { MediaSection } from "./sections/MediaSection";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  CreditCard,
  Ticket,
  FileCode,
  DownloadCloud,
  MessageSquare,
  Megaphone,
  Mail,
  Shield,
  Settings as SettingsIcon,
  Images,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock,
  Sparkles,
  ArrowRight,
  Command,
} from "lucide-react";

/* ============================ NAV CONFIG ============================ */
interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ReactNode;
  badge?: (s: ReturnType<typeof useAdmin>) => number | undefined;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-[17px] w-[17px]" /> },
      { id: "reports", label: "Sales reports", icon: <BarChart3 className="h-[17px] w-[17px]" /> },
    ],
  },
  {
    title: "Catalogue",
    items: [
      {
        id: "products",
        label: "Products",
        icon: <Package className="h-[17px] w-[17px]" />,
        badge: (s) => s.products.length,
      },
      {
        id: "categories",
        label: "Categories",
        icon: <FolderTree className="h-[17px] w-[17px]" />,
        badge: (s) => s.categoriesList.length,
      },
      {
        id: "media",
        label: "Media library",
        icon: <Images className="h-[17px] w-[17px]" />,
        badge: (s) => s.mediaList.length,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        id: "orders",
        label: "Orders",
        icon: <ShoppingBag className="h-[17px] w-[17px]" />,
        badge: (s) => s.orders.length,
      },
      {
        id: "customers",
        label: "Customers",
        icon: <Users className="h-[17px] w-[17px]" />,
        badge: (s) => s.customerList.length,
      },
      {
        id: "payments",
        label: "Payments",
        icon: <CreditCard className="h-[17px] w-[17px]" />,
        badge: (s) => s.payments.length,
      },
      {
        id: "coupons",
        label: "Coupons",
        icon: <Ticket className="h-[17px] w-[17px]" />,
        badge: (s) => s.couponsList.filter((c) => c.isActive).length,
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        id: "digital_files",
        label: "Digital files",
        icon: <FileCode className="h-[17px] w-[17px]" />,
        badge: (s) => s.digitalFilesList.length,
      },
      {
        id: "downloads",
        label: "Downloads",
        icon: <DownloadCloud className="h-[17px] w-[17px]" />,
        badge: (s) => s.downloadsList.length,
      },
    ],
  },
  {
    title: "Engagement",
    items: [
      {
        id: "reviews",
        label: "Reviews",
        icon: <MessageSquare className="h-[17px] w-[17px]" />,
        badge: (s) => s.reviewsList.length,
      },
      { id: "banners", label: "Homepage", icon: <Megaphone className="h-[17px] w-[17px]" /> },
      {
        id: "notifications",
        label: "Emails",
        icon: <Mail className="h-[17px] w-[17px]" />,
        badge: (s) => s.emailLogsList.length,
      },
    ],
  },
  {
    title: "System",
    items: [
      { id: "admin_users", label: "Admin users", icon: <Shield className="h-[17px] w-[17px]" /> },
      { id: "settings", label: "Settings", icon: <SettingsIcon className="h-[17px] w-[17px]" /> },
    ],
  },
];

const SECTION_TITLES: Record<AdminSection, string> = {
  dashboard: "Dashboard",
  reports: "Sales reports",
  products: "Products",
  categories: "Categories",
  media: "Media library",
  orders: "Orders",
  customers: "Customers",
  payments: "Payments",
  coupons: "Coupons & discounts",
  digital_files: "Digital files",
  downloads: "Download management",
  reviews: "Reviews",
  banners: "Homepage & banners",
  notifications: "Notifications & emails",
  admin_users: "Admin users & permissions",
  settings: "Store settings",
};

/* ============================ ENTRY ============================ */
export function AdminControlPanel(props: AdminInitialData) {
  return (
    <AdminProvider data={props}>
      <PanelRoot />
    </AdminProvider>
  );
}

function PanelRoot() {
  const store = useAdmin();
  if (!store.session) return <LoginScreen />;
  return <Shell />;
}

/* ============================ LOGIN ============================ */
function LoginScreen() {
  const { login } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await login(email, password);
    setError(err);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f4f4]">
      {/* brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#000000] p-10 lg:flex">
        <div className="grid-dots absolute inset-0 opacity-70" />
        <div
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,.18), transparent 65%)" }}
        />
        <div
          className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,.10), transparent 65%)" }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ffffff] font-display text-sm font-extrabold text-[#000000]">
            O
          </span>
          <span className="font-splatink text-xl tracking-tight text-white">OTOPZ</span>
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
            Admin
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="font-display text-[42px] font-extrabold leading-[1.05] tracking-tight text-white">
            Run the whole
            <br />
            business from
            <br />
            <span className="bg-white px-2 text-black">one console.</span>
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/55">
            Products, orders, payments, coupons, digital delivery, reviews, emails and permissions —
            all in a single, fast control panel.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Dashboard", "Products", "Orders", "Payments", "Coupons", "Files", "Reviews", "Reports"].map((t) => (
              <span
                key={t}
                className="rounded-lg bg-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-white/60 ring-1 ring-inset ring-white/10"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[11px] text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-dot" />
          PostgreSQL connected · SHA-256 license engine active
        </div>
      </div>

      {/* form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="mb-8 lg:hidden">
            <span className="font-splatink text-2xl tracking-tight text-[#000000]">OTOPZ</span>
          </div>

          <div className="mb-7">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#000000] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ffffff]">
              <Lock className="h-3 w-3" /> Secure area
            </span>
            <h2 className="font-display text-[26px] font-extrabold tracking-tight text-[#000000]">
              Sign in to your panel
            </h2>
            <p className="mt-1 text-sm text-[#777777]">Use your staff credentials to continue.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Email address">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@otopz.studio"
                required
                autoComplete="username"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-black p-3 text-xs text-white">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Btn type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
            </Btn>
          </form>

        </div>
      </div>
    </div>
  );
}

/* ============================ SHELL ============================ */
function Shell() {
  const store = useAdmin();
  const { activeTab, setActiveTab, session, logout, reloadAll, isRefreshing } = store;
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setUserMenu(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function selectTab(tab: AdminSection) {
    setActiveTab(tab);
    setMobileNav(false);
  }

  const alerts = useMemo(() => {
    const list: { label: string; tab: AdminSection; tone: "warning" | "danger" | "info" }[] = [];
    const flagged = store.reviewsList.filter((r) => r.status === "flagged").length;
    if (flagged) list.push({ label: `${flagged} review(s) flagged for moderation`, tab: "reviews", tone: "warning" });
    if (store.refundedOrders.length)
      list.push({ label: `${store.refundedOrders.length} refunded order(s)`, tab: "orders", tone: "danger" });
    const revoked = store.downloadsList.filter((d) => d.status === "revoked").length;
    if (revoked) list.push({ label: `${revoked} download link(s) revoked`, tab: "downloads", tone: "info" });
    const drafts = store.products.filter((p) => p.status === "draft").length;
    if (drafts) list.push({ label: `${drafts} product(s) still in draft`, tab: "products", tone: "info" });
    return list;
  }, [store.reviewsList, store.refundedOrders, store.downloadsList, store.products]);

  return (
    <div className="flex min-h-screen bg-[#f4f4f4]">
      {/* ---------- SIDEBAR ---------- */}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#000000] transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "lg:w-[252px]",
          mobileNav ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full"
        )}
      >
        {/* brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] px-4">
          <button onClick={() => selectTab("dashboard")} className="flex items-center gap-2.5 overflow-hidden">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#ffffff] font-display text-sm font-extrabold text-[#000000]">
              O
            </span>
            {!collapsed && (
              <span className="flex flex-col leading-none">
                <span className="font-splatink text-base tracking-tight text-white">OTOPZ</span>
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">
                  Admin panel
                </span>
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileNav(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* nav */}
        <nav className="scroll-dark flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/25">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = activeTab === item.id;
                  const count = item.badge?.(store);
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={cx(
                        "group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition-all duration-150",
                        active
                          ? "bg-white/[0.09] text-white"
                          : "text-white/55 hover:bg-white/[0.05] hover:text-white",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#ffffff]" />
                      )}
                      <span className={cx("shrink-0", active ? "text-[#ffffff]" : "")}>{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate text-left">{item.label}</span>
                          {typeof count === "number" && count > 0 && (
                            <span
                              className={cx(
                                "tabular shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                                active ? "bg-[#ffffff] text-[#000000]" : "bg-white/10 text-white/50"
                              )}
                            >
                              {count}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* user card */}
        <div className="shrink-0 border-t border-white/[0.07] p-3">
          {!collapsed ? (
            <div className="rounded-xl bg-white/[0.05] p-3">
              <div className="flex items-center gap-2.5">
                <Avatar name={session?.name ?? "Admin"} src={session?.avatarUrl} size={34} ring={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-white">{session?.name}</p>
                  <p className="truncate text-[10px] capitalize text-white/40">
                    {session?.role?.replace("_", " ")}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white hover:text-black"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={logout} className="grid h-9 w-full place-items-center rounded-xl text-white/40 hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="mt-2 hidden h-8 w-full items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold text-white/35 transition-colors hover:bg-white/[0.05] hover:text-white/70 lg:flex"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <><ChevronLeft className="h-3.5 w-3.5" /> Collapse</>}
          </button>
        </div>
      </aside>

      {mobileNav && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileNav(false)} />
      )}

      {/* ---------- MAIN ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* topbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#e5e5e5] bg-[#f4f4f4]/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileNav(true)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#000000] ring-1 ring-inset ring-[#e5e5e5] lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a3a3a3] sm:block">
                OTOPZ Admin
              </p>
              <h2 className="truncate font-display text-[15px] font-bold text-[#000000]">
                {SECTION_TITLES[activeTab]}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-xl border border-[#e0e0e0] bg-white px-3 text-xs text-[#9a9a9a] transition-colors hover:border-[#bdbdbd] hover:text-[#000000] md:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="pr-6">Search anything…</span>
              <kbd className="flex items-center gap-0.5 rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[10px] font-semibold text-[#858585]">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            <button
              onClick={() => setPaletteOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#666666] ring-1 ring-inset ring-[#e5e5e5] hover:text-[#000000] md:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            <NotificationBell alerts={alerts} onJump={selectTab} />

            <IconBtn title="Refresh data" onClick={reloadAll} disabled={isRefreshing}>
              <RefreshCw className={cx("h-4 w-4", isRefreshing && "animate-spin")} />
            </IconBtn>

            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 rounded-xl bg-white py-1 pl-1 pr-2.5 ring-1 ring-inset ring-[#e5e5e5] transition-colors hover:ring-[#bdbdbd]"
              >
                <Avatar name={session?.name ?? "Admin"} src={session?.avatarUrl} size={28} ring={false} />
                <span className="hidden text-left sm:block">
                  <span className="block text-[11px] font-bold leading-tight text-[#000000]">
                    {session?.name?.split(" ")[0]}
                  </span>
                  <span className="block text-[9px] capitalize leading-tight text-[#9a9a9a]">
                    {session?.role?.replace("_", " ")}
                  </span>
                </span>
              </button>

              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_20px_50px_rgba(16,16,20,.16)] animate-scale-in">
                    <div className="flex items-center gap-3 border-b border-[#ececec] p-4">
                      <Avatar name={session?.name ?? "Admin"} src={session?.avatarUrl} size={38} ring={false} />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-[#000000]">{session?.name}</p>
                        <p className="truncate text-[11px] text-[#9a9a9a]">{session?.email}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <MenuRow icon={<Shield className="h-4 w-4" />} label="Admin users" onClick={() => { setActiveTab("admin_users"); setUserMenu(false); }} />
                      <MenuRow icon={<SettingsIcon className="h-4 w-4" />} label="Store settings" onClick={() => { setActiveTab("settings"); setUserMenu(false); }} />
                      <MenuRow icon={<LogOut className="h-4 w-4" />} label="Sign out" danger onClick={logout} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            {activeTab === "dashboard" && <DashboardSection />}
            {activeTab === "reports" && <ReportsSection />}
            {activeTab === "products" && <ProductsSection />}
            {activeTab === "categories" && <CategoriesSection />}
            {activeTab === "media" && <MediaSection />}
            {activeTab === "orders" && <OrdersSection />}
            {activeTab === "customers" && <CustomersSection />}
            {activeTab === "payments" && <PaymentsSection />}
            {activeTab === "coupons" && <CouponsSection />}
            {activeTab === "digital_files" && <DigitalFilesSection />}
            {activeTab === "downloads" && <DownloadsSection />}
            {activeTab === "reviews" && <ReviewsSection />}
            {activeTab === "banners" && <BannersSection />}
            {activeTab === "notifications" && <NotificationsSection />}
            {activeTab === "admin_users" && <AdminUsersSection />}
            {activeTab === "settings" && <SettingsSection />}
          </div>
        </main>
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      <Toaster />
    </div>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
        danger ? "text-black hover:bg-black hover:text-white" : "text-[#3a3a3a] hover:bg-[#f4f4f4]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/* ============================ NOTIFICATIONS ============================ */
function NotificationBell({
  alerts,
  onJump,
}: {
  alerts: { label: string; tab: AdminSection; tone: "warning" | "danger" | "info" }[];
  onJump: (t: AdminSection) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-8 w-8 place-items-center rounded-[9px] bg-white text-[#666666] ring-1 ring-inset ring-[#e5e5e5] transition-colors hover:text-[#000000]"
      >
        <Bell className="h-4 w-4" />
        {alerts.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {alerts.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_20px_50px_rgba(16,16,20,.16)] animate-scale-in">
            <div className="border-b border-[#ececec] px-4 py-3">
              <p className="text-[13px] font-bold text-[#000000]">Action centre</p>
              <p className="text-[11px] text-[#9a9a9a]">{alerts.length} item(s) need attention</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <CheckCircle2 className="h-6 w-6 text-black" />
                  <p className="text-xs text-[#858585]">Everything looks healthy</p>
                </div>
              ) : (
                alerts.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onJump(a.tab);
                      setOpen(false);
                    }}
                    className="flex w-full items-start gap-2.5 border-b border-[#f5f5f5] px-4 py-3 text-left last:border-0 hover:bg-[#fafafa]"
                  >
                    <span
                      className={cx(
                        "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg",
                        a.tone === "danger"
                          ? "bg-black text-white"
                          : a.tone === "warning"
                          ? "bg-[#e5e5e5] text-black"
                          : "bg-[#f5f5f5] text-[#666666]"
                      )}
                    >
                      <AlertTriangle className="h-3 w-3" />
                    </span>
                    <span className="text-[12px] leading-snug text-[#3a3a3a]">{a.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================ COMMAND PALETTE ============================ */
function CommandPalette({ onClose }: { onClose: () => void }) {
  const { setActiveTab, products, orders, customerList } = useAdmin();
  const [q, setQ] = useState("");

  const navMatches = NAV_GROUPS.flatMap((g) => g.items).filter((i) =>
    i.label.toLowerCase().includes(q.toLowerCase())
  );
  const productMatches = q
    ? products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())).slice(0, 4)
    : [];
  const orderMatches = q
    ? orders
        .filter(
          (o) =>
            String(o.id).includes(q) ||
            o.licenseKey.toLowerCase().includes(q.toLowerCase()) ||
            o.buyerEmail.toLowerCase().includes(q.toLowerCase())
        )
        .slice(0, 4)
    : [];
  const customerMatches = q
    ? customerList.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3)
    : [];

  function go(tab: AdminSection) {
    setActiveTab(tab);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh]">
      <div className="fixed inset-0 bg-[#000000]/45 backdrop-blur-[3px] animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_32px_80px_rgba(16,16,20,.3)] animate-scale-in">
        <div className="flex items-center gap-3 border-b border-[#ececec] px-4">
          <Search className="h-4 w-4 shrink-0 text-[#a3a3a3]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a section, product, order or customer…"
            className="h-14 flex-1 bg-transparent text-sm text-[#000000] placeholder:text-[#b5b5b5] focus:outline-none"
          />
          <kbd className="rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[10px] font-semibold text-[#858585]">ESC</kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {navMatches.length > 0 && (
            <Group title="Sections">
              {navMatches.map((n) => (
                <Row key={n.id} icon={n.icon} label={n.label} onClick={() => go(n.id)} />
              ))}
            </Group>
          )}
          {productMatches.length > 0 && (
            <Group title="Products">
              {productMatches.map((p) => (
                <Row
                  key={p.id}
                  icon={<Package className="h-[17px] w-[17px]" />}
                  label={p.title}
                  meta={`$${(p.priceCents / 100).toFixed(2)}`}
                  onClick={() => go("products")}
                />
              ))}
            </Group>
          )}
          {orderMatches.length > 0 && (
            <Group title="Orders">
              {orderMatches.map((o) => (
                <Row
                  key={o.id}
                  icon={<ShoppingBag className="h-[17px] w-[17px]" />}
                  label={`#${o.id} · ${o.product?.title ?? "Order"}`}
                  meta={o.buyerEmail}
                  onClick={() => go("orders")}
                />
              ))}
            </Group>
          )}
          {customerMatches.length > 0 && (
            <Group title="Customers">
              {customerMatches.map((c) => (
                <Row
                  key={c.email}
                  icon={<Users className="h-[17px] w-[17px]" />}
                  label={c.name}
                  meta={c.email}
                  onClick={() => go("customers")}
                />
              ))}
            </Group>
          )}
          {navMatches.length === 0 &&
            productMatches.length === 0 &&
            orderMatches.length === 0 &&
            customerMatches.length === 0 && (
              <p className="px-3 py-10 text-center text-xs text-[#9a9a9a]">No results for “{q}”</p>
            )}
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b5b5b5]">{title}</p>
      {children}
    </div>
  );
}

function Row({
  icon,
  label,
  meta,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#f4f4f4]"
    >
      <span className="shrink-0 text-[#666666]">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#000000]">{label}</span>
      {meta && <span className="shrink-0 truncate text-[11px] text-[#9a9a9a]">{meta}</span>}
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#c4c4c4]" />
    </button>
  );
}

/* ============================ TOASTER ============================ */
function Toaster() {
  const { toast } = useAdmin();
  if (!toast) return null;
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-white" />,
    error: <AlertTriangle className="h-4 w-4 text-white" />,
    info: <Info className="h-4 w-4 text-white/70" />,
  };
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[90] animate-fade-up">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-[#000000] py-3 pl-4 pr-5 shadow-[0_18px_40px_rgba(16,16,20,.3)]">
        {icons[toast.tone]}
        <span className="text-[13px] font-medium text-white">{toast.msg}</span>
      </div>
    </div>
  );
}
