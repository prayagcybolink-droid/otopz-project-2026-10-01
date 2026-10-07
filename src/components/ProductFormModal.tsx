"use client";

import React, { useState, useEffect } from "react";
import { X, UploadCloud, Sparkles, CheckCircle2 } from "lucide-react";
import {
  ProductItem,
  PRODUCT_CATEGORIES,
  COVER_PRESETS,
} from "@/types/foundry";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProductItem | null;
  onSaved: (savedProduct: ProductItem, isEdit: boolean) => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  onSaved,
}: ProductFormModalProps) {
  const [title, setTitle] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priceDollars, setPriceDollars] = useState<string>("69.00");
  const [category, setCategory] = useState<string>("Automation Tools");
  const [fileFormat, setFileFormat] = useState<string>(".JSON, .PDF");
  const [fileSizeMb, setFileSizeMb] = useState<string>("54.0 MB");
  const [version, setVersion] = useState<string>("v1.0.0");
  const [coverImage, setCoverImage] = useState<string>(
    "/images/p-automation.jpg"
  );
  const [status, setStatus] = useState<string>("published");
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setTagline(editingProduct.tagline);
      setDescription(editingProduct.description);
      setPriceDollars((editingProduct.priceCents / 100).toFixed(2));
      setCategory(editingProduct.category);
      setFileFormat(editingProduct.fileFormat);
      setFileSizeMb(editingProduct.fileSizeMb);
      setVersion(editingProduct.version);
      setCoverImage(editingProduct.coverImage);
      setStatus(editingProduct.status);
    } else {
      setTitle("");
      setTagline("");
      setDescription(
        "Complete production-grade digital asset archive crafted with strict optical geometry and commercial multi-seat studio licensing.\n\nIncluded in the download:\n• Full source files and documentation\n• Lifetime minor and patch updates\n• Commercial license for up to 25 seats"
      );
      setPriceDollars("69.00");
      setCategory("Automation Tools");
      setFileFormat(".JSON, .PDF");
      setFileSizeMb("54.0 MB");
      setVersion("v1.0.0");
      setCoverImage("/images/p-automation.jpg");
      setStatus("published");
    }
    setErrorMsg(null);
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Product title is required");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const parsedPriceCents = Math.max(
      0,
      Math.round(parseFloat(priceDollars || "0") * 100)
    );

    const payload = {
      title: title.trim(),
      tagline:
        tagline.trim() ||
        "Architectural digital asset crafted for high-velocity design and engineering teams.",
      description: description.trim(),
      priceCents: isNaN(parsedPriceCents) ? 4900 : parsedPriceCents,
      category,
      fileFormat: fileFormat.trim() || ".JSON, .PDF",
      fileSizeMb: fileSizeMb.trim() || "45.0 MB",
      version: version.trim() || "v1.0.0",
      coverImage: coverImage.trim() || "/images/p-automation.jpg",
      status,
    };

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      onSaved(data.product, Boolean(editingProduct));
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const validCategories = PRODUCT_CATEGORIES.filter((c) => c !== "All");

  return (
    <div className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/50 backdrop-blur-[2px]">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close product form modal"
      />
      <div className="anim-scale-in relative z-10 flex flex-col w-full max-w-2xl max-h-[90vh] rounded-none bg-[#FFFFE3] border border-[#E4E4E4] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFE3] border-b border-[#E4E4E4]">
          <div>
            <span className="font-mono-spec text-[11px] uppercase tracking-wider text-[#0A0A0A] font-semibold">
              OTOPZ Publisher
            </span>
            <h2 className="font-serif-display text-lg font-semibold text-[#0A0A0A]">
              {editingProduct
                ? `Edit Release — ${editingProduct.title}`
                : "Publish New Digital Release"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-none text-[#5E5E5E] hover:text-[#0A0A0A] hover:bg-[#E4E4E4]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="product-crud-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Title & Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                Release Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vektor — Architectural Icon & Grid System"
                className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-mono-spec text-sm text-[#5E5E5E]">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={priceDollars}
                  onChange={(e) => setPriceDollars(e.target.value)}
                  className="w-full h-10 pl-7 pr-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] font-mono-spec text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
              Editorial Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Concise 1-sentence summary displayed on storefront cards..."
              className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>

          {/* Category, Status, Version */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              >
                {validCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                Catalog Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                Release Version
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0.0"
                className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] font-mono-spec text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>
          </div>

          {/* File Format & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                Included File Formats
              </label>
              <input
                type="text"
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
                placeholder=".JSON, .PDF, .TSX"
                className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] font-mono-spec text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
                Package Archive Size
              </label>
              <input
                type="text"
                value={fileSizeMb}
                onChange={(e) => setFileSizeMb(e.target.value)}
                placeholder="64.5 MB"
                className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] font-mono-spec text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>
          </div>

          {/* Cover Artwork Selector + Live Preview */}
          <div className="p-4 rounded-none bg-[#FFFFE3] border border-[#E4E4E4] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                <UploadCloud className="w-4 h-4 text-[#0A0A0A]" />
                16:10 Studio Cover Specimen
              </label>
              <span className="font-mono-spec text-[11px] text-[#8A8A8A]">
                800×500 Vector Artwork
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2 space-y-2">
                <select
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full h-10 px-3 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                >
                  {COVER_PRESETS.map((preset) => (
                    <option key={preset.url} value={preset.url}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Or paste custom cover image URL..."
                  className="w-full h-9 px-3 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] font-mono-spec text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>

              <div className="aspect-square w-full rounded-none overflow-hidden border border-[#D4D4D4] bg-[#FFFFE3]">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E] mb-1.5">
              Technical Specifications &amp; Release Notes
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the architecture, token bindings, included files, and license terms..."
              className="w-full p-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-none bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs text-[#DC2626]">
              {errorMsg}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFE3] border-t border-[#E4E4E4]">
          <div className="flex items-center gap-1.5 text-xs text-[#5E5E5E]">
            <CheckCircle2 className="w-4 h-4 text-[#1B7A43]" />
            <span>Persists immediately to PostgreSQL catalog</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-none text-xs font-medium text-[#5E5E5E] hover:text-[#0A0A0A] hover:bg-[#E4E4E4]/50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-crud-form"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-none text-xs font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#333333] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {saving
                ? "Saving Release..."
                : editingProduct
                ? "Save Changes"
                : "Publish Digital Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
