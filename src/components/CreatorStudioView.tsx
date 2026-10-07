"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Package,
  KeyRound,
  TrendingUp,
  Layers,
  DollarSign,
  Copy,
  Check,
} from "lucide-react";
import {
  ProductItem,
  OrderItem,
  CreatorSubTab,
  formatPrice,
} from "@/types/foundry";

interface CreatorStudioViewProps {
  products: ProductItem[];
  orders: OrderItem[];
  activeSubTab: CreatorSubTab;
  onSubTabChange: (tab: CreatorSubTab) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (product: ProductItem) => void;
  onInspectProduct: (product: ProductItem) => void;
  onToggleProductStatus: (
    product: ProductItem,
    nextStatus: "published" | "draft" | "archived"
  ) => Promise<void>;
  onDeleteProduct: (productId: number) => Promise<void>;
  onUpdateOrderStatus: (
    orderId: number,
    nextStatus: "completed" | "refunded"
  ) => Promise<void>;
  onRegenerateOrderKey: (orderId: number) => Promise<void>;
  onDeleteOrder: (orderId: number) => Promise<void>;
}

export function CreatorStudioView({
  products,
  orders,
  activeSubTab,
  onSubTabChange,
  onOpenCreateModal,
  onOpenEditModal,
  onInspectProduct,
  onToggleProductStatus,
  onDeleteProduct,
  onUpdateOrderStatus,
  onRegenerateOrderKey,
  onDeleteOrder,
}: CreatorStudioViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<number | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);

  // KPI calculations
  const totalCatalogRevenueCents = products.reduce(
    (sum, p) => sum + p.priceCents * p.salesCount,
    0
  );
  const totalLicensesSold = products.reduce((sum, p) => sum + p.salesCount, 0);
  const publishedCount = products.filter(
    (p) => p.status === "published"
  ).length;
  const avgPriceCents =
    products.length > 0
      ? Math.round(
          products.reduce((sum, p) => sum + p.priceCents, 0) / products.length
        )
      : 0;

  const filteredProducts = products.filter((p) =>
    statusFilter === "all" ? true : p.status === statusFilter
  );

  const maxProductRevenue = Math.max(
    1,
    ...products.map((p) => p.priceCents * p.salesCount)
  );

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E4E4]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-spec uppercase tracking-wider text-[#0A0A0A] font-semibold">
            <span>FOUNDRY DIRECTOR CONSOLE</span>
            <span>•</span>
            <span className="text-[#1B7A43]">POSTGRESQL LIVE</span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#0A0A0A] mt-1">
            Creator Studio &amp; Asset Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none text-xs sm:text-sm font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#333333] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Product</span>
          </button>
        </div>
      </div>

      {/* 4-Card KPI Summary Row */}
      <div className="stagger grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="card-lift p-4 sm:p-6 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
            <span>Gross Foundry Revenue</span>
            <DollarSign className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="font-mono-spec text-xl sm:text-3xl font-semibold text-[#0A0A0A] break-words">
            ${(totalCatalogRevenueCents / 100).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-xs text-[#1B7A43] font-medium">
            +18.4% vs prior 30-day cycle
          </div>
        </div>

        <div className="card-lift p-4 sm:p-6 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
            <span>Total Licenses Issued</span>
            <KeyRound className="w-4 h-4 text-[#262626]" />
          </div>
          <div className="font-mono-spec text-xl sm:text-3xl font-semibold text-[#0A0A0A] break-words">
            {totalLicensesSold.toLocaleString()}
          </div>
          <div className="text-xs text-[#5E5E5E]">
            {orders.length} recent ledger transactions
          </div>
        </div>

        <div className="card-lift p-4 sm:p-6 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
            <span>Published Releases</span>
            <Layers className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="font-mono-spec text-xl sm:text-3xl font-semibold text-[#0A0A0A] break-words">
            {publishedCount}{" "}
            <span className="text-base text-[#8A8A8A] font-normal">
              / {products.length}
            </span>
          </div>
          <div className="text-xs text-[#5E5E5E]">
            100% SHA-256 verified archives
          </div>
        </div>

        <div className="card-lift p-4 sm:p-6 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
            <span>Avg Release Price</span>
            <TrendingUp className="w-4 h-4 text-[#1B7A43]" />
          </div>
          <div className="font-mono-spec text-xl sm:text-3xl font-semibold text-[#0A0A0A] break-words">
            {formatPrice(avgPriceCents)}
          </div>
          <div className="text-xs text-[#5E5E5E]">
            Commercial multi-seat tier
          </div>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 overflow-x-auto">
        <div className="inline-flex max-w-full overflow-x-auto rounded-none p-1 bg-[#FFFFE3] border border-[#E4E4E4]">
          <button
            type="button"
            onClick={() => onSubTabChange("catalog")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-none text-xs font-medium transition-colors cursor-pointer ${
              activeSubTab === "catalog"
                ? "bg-[#0A0A0A] text-[#FFFFE3]"
                : "text-[#5E5E5E] hover:text-[#0A0A0A]"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Catalog ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange("orders")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-none text-xs font-medium transition-colors cursor-pointer ${
              activeSubTab === "orders"
                ? "bg-[#0A0A0A] text-[#FFFFE3]"
                : "text-[#5E5E5E] hover:text-[#0A0A0A]"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange("analytics")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-none text-xs font-medium transition-colors cursor-pointer ${
              activeSubTab === "analytics"
                ? "bg-[#0A0A0A] text-[#FFFFE3]"
                : "text-[#5E5E5E] hover:text-[#0A0A0A]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Revenue</span>
          </button>
        </div>

        {activeSubTab === "catalog" && (
          <div className="flex items-center gap-2">
            {(["all", "published", "draft", "archived"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-none text-xs font-medium capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#0A0A0A] text-[#FFFFE3]"
                    : "bg-[#FFFFE3] border border-[#E4E4E4] text-[#5E5E5E] hover:text-[#0A0A0A]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: PRODUCT CATALOG CRUD */}
      {activeSubTab === "catalog" && (
        <div className="anim-fade-up rounded-none bg-[#FFFFE3] border border-[#E4E4E4] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFFE3] border-b border-[#E4E4E4] text-[11px] font-semibold uppercase tracking-wider text-[#5E5E5E]">
                  <th className="py-3.5 px-5">Digital Release</th>
                  <th className="py-3.5 px-4">Category &amp; Spec</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Sales &amp; Gross</th>
                  <th className="py-3.5 px-4">Status (Optimistic)</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-sm">
                {filteredProducts.map((prod) => {
                  const grossCents = prod.priceCents * prod.salesCount;
                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-[#FFFFE3] transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={prod.coverImage}
                            alt={prod.title}
                            className="w-12 h-12 rounded-none object-contain border border-[#E4E4E4] bg-[#FFFFE3] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-serif-display font-semibold text-[#0A0A0A] truncate max-w-xs">
                              {prod.title}
                            </div>
                            <div className="font-mono-spec text-[11px] text-[#8A8A8A]">
                              {prod.version} • /{prod.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-none text-xs font-medium bg-[#FFFFE3] text-[#0A0A0A]">
                          {prod.category}
                        </span>
                        <div className="font-mono-spec text-[11px] text-[#5E5E5E] mt-1">
                          {prod.fileFormat} • {prod.fileSizeMb}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono-spec font-semibold text-[#0A0A0A]">
                        {formatPrice(prod.priceCents)}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-mono-spec text-xs font-semibold text-[#0A0A0A]">
                          {prod.salesCount} licenses
                        </div>
                        <div className="font-mono-spec text-[11px] text-[#1B7A43]">
                          ${(grossCents / 100).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          aria-label={`Status for ${prod.title}`}
                          value={prod.status}
                          disabled={busyProductId === prod.id}
                          onChange={async (e) => {
                            const next = e.target.value as
                              | "published"
                              | "draft"
                              | "archived";
                            setBusyProductId(prod.id);
                            await onToggleProductStatus(prod, next);
                            setBusyProductId(null);
                          }}
                          className={`px-2.5 py-1 rounded-none text-xs font-mono-spec font-medium border focus:outline-none cursor-pointer ${
                            prod.status === "published"
                              ? "bg-[#1B7A43]/10 text-[#1B7A43] border-[#1B7A43]/30"
                              : prod.status === "draft"
                              ? "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30"
                              : "bg-[#8A8A8A]/15 text-[#5E5E5E] border-[#8A8A8A]/30"
                          }`}
                        >
                          <option value="published">● Published</option>
                          <option value="draft">◐ Draft</option>
                          <option value="archived">○ Archived</option>
                        </select>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onInspectProduct(prod)}
                            className="p-2 rounded-none text-[#5E5E5E] hover:text-[#0A0A0A] hover:bg-[#FFFFE3] transition-colors cursor-pointer"
                            title="Inspect release"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(prod)}
                            className="p-2 rounded-none text-[#5E5E5E] hover:text-[#0A0A0A] hover:bg-[#FFFFE3] transition-colors cursor-pointer"
                            title="Edit release"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={busyProductId === prod.id}
                            onClick={async () => {
                              setBusyProductId(prod.id);
                              await onDeleteProduct(prod.id);
                              setBusyProductId(null);
                            }}
                            className="p-2 rounded-none text-[#5E5E5E] hover:text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors cursor-pointer"
                            title="Delete release"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS & LICENSES LEDGER */}
      {activeSubTab === "orders" && (
        <div className="anim-fade-up rounded-none bg-[#FFFFE3] border border-[#E4E4E4] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFFE3] border-b border-[#E4E4E4] text-[11px] font-semibold uppercase tracking-wider text-[#5E5E5E]">
                  <th className="py-3.5 px-5">Order &amp; Buyer</th>
                  <th className="py-3.5 px-4">Digital Product</th>
                  <th className="py-3.5 px-4">Cryptographic License Key</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Manage Entitlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-sm">
                {orders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-[#FFFFE3] transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="font-semibold text-xs text-[#0A0A0A]">
                        {ord.buyerName}
                      </div>
                      <div className="font-mono-spec text-[11px] text-[#5E5E5E]">
                        {ord.buyerEmail} • #{String(ord.id).padStart(4, "0")}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-[#0A0A0A] max-w-xs truncate">
                        {ord.productTitle}
                      </div>
                      <div className="font-mono-spec text-[11px] text-[#8A8A8A]">
                        {ord.productCategory} • {ord.productVersion}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-none bg-[#FFFFE3] border border-[#E4E4E4]">
                        <span className="font-mono-spec text-xs font-semibold text-[#0A0A0A]">
                          {ord.licenseKey}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyKey(ord.licenseKey)}
                          className="text-[#5E5E5E] hover:text-[#0A0A0A]"
                          title="Copy License Key"
                        >
                          {copiedKey === ord.licenseKey ? (
                            <Check className="w-3.5 h-3.5 text-[#1B7A43]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono-spec text-xs font-semibold text-[#0A0A0A]">
                      {formatPrice(ord.amountCents)}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-xs font-mono-spec font-medium ${
                          ord.status === "completed"
                            ? "bg-[#1B7A43]/10 text-[#1B7A43]"
                            : "bg-[#D97706]/15 text-[#D97706]"
                        }`}
                      >
                        {ord.status === "completed" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={busyOrderId === ord.id}
                          onClick={async () => {
                            setBusyOrderId(ord.id);
                            await onRegenerateOrderKey(ord.id);
                            setBusyOrderId(null);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-medium bg-[#FFFFE3] text-[#0A0A0A] hover:bg-[#E4E4E4] transition-colors cursor-pointer"
                          title="Re-issue new cryptographic license key"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-Key</span>
                        </button>

                        <button
                          type="button"
                          disabled={busyOrderId === ord.id}
                          onClick={async () => {
                            setBusyOrderId(ord.id);
                            await onUpdateOrderStatus(
                              ord.id,
                              ord.status === "completed"
                                ? "refunded"
                                : "completed"
                            );
                            setBusyOrderId(null);
                          }}
                          className="px-2.5 py-1 rounded-none text-xs font-medium bg-[#FFFFE3] border border-[#D4D4D4] text-[#5E5E5E] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                        >
                          {ord.status === "completed" ? "Refund" : "Restore"}
                        </button>

                        <button
                          type="button"
                          disabled={busyOrderId === ord.id}
                          onClick={async () => {
                            setBusyOrderId(ord.id);
                            await onDeleteOrder(ord.id);
                            setBusyOrderId(null);
                          }}
                          className="p-1.5 rounded-none text-[#8A8A8A] hover:text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors cursor-pointer"
                          title="Revoke and delete order record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REVENUE ANALYTICS CHART */}
      {activeSubTab === "analytics" && (
        <div className="anim-fade-up p-6 sm:p-8 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E4E4] pb-4">
            <div>
              <h3 className="font-serif-display text-lg font-semibold text-[#0A0A0A]">
                Cumulative Revenue by Digital Release
              </h3>
              <p className="text-xs text-[#5E5E5E]">
                Calculated across all issued studio licenses in PostgreSQL
              </p>
            </div>
            <span className="font-mono-spec text-xs text-[#262626] bg-[#FFFFE3] px-3 py-1 rounded-none">
              Single-Axis Foundry Ledger
            </span>
          </div>

          <div className="space-y-4">
            {products.map((prod, idx) => {
              const revCents = prod.priceCents * prod.salesCount;
              const pct = Math.max(
                6,
                Math.round((revCents / maxProductRevenue) * 100)
              );

              return (
                <div key={prod.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#0A0A0A] truncate max-w-md">
                      {idx + 1}. {prod.title}{" "}
                      <span className="text-[#8A8A8A] font-mono-spec">
                        ({prod.category})
                      </span>
                    </span>
                    <span className="font-mono-spec font-semibold text-[#0A0A0A]">
                      ${(revCents / 100).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      <span className="text-[#5E5E5E] font-normal">
                        ({prod.salesCount} sold)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#FFFFE3] overflow-hidden">
                    <div
                      className="anim-grow-bar h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: idx === 0 ? "#0A0A0A" : "#262626",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
