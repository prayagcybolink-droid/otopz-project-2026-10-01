"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ArrowRight,
  KeyRound,
  CreditCard,
} from "lucide-react";
import {
  ProductItem,
  OrderItem,
  UserSession,
  formatPrice,
} from "@/types/foundry";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: ProductItem[];
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  currentUser: UserSession | null;
  onOrderSuccess: (createdOrders: OrderItem[], buyerEmail: string) => void;
  onGoToLibrary: () => void;
}

export function CheckoutDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  currentUser,
  onOrderSuccess,
  onGoToLibrary,
}: CheckoutDrawerProps) {
  const [buyerName, setBuyerName] = useState<string>(
    currentUser?.name || "Marcus Sterling"
  );
  const [buyerEmail, setBuyerEmail] = useState<string>(
    currentUser?.email || "marcus@studio.co"
  );
  const [cardNumber, setCardNumber] = useState<string>("4242 •••• •••• 4242");
  const [processing, setProcessing] = useState<boolean>(false);
  const [completedOrders, setCompletedOrders] = useState<OrderItem[] | null>(
    null
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setBuyerName(currentUser.name);
      setBuyerEmail(currentUser.email);
    }
  }, [currentUser]);

  // Reset completed state when drawer reopens with new items
  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      setCompletedOrders(null);
      setErrorMsg(null);
    }
  }, [isOpen, cartItems.length]);

  if (!isOpen) return null;

  const subtotalCents = cartItems.reduce((sum, item) => sum + item.priceCents, 0);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: buyerName.trim() || "Studio Buyer",
          buyerEmail: buyerEmail.trim() || "marcus@studio.co",
          productIds: cartItems.map((item) => item.id),
          productId: cartItems[0].id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      const issued: OrderItem[] = data.orders || [data.order];
      setCompletedOrders(issued);
      onOrderSuccess(issued, buyerEmail.trim() || "marcus@studio.co");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to complete order"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="anim-fade-in fixed inset-0 z-50 flex justify-end bg-[#0A0A0A]/50 backdrop-blur-[2px]">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close checkout backdrop"
      />
      <aside className="anim-slide-right relative z-10 flex h-full w-full max-w-[480px] flex-col bg-[#FFFFE3] border-l border-[#E4E4E4] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFE3] border-b border-[#E4E4E4]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#0A0A0A]" />
            <h2 className="font-serif-display text-lg font-semibold text-[#0A0A0A]">
              {completedOrders
                ? "Instant License & Asset Receipt"
                : `Studio Checkout (${cartItems.length})`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-none text-[#5E5E5E] hover:text-[#0A0A0A] hover:bg-[#FFFFE3] transition-colors"
            aria-label="Close checkout drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {completedOrders ? (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="anim-scale-in p-5 rounded-none bg-[#262626] text-[#FFFFE3] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D4D4D4]" />
                  <span className="font-mono-spec text-xs uppercase tracking-wider text-[#D4D4D4]">
                    Transaction Verified &amp; Persisted
                  </span>
                </div>
                <h3 className="font-serif-display text-xl font-semibold">
                  Your Digital Assets Are Ready
                </h3>
                <p className="text-xs text-[#FFFFE3]/80 leading-relaxed">
                  Commercial multi-seat licenses have been registered to{" "}
                  <span className="font-mono-spec underline">
                    {completedOrders[0]?.buyerEmail}
                  </span>
                  . Copy your cryptographic keys or download the release archives below.
                </p>
              </div>

              {/* Issued Licenses List */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                  Issued Entitlements ({completedOrders.length})
                </h4>
                {completedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-mono-spec text-[#8A8A8A]">
                          ORDER #{String(ord.id).padStart(4, "0")} •{" "}
                          {ord.productFileFormat} ({ord.productFileSizeMb})
                        </span>
                        <h5 className="font-serif-display text-base font-semibold text-[#0A0A0A] mt-0.5">
                          {ord.productTitle}
                        </h5>
                      </div>
                      <span className="font-mono-spec text-sm font-semibold text-[#0A0A0A]">
                        {formatPrice(ord.amountCents)}
                      </span>
                    </div>

                    {/* License Key Box */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-none bg-[#FFFFE3] border border-[#D4D4D4]">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-[#0A0A0A]" />
                        <span className="font-mono-spec text-xs font-semibold text-[#0A0A0A] tracking-wider">
                          {ord.licenseKey}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(ord.licenseKey)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#0A0A0A] hover:text-[#6B6B6B] transition-colors cursor-pointer"
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

                    {/* Direct Download Link */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#1B7A43] font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        SHA-256 Verified Package
                      </span>
                      <a
                        href={`/api/download/${ord.id}`}
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#333333] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Asset ({ord.productVersion})
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Go to My Library CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearCart();
                    onGoToLibrary();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-none text-sm font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  <span>Open in My Purchases &amp; Library</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FFFFE3] border border-[#E4E4E4] flex items-center justify-center mx-auto text-[#8A8A8A]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-display text-lg font-semibold text-[#0A0A0A]">
                  Your Studio Bag is Empty
                </h3>
                <p className="text-xs text-[#5E5E5E] max-w-xs mx-auto">
                  Select any architectural UI kit, boilerplate, or typeface from the catalog to issue an instant license.
                </p>
              </div>
            </div>
          ) : (
            <form
              id="checkout-form"
              onSubmit={handleCheckoutSubmit}
              className="space-y-6"
            >
              {/* Selected Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                    Selected Digital Releases
                  </span>
                  {cartItems.length > 1 && (
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-xs text-[#8A8A8A] hover:text-[#DC2626] transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 p-3 rounded-none bg-[#FFFFE3] border border-[#E4E4E4]"
                  >
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-14 h-14 rounded-none object-contain border border-[#E4E4E4] bg-[#FFFFE3] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#0A0A0A] truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 font-mono-spec text-[11px] text-[#5E5E5E]">
                        <span>{item.fileFormat}</span>
                        <span>•</span>
                        <span>{item.fileSizeMb}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono-spec text-sm font-semibold text-[#0A0A0A]">
                        {formatPrice(item.priceCents)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-[#8A8A8A] hover:text-[#DC2626] transition-colors"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Licensee Details */}
              <div className="space-y-4 pt-2 border-t border-[#E4E4E4]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                  Licensee &amp; Delivery Destination
                </h3>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                    Licensee Full Name or Studio
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Marcus Sterling"
                    className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                    Delivery &amp; License Vault Email
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="marcus@studio.co"
                    className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                  />
                  <p className="mt-1 text-[11px] text-[#8A8A8A]">
                    Your cryptographic license key and download archive will be bound to this email.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                    Instant Studio Payment Method
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full h-10 pl-9 pr-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] font-mono-spec text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                    />
                    <CreditCard className="w-4 h-4 text-[#5E5E5E] absolute left-3 top-3" />
                    <span className="absolute right-3 top-2.5 text-[11px] font-mono-spec text-[#1B7A43] font-medium">
                      TEST SANDBOX
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#5E5E5E]">
                  <span>Commercial Studio License (25 seats)</span>
                  <span className="font-mono-spec text-[#1B7A43]">Included</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5E5E5E]">
                  <span>Lifetime Minor &amp; Patch Updates</span>
                  <span className="font-mono-spec text-[#1B7A43]">Included</span>
                </div>
                <div className="pt-2 border-t border-[#E4E4E4] flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#0A0A0A]">
                    Total Due Today
                  </span>
                  <span className="font-mono-spec text-xl font-semibold text-[#0A0A0A]">
                    {formatPrice(subtotalCents)}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-none bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs text-[#DC2626]">
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer CTA */}
        {!completedOrders && cartItems.length > 0 && (
          <div className="px-6 py-4 bg-[#FFFFE3] border-t border-[#E4E4E4] space-y-2.5">
            <button
              type="submit"
              form="checkout-form"
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-none text-sm font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#333333] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              {processing
                ? "Issuing Cryptographic License..."
                : `Complete Purchase — ${formatPrice(subtotalCents)}`}
            </button>
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#8A8A8A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B7A43]" />
              <span>Instant delivery • 256-bit SHA checksum • DRM-free archives</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
