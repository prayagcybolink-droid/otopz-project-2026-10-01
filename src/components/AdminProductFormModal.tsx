"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProductItem, PRODUCT_CATEGORIES, ProductCategory } from "@/types/admin";
import { Btn, Field, Input, Modal, Segmented, Select, Textarea } from "@/components/ui/kit";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { Package, Sparkles } from "lucide-react";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ProductItem | null;
  onSaved: (product: ProductItem) => void;
  onShowToast: (msg: string) => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  onSaved,
  onShowToast,
}: ProductFormModalProps) {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [priceDollars, setPriceDollars] = useState("49.00");
  const [category, setCategory] = useState<ProductCategory>("Automation Tools");
  const [fileFormat, setFileFormat] = useState("ZIP");
  const [fileSizeMb, setFileSizeMb] = useState("18 MB");
  const [version, setVersion] = useState("1.0.0");
  const [coverImage, setCoverImage] = useState("/images/p-automation.jpg");
  const [status, setStatus] = useState<"published" | "draft" | "archived">("published");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setTagline(productToEdit.tagline || "");
      setDescription(productToEdit.description || "");
      setPriceDollars((productToEdit.priceCents / 100).toFixed(2));
      setCategory(productToEdit.category as ProductCategory);
      setFileFormat(productToEdit.fileFormat || "ZIP");
      setFileSizeMb(productToEdit.fileSizeMb || "15 MB");
      setVersion(productToEdit.version || "1.0.0");
      setCoverImage(productToEdit.coverImage || "/images/p-automation.jpg");
      setStatus(productToEdit.status);
    } else {
      setTitle("");
      setTagline("");
      setDescription("");
      setPriceDollars("49.00");
      setCategory("Automation Tools");
      setFileFormat("ZIP");
      setFileSizeMb("18 MB");
      setVersion("1.0.0");
      setCoverImage("/images/p-automation.jpg");
      setStatus("published");
    }
  }, [productToEdit, isOpen]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim() || !coverImage) {
      onShowToast("Title and cover image are required");
      return;
    }

    const priceCents = Math.round(parseFloat(priceDollars || "0") * 100);
    if (isNaN(priceCents) || priceCents < 0) {
      onShowToast("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = productToEdit ? `/api/products/${productToEdit.id}` : "/api/products";
      const method = productToEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          priceCents,
          category,
          fileFormat: fileFormat.trim(),
          fileSizeMb: fileSizeMb.trim(),
          version: version.trim(),
          coverImage: coverImage.trim(),
          status,
        }),
      });

      const data = await res.json();
      if (data.ok && data.product) {
        onShowToast(productToEdit ? "Product updated" : "Product created");
        onSaved(data.product);
        onClose();
      } else {
        onShowToast(data.error || "Failed to save product");
      }
    } catch {
      onShowToast("Network error saving product");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      width="max-w-4xl"
      title={productToEdit ? "Edit product" : "New product"}
      subtitle="Set pricing, delivery details and storefront artwork."
      icon={<Package className="h-4 w-4" />}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={() => handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : productToEdit ? "Save changes" : "Create product"}
          </Btn>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* left: fields */}
        <div className="space-y-4">
          <Field label="Product title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Enterprise n8n Automation Pack"
              required
            />
          </Field>

          <Field label="Tagline" hint="One short line shown on product cards.">
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="45+ battle-tested webhooks and AI agent workflows"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Price (USD)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={priceDollars}
                onChange={(e) => setPriceDollars(e.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Visibility">
            <Segmented<"published" | "draft" | "archived">
              value={status}
              onChange={setStatus}
              options={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="File format">
              <Input value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} placeholder="ZIP" />
            </Field>
            <Field label="Payload size">
              <Input value={fileSizeMb} onChange={(e) => setFileSizeMb(e.target.value)} placeholder="24 MB" />
            </Field>
            <Field label="Version">
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" />
            </Field>
          </div>

          <Field label="Description">
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Features, compatibility, prerequisites…"
            />
          </Field>
        </div>

        {/* right: artwork + preview */}
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#666666]">
              Live preview
            </span>
            <div className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white">
              <div className="relative aspect-[4/3] bg-[#000000]">
                {coverImage && (
                  <Image src={coverImage} alt="Preview" fill sizes="340px" className="object-contain p-4" unoptimized={coverImage.startsWith("/api/media/")} />
                )}
                <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#000000]">
                  v{version || "1.0.0"}
                </span>
              </div>
              <div className="space-y-1 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a9a9a]">{category}</p>
                <p className="line-clamp-2 text-[13px] font-bold leading-snug text-[#000000]">
                  {title || "Product title"}
                </p>
                <p className="tabular font-display text-lg font-extrabold text-[#000000]">
                  ${parseFloat(priceDollars || "0").toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#666666]">
              Product image
            </span>
            <ImagePicker value={coverImage} onChange={setCoverImage} showPreview={false} />
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-[#fafafa] p-3 text-[11px] leading-relaxed text-[#777777] ring-1 ring-inset ring-[#ececec]">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-black" />
            Published products appear instantly in the storefront and can be purchased with an
            auto-issued license key.
          </div>
        </div>
      </form>
    </Modal>
  );
}
