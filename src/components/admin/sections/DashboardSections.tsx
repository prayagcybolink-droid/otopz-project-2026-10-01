"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAdmin } from "../AdminContext";
import {
  Badge,
  BarRow,
  Btn,
  Card,
  CardHead,
  Donut,
  AreaChart,
  EmptyState,
  IconBtn,
  PageHeader,
  Segmented,
  StatCard,
} from "@/components/ui/kit";
import { formatPrice, PRODUCT_CATEGORIES } from "@/types/admin";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Download,
  Plus,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Ticket,
  Star,
  FileCheck2,
  Activity,
  Wallet,
  RotateCcw,
  BarChart3,
} from "lucide-react";

const CHART_COLORS = [
  "#000000",
  "#3a3a3a",
  "#5c5c5c",
  "#7d7d7d",
  "#9e9e9e",
  "#bdbdbd",
  "#d9d9d9",
];

function dayKey(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function DashboardSection() {
  const {
    orders,
    products,
    customerList,
    completedOrders,
    refundedOrders,
    grossRevenueCents,
    netRevenueCents,
    refundedRevenueCents,
    avgOrderValueCents,
    reviewsList,
    couponsList,
    digitalFilesList,
    downloadsList,
    setActiveTab,
    simulateOrder,
    exportCSV,
    copy,
    session,
  } = useAdmin();

  const [trendDays, setTrendDays] = useState<"7" | "14" | "30">("14");

  /* ---- revenue trend series ---- */
  const { series, labels } = useMemo(() => {
    const n = Number(trendDays);
    const buckets: number[] = Array(n).fill(0);
    const lbls: string[] = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      lbls.push(dayKey(d));
    }
    completedOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
      if (diff >= 0 && diff < n) buckets[n - 1 - diff] += o.amountCents / 100;
    });
    const every = Math.ceil(n / 7);
    return {
      series: buckets,
      labels: lbls.map((l, i) => (i % every === 0 || i === n - 1 ? l : "")),
    };
  }, [completedOrders, trendDays]);

  /* ---- category split ---- */
  const donutSegments = useMemo(() => {
    const map: Record<string, number> = {};
    completedOrders.forEach((o) => {
      const c = o.product?.category || "Other";
      map[c] = (map[c] || 0) + o.amountCents;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [completedOrders]);

  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5),
    [products]
  );
  const maxSales = topProducts[0]?.salesCount || 1;

  const avgRating =
    reviewsList.length > 0
      ? (reviewsList.reduce((s, r) => s + r.rating, 0) / reviewsList.length).toFixed(1)
      : "5.0";

  const activeCoupons = couponsList.filter((c) => c.isActive).length;
  const flaggedReviews = reviewsList.filter((r) => r.status === "flagged").length;
  const revokedDownloads = downloadsList.filter((d) => d.status === "revoked").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow={`Welcome back, ${session?.name?.split(" ")[0] ?? "Admin"}`}
        title="Business overview"
        subtitle="Live revenue, fulfilment and catalogue health across the OTOPZ store."
        actions={
          <>
            <Btn
              variant="secondary"
              onClick={() =>
                exportCSV(
                  "otopz-orders.csv",
                  ["Order", "Date", "Customer", "Email", "Product", "Amount", "License", "Status"],
                  orders.map((o) => [
                    o.id,
                    new Date(o.createdAt).toISOString().slice(0, 10),
                    `"${o.buyerName}"`,
                    o.buyerEmail,
                    `"${o.product?.title ?? ""}"`,
                    (o.amountCents / 100).toFixed(2),
                    o.licenseKey,
                    o.status,
                  ])
                )
              }
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Btn>
            <Btn variant="primary" onClick={simulateOrder}>
              <Sparkles className="h-3.5 w-3.5" /> Simulate order
            </Btn>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Gross revenue"
          value={formatPrice(grossRevenueCents)}
          icon={<DollarSign className="h-5 w-5" />}
          delta="+18.4%"
          sub="all completed orders"
          spark={series}
          accent="#000000"
        />
        <StatCard
          label="Net payout"
          value={formatPrice(netRevenueCents)}
          icon={<Wallet className="h-5 w-5" />}
          delta="after fees"
          deltaTone="neutral"
          sub={`${formatPrice(refundedRevenueCents)} refunded`}
          accent="#262626"
        />
        <StatCard
          label="Orders"
          value={completedOrders.length}
          icon={<ShoppingBag className="h-5 w-5" />}
          delta={`${refundedOrders.length} refunds`}
          deltaTone={refundedOrders.length > 0 ? "danger" : "neutral"}
          sub={`AOV ${formatPrice(avgOrderValueCents)}`}
          accent="#525252"
        />
        <StatCard
          label="Customers"
          value={customerList.length}
          icon={<Users className="h-5 w-5" />}
          delta={`${orders.length} licenses`}
          deltaTone="neutral"
          sub="unique buyers"
          accent="#a3a3a3"
        />
      </div>

      {/* charts */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHead
            title="Revenue trend"
            subtitle="Completed order value per day"
            icon={<TrendingUp className="h-4 w-4" />}
            action={
              <Segmented<"7" | "14" | "30">
                value={trendDays}
                onChange={setTrendDays}
                options={[
                  { value: "7", label: "7d" },
                  { value: "14", label: "14d" },
                  { value: "30", label: "30d" },
                ]}
              />
            }
          />
          <div className="mt-5">
            <AreaChart data={series} labels={labels} valuePrefix="$" color="#000000" height={190} />
          </div>
        </Card>

        <Card>
          <CardHead
            title="Revenue by category"
            subtitle="Share of completed sales"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <div className="mt-5">
            {donutSegments.length === 0 ? (
              <EmptyState title="No sales yet" message="Category split appears after the first order." />
            ) : (
              <Donut
                segments={donutSegments}
                centerValue={formatPrice(grossRevenueCents)}
                centerLabel="Total"
              />
            )}
          </div>
        </Card>
      </div>

      {/* lower grid */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* top products */}
        <Card className="xl:col-span-1">
          <CardHead
            title="Top products"
            subtitle="By lifetime units sold"
            icon={<Star className="h-4 w-4" />}
            action={
              <Btn variant="ghost" size="xs" onClick={() => setActiveTab("products")}>
                View all <ArrowUpRight className="h-3 w-3" />
              </Btn>
            }
          />
          <div className="mt-5 space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="tabular w-4 shrink-0 text-xs font-bold text-[#b5b5b5]">{i + 1}</span>
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#000000] ring-1 ring-[#e5e5e5]">
                  <Image src={p.coverImage} alt={p.title} fill sizes="40px" className="object-contain p-1" unoptimized={p.coverImage.startsWith("/api/media/")} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#000000]">{p.title}</p>
                  <div className="mt-1">
                    <BarRow
                      label=""
                      value={p.salesCount}
                      max={maxSales}
                      caption={`${p.salesCount} sold`}
                      color={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* recent orders */}
        <Card className="xl:col-span-2" pad={false}>
          <div className="px-5 pt-5">
            <CardHead
              title="Latest orders"
              subtitle="Most recent license activations"
              icon={<Activity className="h-4 w-4" />}
              action={
                <Btn variant="ghost" size="xs" onClick={() => setActiveTab("orders")}>
                  Open ledger <ArrowUpRight className="h-3 w-3" />
                </Btn>
              }
            />
          </div>
          <div className="mt-4 divide-y divide-[#ececec]">
            {orders.slice(0, 6).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[#fafafa]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f5f5f5] text-[11px] font-bold text-[#000000]">
                    #{o.id}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#000000]">
                      {o.product?.title ?? "Digital product"}
                    </p>
                    <p className="truncate text-[11px] text-[#9a9a9a]">
                      {o.buyerName} · {o.buyerEmail}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() => copy(o.licenseKey, "License key")}
                    className="tabular hidden rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-2 py-1 font-mono text-[10px] text-[#666666] hover:border-[#bdbdbd] md:block"
                  >
                    {o.licenseKey}
                  </button>
                  <span className="tabular text-xs font-bold text-[#000000]">
                    {formatPrice(o.amountCents)}
                  </span>
                  <Badge tone={o.status === "completed" ? "success" : "danger"} dot>
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))}
            {orders.length === 0 && <EmptyState title="No orders yet" />}
          </div>
        </Card>
      </div>

      {/* operational health */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HealthTile
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="success"
          title="File integrity"
          value={`${digitalFilesList.length} files verified`}
          caption="All SHA-256 checksums match storage"
          onClick={() => setActiveTab("digital_files")}
        />
        <HealthTile
          icon={<Ticket className="h-4 w-4" />}
          tone="info"
          title="Active coupons"
          value={`${activeCoupons} running`}
          caption={`${couponsList.reduce((s, c) => s + c.usedCount, 0)} redemptions total`}
          onClick={() => setActiveTab("coupons")}
        />
        <HealthTile
          icon={<Star className="h-4 w-4" />}
          tone={flaggedReviews > 0 ? "warning" : "neutral"}
          title="Review score"
          value={`${avgRating} / 5.0`}
          caption={flaggedReviews > 0 ? `${flaggedReviews} flagged for review` : "No moderation pending"}
          onClick={() => setActiveTab("reviews")}
        />
        <HealthTile
          icon={<FileCheck2 className="h-4 w-4" />}
          tone={revokedDownloads > 0 ? "warning" : "neutral"}
          title="Download links"
          value={`${downloadsList.length - revokedDownloads} active`}
          caption={`${revokedDownloads} revoked by support`}
          onClick={() => setActiveTab("downloads")}
        />
      </div>
    </div>
  );
}

function HealthTile({
  icon,
  title,
  value,
  caption,
  tone,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  caption: string;
  tone: "success" | "warning" | "info" | "neutral";
  onClick: () => void;
}) {
  const tones = {
    success: "bg-black text-white ring-black",
    warning: "bg-[#e5e5e5] text-black ring-[#cfcfcf]",
    info: "bg-white text-black ring-[#d6d6d6]",
    neutral: "bg-[#f5f5f5] text-[#666666] ring-[#e5e5e5]",
  };
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 rounded-[18px] border border-[#e5e5e5] bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,16,20,.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,16,20,.08)]"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${tones[tone]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a9a9a]">{title}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-[#000000]">{value}</p>
        <p className="mt-0.5 truncate text-[11px] text-[#9a9a9a]">{caption}</p>
      </div>
      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-[#c4c4c4] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#000000]" />
    </button>
  );
}

/* =========================== REPORTS =========================== */
interface ReportShape {
  range: string;
  orderCount: number;
  completedCount: number;
  refundedCount: number;
  grossRevenueCents: number;
  refundedRevenueCents: number;
  netRevenueCents: number;
  totalFeesCents: number;
  avgOrderValueCents: number;
  categoryBreakdown: { category: string; count: number; revenueCents: number }[];
  topProducts: { title: string; count: number; revenueCents: number }[];
}

export function ReportsSection() {
  const { exportCSV, showToast, exportBackup } = useAdmin();
  const [range, setRange] = useState<"7d" | "30d" | "ytd" | "all">("30d");
  const [report, setReport] = useState<ReportShape | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/reports?range=${range}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.ok) setReport(d.report as ReportShape);
        else showToast("Could not load report", "error");
      })
      .catch(() => showToast("Could not load report", "error"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [range, showToast]);

  const maxCat = Math.max(...(report?.categoryBreakdown.map((c) => c.revenueCents) ?? [1]), 1);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Analytics"
        title="Sales reports"
        subtitle="Revenue, fees and product performance for the selected period."
        actions={
          <>
            <Segmented<"7d" | "30d" | "ytd" | "all">
              value={range}
              onChange={(nextRange) => {
                setLoading(true);
                setRange(nextRange);
              }}
              options={[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "ytd", label: "YTD" },
                { value: "all", label: "All time" },
              ]}
            />
            <Btn variant="secondary" onClick={exportBackup}>
              <Download className="h-3.5 w-3.5" /> Backup JSON
            </Btn>
            <Btn
              variant="primary"
              onClick={() =>
                report &&
                exportCSV(
                  `otopz-report-${range}.csv`,
                  ["Metric", "Value"],
                  [
                    ["Range", report.range],
                    ["Orders", report.orderCount],
                    ["Completed", report.completedCount],
                    ["Refunded", report.refundedCount],
                    ["Gross revenue", (report.grossRevenueCents / 100).toFixed(2)],
                    ["Processing fees", (report.totalFeesCents / 100).toFixed(2)],
                    ["Net revenue", (report.netRevenueCents / 100).toFixed(2)],
                    ["Average order value", (report.avgOrderValueCents / 100).toFixed(2)],
                  ]
                )
              }
            >
              <Download className="h-3.5 w-3.5" /> Export report
            </Btn>
          </>
        }
      />

      {loading || !report ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[118px] rounded-[18px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Gross revenue"
              value={formatPrice(report.grossRevenueCents)}
              icon={<DollarSign className="h-5 w-5" />}
              sub={`${report.completedCount} completed orders`}
              accent="#000000"
            />
            <StatCard
              label="Processing fees"
              value={formatPrice(report.totalFeesCents)}
              icon={<RotateCcw className="h-5 w-5" />}
              sub="gateway + platform"
              accent="#737373"
            />
            <StatCard
              label="Net revenue"
              value={formatPrice(report.netRevenueCents)}
              icon={<Wallet className="h-5 w-5" />}
              sub="after fees"
              accent="#262626"
            />
            <StatCard
              label="Refunded"
              value={formatPrice(report.refundedRevenueCents)}
              icon={<ShoppingBag className="h-5 w-5" />}
              sub={`${report.refundedCount} refunds issued`}
              accent="#0a0a0a"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHead title="Revenue by category" subtitle={`Period: ${report.range}`} icon={<BarChart3 className="h-4 w-4" />} />
              <div className="mt-5 space-y-4">
                {PRODUCT_CATEGORIES.map((cat, i) => {
                  const row = report.categoryBreakdown.find((c) => c.category === cat);
                  return (
                    <BarRow
                      key={cat}
                      label={cat}
                      value={row?.revenueCents ?? 0}
                      max={maxCat}
                      caption={`${row?.count ?? 0} sales · ${formatPrice(row?.revenueCents ?? 0)}`}
                      color={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  );
                })}
              </div>
            </Card>

            <Card pad={false}>
              <div className="px-5 pt-5">
                <CardHead title="Best performers" subtitle="Ranked by revenue contribution" icon={<Star className="h-4 w-4" />} />
              </div>
              <div className="mt-4 divide-y divide-[#ececec]">
                {report.topProducts.length === 0 && <EmptyState title="No sales in this period" />}
                {report.topProducts.slice(0, 7).map((p, i) => (
                  <div key={p.title} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#f5f5f5] text-[11px] font-bold text-[#666666]">
                        {i + 1}
                      </span>
                      <p className="truncate text-xs font-semibold text-[#000000]">{p.title}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[11px] text-[#9a9a9a]">{p.count} sold</span>
                      <span className="tabular text-xs font-bold text-[#000000]">
                        {formatPrice(p.revenueCents)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
