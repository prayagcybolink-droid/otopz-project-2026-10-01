"use client";

import React, { useState } from "react";
import {
  X,
  Star,
  ShieldCheck,
  FileCode2,
  HardDrive,
  GitBranch,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Send,
} from "lucide-react";
import { ProductItem, UserSession, formatPrice } from "@/types/foundry";

interface ProductDetailDrawerProps {
  product: ProductItem | null;
  onClose: () => void;
  onBuyNow: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem) => void;
  currentUser: UserSession | null;
  onReviewSubmitted: (productId: number) => void;
}

export function ProductDetailDrawer({
  product,
  onClose,
  onBuyNow,
  onAddToCart,
  currentUser,
  onReviewSubmitted,
}: ProductDetailDrawerProps) {
  const [rating, setRating] = useState<number>(5);
  const [authorName, setAuthorName] = useState<string>(
    currentUser?.name || "Marcus Sterling"
  );
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  if (!product) return null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          authorName: authorName.trim() || currentUser?.name || "Verified Buyer",
          rating,
          comment: comment.trim(),
        }),
      });
      if (res.ok) {
        setComment("");
        setReviewSuccess(true);
        onReviewSubmitted(product.id);
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="anim-fade-in fixed inset-0 z-50 flex justify-end bg-[#0A0A0A]/50 backdrop-blur-[2px]">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close backdrop"
      />
      <aside className="anim-slide-right relative z-10 flex h-full w-full max-w-[560px] flex-col bg-[#FFFFE3] border-l border-[#E4E4E4] shadow-2xl overflow-hidden">
        {/* Top Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFE3]/95 border-b border-[#E4E4E4] backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-medium bg-[#FFFFE3] text-[#0A0A0A] border border-[#E4E4E4]">
              {product.category}
            </span>
            <span className="font-mono-spec text-xs text-[#5E5E5E] bg-[#FFFFE3] px-2 py-0.5 rounded-none">
              {product.version}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-none text-[#5E5E5E] hover:text-[#0A0A0A] hover:bg-[#FFFFE3] transition-colors"
            aria-label="Close product inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Cover Art — full image, never cropped */}
          <div className="relative aspect-square w-full rounded-none overflow-hidden border border-[#E4E4E4] bg-[#FFFFE3]">
            <img
              src={product.coverImage}
              alt={product.title}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-3 right-3 bg-[#0A0A0A]/90 text-[#FFFFE3] px-3 py-1 rounded-none font-mono-spec text-xs border border-[#FFFFE3]/15">
              {product.salesCount} licenses issued
            </div>
          </div>

          {/* Title & Tagline */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-serif-display text-2xl font-semibold text-[#0A0A0A] leading-snug">
                {product.title}
              </h2>
              <div className="font-mono-spec text-2xl font-semibold text-[#0A0A0A] shrink-0">
                {formatPrice(product.priceCents)}
              </div>
            </div>
            <p className="mt-2 text-sm text-[#5E5E5E] leading-relaxed">
              {product.tagline}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-[#5E5E5E]">
              <span className="inline-flex items-center gap-1 text-[#0A0A0A] font-medium">
                <Star className="w-3.5 h-3.5 fill-[#0A0A0A] text-[#0A0A0A]" />
                {product.avgRating.toFixed(1)}
                <span className="text-[#8A8A8A]">
                  ({product.reviewCount} verified reviews)
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-[#1B7A43] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                SHA-256 Verified Archive
              </span>
            </div>
          </div>

          {/* Technical Spec Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-none bg-[#FFFFE3] border border-[#E4E4E4]">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8A8A8A] font-medium">
                <FileCode2 className="w-3.5 h-3.5 text-[#5E5E5E]" />
                Format
              </div>
              <div className="mt-1 font-mono-spec text-xs font-semibold text-[#0A0A0A]">
                {product.fileFormat}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8A8A8A] font-medium">
                <HardDrive className="w-3.5 h-3.5 text-[#5E5E5E]" />
                Archive Size
              </div>
              <div className="mt-1 font-mono-spec text-xs font-semibold text-[#0A0A0A]">
                {product.fileSizeMb}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8A8A8A] font-medium">
                <GitBranch className="w-3.5 h-3.5 text-[#5E5E5E]" />
                Release
              </div>
              <div className="mt-1 font-mono-spec text-xs font-semibold text-[#0A0A0A]">
                {product.version}
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A8A8A]">
              Architectural Overview & Included Files
            </h3>
            <div className="text-sm text-[#0A0A0A]/90 leading-relaxed whitespace-pre-line bg-[#FFFFE3]/60 p-4 rounded-none border border-[#E4E4E4]">
              {product.description}
            </div>
          </div>

          {/* Customer Reviews & Submit Review Form */}
          <div className="pt-4 border-t border-[#E4E4E4] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-lg font-semibold text-[#0A0A0A]">
                Verified Studio Reviews ({product.reviews?.length || 0})
              </h3>
              <div className="flex items-center gap-1 text-xs font-mono-spec text-[#0A0A0A]">
                <Star className="w-4 h-4 fill-[#0A0A0A] text-[#0A0A0A]" />
                <span>{product.avgRating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {/* Review Submission Form */}
            <form
              onSubmit={handleReviewSubmit}
              className="p-4 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                  Leave a Verified Review
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 focus:outline-none"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          star <= rating
                            ? "fill-[#0A0A0A] text-[#0A0A0A]"
                            : "text-[#8A8A8A]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name & Role (e.g. Alex Rivera — Design Lead)"
                  className="w-full h-9 px-3 text-xs rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                  required
                />
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share how this digital asset performed in your workflow..."
                  className="w-full p-3 text-xs rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                {reviewSuccess ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B7A43]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Review published to product ledger!
                  </span>
                ) : (
                  <span className="text-[11px] text-[#8A8A8A]">
                    Publicly attributed with verified license badge
                  </span>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none text-xs font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#262626] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  {submitting ? "Posting..." : "Post Review"}
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-3">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0A0A0A]">
                        {rev.authorName}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star
                            key={idx}
                            className="w-3 h-3 fill-[#0A0A0A] text-[#0A0A0A]"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#5E5E5E] leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8A8A8A] italic">
                  No reviews yet. Be the first studio member to review this release.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="px-6 py-4 bg-[#FFFFE3] border-t border-[#E4E4E4] flex items-center gap-3">
          <button
            onClick={() => onAddToCart(product)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-sm font-medium bg-[#FFFFE3] text-[#0A0A0A] border border-[#D4D4D4] hover:border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Bag
          </button>
          <button
            onClick={() => onBuyNow(product)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none text-sm font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#333333] transition-colors shadow-sm cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Buy &amp; Instant Download — </span><span className="sm:hidden">Buy Now — </span>{formatPrice(product.priceCents)}
          </button>
        </div>
      </aside>
    </div>
  );
}
