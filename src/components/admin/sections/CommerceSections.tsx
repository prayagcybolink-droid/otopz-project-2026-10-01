"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useAdmin } from "../AdminContext";
import {
  Avatar,
  Badge,
  Btn,
  Card,
  CardHead,
  Drawer,
  EmptyState,
  Field,
  IconBtn,
  Input,
  KeyChip,
  Modal,
  PageHeader,
  Progress,
  SearchInput,
  Segmented,
  Select,
  StatCard,
  TableWrap,
  Td,
  Th,
  Toggle,
  Tr,
} from "@/components/ui/kit";
import { CouponItem, CustomerItem, OrderItem, formatPrice } from "@/types/admin";
import {
  ShoppingBag,
  Download,
  KeyRound,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Users,
  Mail,
  CreditCard,
  Ticket,
  Plus,
  Percent,
  DollarSign,
  Wallet,
  Receipt,
  Eye,
  TrendingUp,
  Crown,
} from "lucide-react";

/* =========================== ORDERS =========================== */
export function OrdersSection() {
  const {
    orders,
    completedOrders,
    refundedOrders,
    grossRevenueCents,
    avgOrderValueCents,
    toggleOrderStatus,
    reissueLicense,
    deleteOrder,
    exportCSV,
    copy,
    copiedKey,
  } = useAdmin();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | "completed" | "refunded">("All");
  const [inspect, setInspect] = useState<OrderItem | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (status !== "All" && o.status !== status) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            o.buyerName.toLowerCase().includes(q) ||
            o.buyerEmail.toLowerCase().includes(q) ||
            o.licenseKey.toLowerCase().includes(q) ||
            (o.product?.title ?? "").toLowerCase().includes(q) ||
            String(o.id).includes(q)
          );
        }
        return true;
      }),
    [orders, status, search]
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Sales"
        title="Orders & licenses"
        subtitle="Track fulfilment, refund transactions and reissue license keys."
        actions={
          <Btn
            variant="primary"
            onClick={() =>
              exportCSV(
                "otopz-order-ledger.csv",
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
            <Download className="h-3.5 w-3.5" /> Export ledger
          </Btn>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All orders" value={orders.length} icon={<ShoppingBag className="h-5 w-5" />} sub="lifetime" accent="#000000" />
        <StatCard label="Completed" value={completedOrders.length} icon={<CheckCircle2 className="h-5 w-5" />} sub={formatPrice(grossRevenueCents)} accent="#262626" />
        <StatCard label="Refunded" value={refundedOrders.length} icon={<RotateCcw className="h-5 w-5" />} sub="requires follow-up" accent="#0a0a0a" />
        <StatCard label="Average order" value={formatPrice(avgOrderValueCents)} icon={<TrendingUp className="h-5 w-5" />} sub="per completed sale" accent="#525252" />
      </div>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by order, buyer, email or license…" className="sm:max-w-md" />
        <Segmented<"All" | "completed" | "refunded">
          value={status}
          onChange={setStatus}
          options={[
            { value: "All", label: "All", count: orders.length },
            { value: "completed", label: "Completed", count: completedOrders.length },
            { value: "refunded", label: "Refunded", count: refundedOrders.length },
          ]}
        />
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<ShoppingBag className="h-5 w-5" />} title="No orders found" message="Adjust your search or filters." />
        </Card>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Product</Th>
              <Th>Customer</Th>
              <Th>License key</Th>
              <Th align="right">Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <Tr key={o.id}>
                <Td className="tabular font-bold text-[#000000]">#{o.id}</Td>
                <Td>
                  <div className="flex items-center gap-2.5">
                    {o.product?.coverImage && (
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#000000]">
                        <Image src={o.product.coverImage} alt="" fill sizes="36px" className="object-contain p-0.5" unoptimized={o.product.coverImage.startsWith("/api/media/")} />
                      </span>
                    )}
                    <div className="min-w-0 max-w-[200px]">
                      <p className="truncate text-[13px] font-semibold text-[#000000]">
                        {o.product?.title ?? "Digital product"}
                      </p>
                      <p className="truncate text-[11px] text-[#9a9a9a]">{o.product?.category ?? "—"}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar name={o.buyerName} size={28} ring={false} />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-[#000000]">{o.buyerName}</p>
                      <p className="truncate text-[11px] text-[#9a9a9a]">{o.buyerEmail}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <KeyChip value={o.licenseKey} copied={copiedKey === o.licenseKey} onCopy={() => copy(o.licenseKey, "License key")} />
                </Td>
                <Td align="right" className="tabular font-bold text-[#000000]">
                  {formatPrice(o.amountCents)}
                </Td>
                <Td>
                  <button onClick={() => toggleOrderStatus(o.id, o.status)} title="Toggle refund state">
                    <Badge tone={o.status === "completed" ? "success" : "danger"} dot>
                      {o.status}
                    </Badge>
                  </button>
                </Td>
                <Td className="text-[12px] text-[#666666]">{new Date(o.createdAt).toLocaleDateString()}</Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconBtn title="Inspect order" onClick={() => setInspect(o)}>
                      <Eye className="h-3.5 w-3.5" />
                    </IconBtn>
                    <a
                      href={`/api/download/${o.id}`}
                      download
                      title="Download certificate"
                      className="inline-grid h-8 w-8 place-items-center rounded-[9px] bg-white text-[#666666] ring-1 ring-inset ring-[#e5e5e5] transition-all hover:bg-[#f4f4f4] hover:text-[#000000]"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <IconBtn title="Re-issue license key" onClick={() => reissueLicense(o.id)}>
                      <KeyRound className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      title="Revoke order"
                      tone="danger"
                      onClick={() => {
                        if (confirm(`Revoke and delete order #${o.id}?`)) deleteOrder(o.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <Drawer
        open={!!inspect}
        onClose={() => setInspect(null)}
        title={inspect ? `Order #${inspect.id}` : ""}
        subtitle={inspect?.product?.title}
        footer={
          inspect && (
            <div className="flex items-center gap-2">
              <Btn
                variant={inspect.status === "completed" ? "danger" : "success"}
                className="flex-1"
                onClick={() => {
                  toggleOrderStatus(inspect.id, inspect.status);
                  setInspect(null);
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {inspect.status === "completed" ? "Issue refund" : "Restore order"}
              </Btn>
              <a
                href={`/api/download/${inspect.id}`}
                download
                className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[#000000] px-3.5 text-xs font-semibold text-white hover:bg-[#262626]"
              >
                <Download className="h-3.5 w-3.5" /> Certificate
              </a>
            </div>
          )
        }
      >
        {inspect && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl bg-[#fafafa] p-4 ring-1 ring-inset ring-[#ececec]">
              {inspect.product?.coverImage && (
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#000000]">
                  <Image src={inspect.product.coverImage} alt="" fill sizes="64px" className="object-contain p-1" unoptimized={inspect.product.coverImage.startsWith("/api/media/")} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#000000]">{inspect.product?.title}</p>
                <p className="text-xs text-[#9a9a9a]">
                  {inspect.product?.category} · {inspect.product?.fileFormat} · v{inspect.product?.version}
                </p>
                <p className="tabular mt-1 font-display text-lg font-extrabold text-[#000000]">
                  {formatPrice(inspect.amountCents)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9a9a9a]">Customer</p>
              <div className="flex items-center gap-3 rounded-xl border border-[#ececec] p-3">
                <Avatar name={inspect.buyerName} size={36} ring={false} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#000000]">{inspect.buyerName}</p>
                  <p className="truncate text-xs text-[#9a9a9a]">{inspect.buyerEmail}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9a9a9a]">License key</p>
              <div className="flex items-center gap-2">
                <code className="tabular flex-1 truncate rounded-xl bg-[#000000] px-3 py-2.5 font-mono text-xs font-bold text-[#ffffff]">
                  {inspect.licenseKey}
                </code>
                <IconBtn title="Copy" onClick={() => copy(inspect.licenseKey, "License key")}>
                  <KeyRound className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
              <Btn size="xs" variant="secondary" onClick={() => reissueLicense(inspect.id)}>
                <KeyRound className="h-3 w-3" /> Generate replacement key
              </Btn>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[#fafafa] p-3 ring-1 ring-inset ring-[#ececec]">
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9a9a]">Status</dt>
                <dd className="mt-1">
                  <Badge tone={inspect.status === "completed" ? "success" : "danger"} dot>
                    {inspect.status}
                  </Badge>
                </dd>
              </div>
              <div className="rounded-xl bg-[#fafafa] p-3 ring-1 ring-inset ring-[#ececec]">
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9a9a]">Purchased</dt>
                <dd className="mt-1 font-semibold text-[#000000]">
                  {new Date(inspect.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* =========================== CUSTOMERS =========================== */
export function CustomersSection() {
  const { customerList, copy, copiedKey, exportCSV, setActiveTab } = useAdmin();
  const [search, setSearch] = useState("");
  const [inspect, setInspect] = useState<CustomerItem | null>(null);

  const filtered = useMemo(
    () =>
      customerList.filter((c) =>
        search.trim()
          ? c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
          : true
      ),
    [customerList, search]
  );

  const lifetime = customerList.reduce((s, c) => s + c.totalSpentCents, 0);
  const top = customerList[0];
  const repeat = customerList.filter((c) => c.ordersCount > 1).length;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Audience"
        title="Customers"
        subtitle="Buyer profiles, lifetime value and license ownership."
        actions={
          <Btn
            variant="secondary"
            onClick={() =>
              exportCSV(
                "otopz-customers.csv",
                ["Name", "Email", "Orders", "Completed", "Lifetime spend", "Licenses", "Status"],
                customerList.map((c) => [
                  `"${c.name}"`,
                  c.email,
                  c.ordersCount,
                  c.completedCount,
                  (c.totalSpentCents / 100).toFixed(2),
                  c.licenses.length,
                  c.status,
                ])
              )
            }
          >
            <Download className="h-3.5 w-3.5" /> Export customers
          </Btn>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customers" value={customerList.length} icon={<Users className="h-5 w-5" />} sub="unique buyers" accent="#000000" />
        <StatCard label="Lifetime value" value={formatPrice(lifetime)} icon={<DollarSign className="h-5 w-5" />} sub="all customers" accent="#262626" />
        <StatCard label="Repeat buyers" value={repeat} icon={<RotateCcw className="h-5 w-5" />} sub="more than one order" accent="#525252" />
        <StatCard
          label="Top customer"
          value={top ? formatPrice(top.totalSpentCents) : "—"}
          icon={<Crown className="h-5 w-5" />}
          sub={top?.name ?? "No orders yet"}
          accent="#737373"
        />
      </div>

      <Card>
        <SearchInput value={search} onChange={setSearch} placeholder="Search customers by name or email…" className="sm:max-w-md" />
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<Users className="h-5 w-5" />} title="No customers yet" message="Customers appear after their first order." />
        </Card>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th align="right">Lifetime spend</Th>
              <Th align="right">Orders</Th>
              <Th align="right">Licenses</Th>
              <Th>First order</Th>
              <Th>Last activity</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <Tr key={c.email}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} size={34} ring={false} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[#000000]">{c.name}</p>
                      <p className="truncate text-[11px] text-[#9a9a9a]">{c.email}</p>
                    </div>
                  </div>
                </Td>
                <Td align="right" className="tabular font-bold text-[#000000]">
                  {formatPrice(c.totalSpentCents)}
                </Td>
                <Td align="right" className="tabular">{c.ordersCount}</Td>
                <Td align="right" className="tabular">{c.licenses.length}</Td>
                <Td className="text-[12px] text-[#666666]">{new Date(c.firstOrderDate).toLocaleDateString()}</Td>
                <Td className="text-[12px] text-[#666666]">{new Date(c.lastOrderDate).toLocaleDateString()}</Td>
                <Td>
                  <Badge tone={c.status === "active" ? "success" : "warning"} dot>
                    {c.status}
                  </Badge>
                </Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Btn size="xs" variant="secondary" onClick={() => setInspect(c)}>
                      View vault
                    </Btn>
                    <a
                      href={`mailto:${c.email}`}
                      title="Email customer"
                      className="inline-grid h-8 w-8 place-items-center rounded-[9px] bg-white text-[#666666] ring-1 ring-inset ring-[#e5e5e5] hover:bg-[#f4f4f4] hover:text-[#000000]"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <Drawer
        open={!!inspect}
        onClose={() => setInspect(null)}
        title={inspect?.name ?? ""}
        subtitle={inspect?.email}
        footer={
          inspect && (
            <Btn variant="secondary" className="w-full" onClick={() => setActiveTab("notifications")}>
              <Mail className="h-3.5 w-3.5" /> Send an email to this customer
            </Btn>
          )
        }
      >
        {inspect && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#000000] p-4 text-white">
                <p className="text-[10px] uppercase tracking-wider text-white/50">Lifetime spend</p>
                <p className="tabular mt-1 font-display text-xl font-extrabold text-[#ffffff]">
                  {formatPrice(inspect.totalSpentCents)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fafafa] p-4 ring-1 ring-inset ring-[#ececec]">
                <p className="text-[10px] uppercase tracking-wider text-[#9a9a9a]">Orders</p>
                <p className="tabular mt-1 font-display text-xl font-extrabold text-[#000000]">
                  {inspect.ordersCount}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9a9a9a]">
                Licenses ({inspect.orders.length})
              </p>
              {inspect.orders.map((o) => (
                <div key={o.id} className="space-y-2 rounded-xl border border-[#ececec] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[#000000]">{o.product?.title ?? "Digital product"}</p>
                    <span className="tabular shrink-0 text-xs font-bold">{formatPrice(o.amountCents)}</span>
                  </div>
                  <KeyChip value={o.licenseKey} copied={copiedKey === o.licenseKey} onCopy={() => copy(o.licenseKey, "License key")} />
                  <div className="flex items-center justify-between text-[11px] text-[#9a9a9a]">
                    <span>Order #{o.id} · {new Date(o.createdAt).toLocaleDateString()}</span>
                    <a href={`/api/download/${o.id}`} download className="font-semibold text-[#000000] underline">
                      Certificate
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* =========================== PAYMENTS =========================== */
export function PaymentsSection() {
  const { payments, grossRevenueCents, totalFeesCents, netRevenueCents, exportCSV, copy, copiedKey } = useAdmin();
  const [gateway, setGateway] = useState("All");
  const [search, setSearch] = useState("");

  const gateways = useMemo(() => Array.from(new Set(payments.map((p) => p.gateway))), [payments]);

  const filtered = useMemo(
    () =>
      payments.filter((p) => {
        if (gateway !== "All" && p.gateway !== gateway) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            p.transactionId.toLowerCase().includes(q) ||
            (p.order?.buyerEmail ?? "").toLowerCase().includes(q) ||
            (p.order?.buyerName ?? "").toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [payments, gateway, search]
  );

  const succeeded = payments.filter((p) => p.status === "succeeded").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        subtitle="Gateway transactions, processing fees and settlement status."
        actions={
          <Btn
            variant="primary"
            onClick={() =>
              exportCSV(
                "otopz-payments.csv",
                ["Transaction", "Order", "Gateway", "Customer", "Amount", "Fee", "Currency", "Status", "Date"],
                payments.map((p) => [
                  p.transactionId,
                  p.orderId,
                  p.gateway,
                  p.order?.buyerEmail ?? "",
                  (p.amountCents / 100).toFixed(2),
                  (p.feeCents / 100).toFixed(2),
                  p.currency,
                  p.status,
                  new Date(p.createdAt).toISOString().slice(0, 10),
                ])
              )
            }
          >
            <Download className="h-3.5 w-3.5" /> Export payments
          </Btn>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Processed volume" value={formatPrice(grossRevenueCents)} icon={<CreditCard className="h-5 w-5" />} sub={`${succeeded} successful charges`} accent="#000000" />
        <StatCard label="Gateway fees" value={formatPrice(totalFeesCents)} icon={<Receipt className="h-5 w-5" />} sub="deducted at source" accent="#737373" />
        <StatCard label="Net settlement" value={formatPrice(netRevenueCents)} icon={<Wallet className="h-5 w-5" />} sub="payable to account" accent="#262626" />
        <StatCard label="Gateways" value={gateways.length} icon={<DollarSign className="h-5 w-5" />} sub={gateways.join(" · ") || "—"} accent="#525252" />
      </div>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search transaction or customer…" className="sm:max-w-md" />
        <Select value={gateway} onChange={(e) => setGateway(e.target.value)} className="h-10 py-0 sm:w-48">
          <option value="All">All gateways</option>
          {gateways.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<CreditCard className="h-5 w-5" />} title="No payments found" />
        </Card>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Transaction</Th>
              <Th>Order</Th>
              <Th>Gateway</Th>
              <Th>Customer</Th>
              <Th align="right">Amount</Th>
              <Th align="right">Fee</Th>
              <Th align="right">Net</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <KeyChip value={p.transactionId} copied={copiedKey === p.transactionId} onCopy={() => copy(p.transactionId, "Transaction ID")} />
                </Td>
                <Td className="tabular font-semibold">#{p.orderId}</Td>
                <Td>
                  <Badge tone={p.gateway === "Stripe" ? "violet" : p.gateway === "PayPal" ? "info" : "neutral"}>
                    {p.gateway}
                  </Badge>
                </Td>
                <Td>
                  <p className="text-[12px] font-semibold text-[#000000]">{p.order?.buyerName ?? "—"}</p>
                  <p className="text-[11px] text-[#9a9a9a]">{p.order?.buyerEmail ?? ""}</p>
                </Td>
                <Td align="right" className="tabular font-bold text-[#000000]">{formatPrice(p.amountCents)}</Td>
                <Td align="right" className="tabular text-[#0a0a0a]">-{formatPrice(p.feeCents)}</Td>
                <Td align="right" className="tabular font-bold text-black">
                  {formatPrice(p.amountCents - p.feeCents)}
                </Td>
                <Td>
                  <Badge tone={p.status === "succeeded" ? "success" : p.status === "refunded" ? "warning" : "danger"} dot>
                    {p.status}
                  </Badge>
                </Td>
                <Td className="text-[12px] text-[#666666]">{new Date(p.createdAt).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}

/* =========================== COUPONS =========================== */
export function CouponsSection() {
  const { couponsList, saveCoupon, toggleCoupon, deleteCoupon, copy, copiedKey } = useAdmin();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [val, setVal] = useState("20");
  const [minSpend, setMinSpend] = useState("0");
  const [maxUses, setMaxUses] = useState("100");
  const [saving, setSaving] = useState(false);

  const active = couponsList.filter((c) => c.isActive).length;
  const redemptions = couponsList.reduce((s, c) => s + c.usedCount, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setSaving(true);
    const ok = await saveCoupon({
      code: code.trim().toUpperCase(),
      discountType: type,
      discountValue: Number(val),
      minSpendCents: Math.round(Number(minSpend) * 100),
      maxUses: Number(maxUses),
    });
    setSaving(false);
    if (ok) {
      setOpen(false);
      setCode("");
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Marketing"
        title="Coupons & discounts"
        subtitle="Create promotional codes, cap redemptions and pause campaigns."
        actions={
          <Btn variant="primary" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New coupon
          </Btn>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active codes" value={active} icon={<Ticket className="h-5 w-5" />} sub={`${couponsList.length} total created`} accent="#262626" />
        <StatCard label="Redemptions" value={redemptions} icon={<Percent className="h-5 w-5" />} sub="coupons applied at checkout" accent="#525252" />
        <StatCard
          label="Avg. discount"
          value={
            couponsList.length
              ? `${Math.round(
                  couponsList.filter((c) => c.discountType === "percent").reduce((s, c) => s + c.discountValue, 0) /
                    Math.max(couponsList.filter((c) => c.discountType === "percent").length, 1)
                )}%`
              : "—"
          }
          icon={<DollarSign className="h-5 w-5" />}
          sub="percentage campaigns"
          accent="#737373"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {couponsList.map((c) => {
          const usage = c.maxUses > 0 ? (c.usedCount / c.maxUses) * 100 : 0;
          return (
            <Card key={c.id} hover className="relative overflow-hidden">
              <span
                className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10"
                style={{ background: c.isActive ? "#262626" : "#9a9a9a" }}
              />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <button
                    onClick={() => copy(c.code, "Coupon code")}
                    className="tabular rounded-lg border border-dashed border-[#c9c9c9] bg-[#fafafa] px-3 py-1.5 font-mono text-sm font-extrabold tracking-wider text-[#000000] hover:border-[#000000]"
                  >
                    {copiedKey === c.code ? "COPIED!" : c.code}
                  </button>
                  <p className="mt-2 font-display text-2xl font-extrabold text-[#000000]">
                    {c.discountType === "percent" ? `${c.discountValue}% OFF` : `${formatPrice(c.discountValue)} OFF`}
                  </p>
                </div>
                <Badge tone={c.isActive ? "success" : "neutral"} dot>
                  {c.isActive ? "live" : "paused"}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#666666]">
                  <span>
                    {c.usedCount} / {c.maxUses} redeemed
                  </span>
                  <span>{Math.round(usage)}%</span>
                </div>
                <Progress value={usage} tone={usage > 80 ? "#0a0a0a" : "#000000"} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-[#fafafa] px-2.5 py-2 ring-1 ring-inset ring-[#ececec]">
                  <dt className="text-[#9a9a9a]">Min. spend</dt>
                  <dd className="font-bold text-[#000000]">{formatPrice(c.minSpendCents)}</dd>
                </div>
                <div className="rounded-lg bg-[#fafafa] px-2.5 py-2 ring-1 ring-inset ring-[#ececec]">
                  <dt className="text-[#9a9a9a]">Expires</dt>
                  <dd className="font-bold text-[#000000]">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-[#ececec] pt-3">
                <Toggle checked={c.isActive} onChange={() => toggleCoupon(c)} label={c.isActive ? "Active" : "Paused"} />
                <IconBtn
                  title="Delete coupon"
                  tone="danger"
                  onClick={() => {
                    if (confirm(`Delete coupon ${c.code}?`)) deleteCoupon(c.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
            </Card>
          );
        })}

        <button
          onClick={() => setOpen(true)}
          className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-[18px] border-2 border-dashed border-[#d6d6d6] bg-white/50 p-6 text-center transition-all hover:border-[#000000] hover:bg-white"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f5f5f5] text-[#000000]">
            <Ticket className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold text-[#000000]">Create a coupon</span>
            <span className="mt-1 block text-xs text-[#9a9a9a]">Percentage or fixed-amount discount</span>
          </span>
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create promotional coupon"
        subtitle="Codes apply at checkout and are tracked against usage limits."
        icon={<Ticket className="h-4 w-4" />}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={submit} disabled={saving}>
              {saving ? "Creating…" : "Create coupon"}
            </Btn>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Coupon code" hint="Automatically uppercased. Customers type this at checkout.">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FLASH25"
              className="font-mono tracking-wider"
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Discount type">
              <Select value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")}>
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed amount (cents)</option>
              </Select>
            </Field>
            <Field label={type === "percent" ? "Percent off" : "Amount off (cents)"}>
              <Input type="number" min={1} value={val} onChange={(e) => setVal(e.target.value)} required />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Minimum spend ($)">
              <Input type="number" min={0} step="0.01" value={minSpend} onChange={(e) => setMinSpend(e.target.value)} />
            </Field>
            <Field label="Maximum redemptions">
              <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
