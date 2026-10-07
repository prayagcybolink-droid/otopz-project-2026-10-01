"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Search,
  Sparkles,
  FileCode2,
  ExternalLink,
  FolderArchive,
} from "lucide-react";
import {
  OrderItem,
  ProductItem,
  UserSession,
  formatPrice,
} from "@/types/foundry";

interface MyLibraryViewProps {
  orders: OrderItem[];
  products: ProductItem[];
  currentUser: UserSession | null;
  lastCheckoutEmail: string | null;
  onInspectProduct: (product: ProductItem) => void;
  onExploreStorefront: () => void;
}

export function MyLibraryView({
  orders,
  products,
  currentUser,
  lastCheckoutEmail,
  onInspectProduct,
  onExploreStorefront,
}: MyLibraryViewProps) {
  const [filterMode, setFilterMode] = useState<"mine" | "all">("mine");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeEmail = (
    lastCheckoutEmail ||
    currentUser?.email ||
    "marcus@studio.co"
  ).toLowerCase();

  const displayedOrders = orders.filter((ord) => {
    if (filterMode === "mine") {
      const matchesEmail = ord.buyerEmail.toLowerCase() === activeEmail;
      if (!matchesEmail) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ord.productTitle.toLowerCase().includes(q) ||
        ord.licenseKey.toLowerCase().includes(q) ||
        ord.buyerEmail.toLowerCase().includes(q) ||
        ord.productCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="anim-fade-up relative overflow-hidden p-6 sm:p-8 rounded-none bg-[#FFFFE3] bg-grid border border-[#E4E4E4] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"><div className="pointer-events-none absolute -top-20 -right-10 w-64 h-64 rounded-full bg-[#262626]/15 blur-3xl anim-orb" />
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] text-xs font-mono-spec text-[#262626]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B7A43]" />
            <span>CRYPTOGRAPHIC ASSET VAULT // {activeEmail}</span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#0A0A0A]">
            My Purchases &amp; Licensed Library
          </h1>
          <p className="text-sm text-[#5E5E5E] leading-relaxed">
            Access your DRM-free release archives, copy multi-seat studio license keys, and pull verified version updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-none p-1 bg-[#FFFFE3] border border-[#D4D4D4]">
            <button
              type="button"
              onClick={() => setFilterMode("mine")}
              className={`px-3 py-1.5 rounded-none text-xs font-medium transition-colors cursor-pointer ${
                filterMode === "mine"
                  ? "bg-[#0A0A0A] text-[#FFFFE3]"
                  : "text-[#5E5E5E] hover:text-[#0A0A0A]"
              }`}
            >
              My Vault ({activeEmail.split("@")[0]})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-none text-xs font-medium transition-colors cursor-pointer ${
                filterMode === "all"
                  ? "bg-[#0A0A0A] text-[#FFFFE3]"
                  : "text-[#5E5E5E] hover:text-[#0A0A0A]"
              }`}
            >
              All Studio Licenses ({orders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by product title, license key (OTOPZ-...), or format..."
            className="w-full h-10 pl-10 pr-4 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-[#5E5E5E] font-mono-spec">
          <span>
            Showing <strong className="text-[#0A0A0A]">{displayedOrders.length}</strong>{" "}
            licensed releases
          </span>
        </div>
      </div>

      {/* Purchased Assets Grid */}
      {displayedOrders.length === 0 ? (
        <div className="p-12 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FFFFE3] border border-[#E4E4E4] flex items-center justify-center mx-auto text-[#8A8A8A]">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif-display text-lg font-semibold text-[#0A0A0A]">
              No Licensed Releases Found for {activeEmail}
            </h3>
            <p className="text-xs text-[#5E5E5E]">
              Purchase any digital asset from the Storefront to generate an instant cryptographic license key, or switch to &ldquo;All Studio Licenses&rdquo; above.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className="px-4 py-2 rounded-none text-xs font-medium bg-[#FFFFE3] text-[#0A0A0A] border border-[#D4D4D4] hover:border-[#0A0A0A] transition-colors cursor-pointer"
            >
              Show All {orders.length} Demo Licenses
            </button>
            <button
              type="button"
              onClick={onExploreStorefront}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#333333] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Browse Storefront Catalog
            </button>
          </div>
        </div>
      ) : (
        <div className="stagger grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {displayedOrders.map((ord) => {
            const matchingProduct = products.find(
              (p) => p.id === ord.productId
            );

            return (
              <div
                key={ord.id}
                className="card-lift flex flex-col rounded-none bg-[#FFFFE3] border border-[#E4E4E4] overflow-hidden hover:border-[#0A0A0A]/40 shadow-xs"
              >
                {/* Top Row with Cover Thumbnail & Metadata */}
                <div className="p-5 flex items-start gap-4 border-b border-[#E4E4E4]/80">
                  <img
                    src={ord.productCoverImage}
                    alt={ord.productTitle}
                    className="w-16 h-16 rounded-none object-contain border border-[#E4E4E4] bg-[#FFFFE3] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-none text-[11px] font-medium bg-[#FFFFE3] text-[#0A0A0A]">
                        {ord.productCategory}
                      </span>
                      <span className="font-mono-spec text-[11px] text-[#5E5E5E]">
                        {ord.productVersion}
                      </span>
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-none text-[10px] font-mono-spec uppercase font-semibold ${
                          ord.status === "completed"
                            ? "bg-[#1B7A43]/10 text-[#1B7A43]"
                            : "bg-[#D97706]/15 text-[#D97706]"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <h3 className="font-serif-display text-base font-semibold text-[#0A0A0A] mt-1.5 truncate">
                      {ord.productTitle}
                    </h3>

                    <div className="flex items-center gap-3 mt-1 text-xs text-[#5E5E5E] font-mono-spec">
                      <span className="inline-flex items-center gap-1">
                        <FileCode2 className="w-3.5 h-3.5 text-[#8A8A8A]" />
                        {ord.productFileFormat}
                      </span>
                      <span>•</span>
                      <span>{ord.productFileSizeMb}</span>
                      <span>•</span>
                      <span>{formatPrice(ord.amountCents)}</span>
                    </div>
                  </div>
                </div>

                {/* Cryptographic License Key Strip */}
                <div className="px-5 py-3.5 bg-[#FFFFE3]/70 border-b border-[#E4E4E4] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <KeyRound className="w-4 h-4 text-[#0A0A0A] shrink-0" />
                    <div className="truncate">
                      <span className="block text-[10px] uppercase tracking-wider text-[#8A8A8A]">
                        Commercial License Key ({ord.buyerEmail})
                      </span>
                      <span className="font-mono-spec text-xs font-semibold text-[#0A0A0A] tracking-wider">
                        {ord.licenseKey}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(ord.licenseKey)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium bg-[#FFFFE3] border border-[#D4D4D4] text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedKey === ord.licenseKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1B7A43]" />
                        <span className="text-[#1B7A43]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action Footer */}
                <div className="p-4 bg-[#FFFFE3] flex items-center justify-between gap-3 mt-auto">
                  {matchingProduct ? (
                    <button
                      type="button"
                      onClick={() => onInspectProduct(matchingProduct)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5E5E5E] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Specs &amp; Write Review</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[#8A8A8A] font-mono-spec">
                      Order #{ord.id}
                    </span>
                  )}

                  <a
                    href={`/api/download/${ord.id}`}
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#333333] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Package ({ord.productFileSizeMb})</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
