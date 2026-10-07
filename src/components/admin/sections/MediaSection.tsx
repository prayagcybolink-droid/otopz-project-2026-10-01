"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAdmin } from "../AdminContext";
import {
  Btn,
  Card,
  EmptyState,
  IconBtn,
  PageHeader,
  SearchInput,
  StatCard,
  cx,
} from "@/components/ui/kit";
import { uploadImage, validateImageFile } from "@/components/ui/ImagePicker";
import { formatBytes } from "@/types/admin";
import {
  Images,
  UploadCloud,
  Trash2,
  Check,
  HardDrive,
  Package,
  Loader2,
  Link2,
  Maximize2,
} from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function MediaSection() {
  const { mediaList, addMedia, deleteMedia, products, copy, copiedKey, showToast } = useAdmin();
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<{ name: string; pct: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      mediaList.filter((m) =>
        search.trim() ? m.fileName.toLowerCase().includes(search.toLowerCase()) : true
      ),
    [mediaList, search]
  );

  const totalBytes = mediaList.reduce((s, m) => s + m.sizeBytes, 0);
  const usedUrls = useMemo(() => new Set(products.map((p) => p.coverImage)), [products]);
  const inUse = mediaList.filter((m) => usedUrls.has(m.url)).length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const invalid = list.map((f) => ({ f, err: validateImageFile(f) })).filter((x) => x.err);
    if (invalid.length) showToast(`${invalid[0].f.name}: ${invalid[0].err}`, "error");

    const valid = list.filter((f) => !validateImageFile(f));
    setQueue(valid.map((f) => ({ name: f.name, pct: 0 })));

    for (const file of valid) {
      const result = await uploadImage(file, (pct) =>
        setQueue((q) => q.map((item) => (item.name === file.name ? { ...item, pct } : item)))
      );
      if (result.ok) addMedia(result.media);
      else showToast(`${file.name}: ${result.error}`, "error");
    }
    setQueue([]);
    if (valid.length) showToast(`${valid.length} image(s) uploaded`);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Catalogue"
        title="Media library"
        subtitle="Upload product images once and reuse them anywhere in the panel."
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Btn variant="primary" onClick={() => inputRef.current?.click()} disabled={queue.length > 0}>
              <UploadCloud className="h-3.5 w-3.5" /> Upload images
            </Btn>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Images" value={mediaList.length} icon={<Images className="h-5 w-5" />} sub="stored in database" accent="#000000" />
        <StatCard label="Storage used" value={formatBytes(totalBytes)} icon={<HardDrive className="h-5 w-5" />} sub="5 MB max per image" accent="#3a3a3a" />
        <StatCard label="In use" value={inUse} icon={<Package className="h-5 w-5" />} sub="assigned to products" accent="#7d7d7d" />
      </div>

      {/* dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => queue.length === 0 && inputRef.current?.click()}
        className={cx(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed px-6 py-8 text-center transition-all",
          dragging ? "border-black bg-[#f5f5f5]" : "border-[#d6d6d6] bg-white hover:border-black"
        )}
      >
        {queue.length > 0 ? (
          <div className="w-full max-w-md space-y-2">
            {queue.map((q) => (
              <div key={q.name} className="space-y-1 text-left">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 truncate font-semibold text-black">
                    <Loader2 className="h-3 w-3 animate-spin" /> {q.name}
                  </span>
                  <span className="tabular text-[#858585]">{q.pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ececec]">
                  <div className="h-full rounded-full bg-black transition-all" style={{ width: `${q.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white">
              <UploadCloud className="h-5 w-5" />
            </span>
            <p className="text-sm font-bold text-black">Drag & drop images here</p>
            <p className="text-[11px] text-[#858585]">or click to browse · JPG, PNG, WebP, GIF · up to 5 MB each</p>
          </>
        )}
      </div>

      <Card>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by file name…" className="sm:max-w-md" />
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Images className="h-5 w-5" />}
            title={mediaList.length === 0 ? "Your library is empty" : "No images match your search"}
            message={mediaList.length === 0 ? "Upload your first product image to get started." : undefined}
            action={
              mediaList.length === 0 ? (
                <Btn variant="primary" onClick={() => inputRef.current?.click()}>
                  <UploadCloud className="h-3.5 w-3.5" /> Upload images
                </Btn>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => {
            const used = usedUrls.has(m.url);
            return (
              <div
                key={m.id}
                className="group overflow-hidden rounded-[18px] border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(16,16,20,.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,0,0,.10)]"
              >
                <div className="relative aspect-[4/3] bg-black">
                  <Image src={m.url} alt={m.fileName} fill sizes="320px" className="object-contain p-3" unoptimized />
                  {used && (
                    <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-black">
                      In use
                    </span>
                  )}
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open full size"
                    className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-black opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="space-y-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-black" title={m.fileName}>
                      {m.fileName}
                    </p>
                    <p className="text-[11px] text-[#9a9a9a]">
                      {m.mimeType.replace("image/", "").toUpperCase()} · {formatBytes(m.sizeBytes)}
                      {m.width && m.height ? ` · ${m.width}×${m.height}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copy(m.url, "Image URL")}
                      className={cx(
                        "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[9px] px-2 text-[11px] font-semibold ring-1 ring-inset transition-colors",
                        copiedKey === m.url
                          ? "bg-black text-white ring-black"
                          : "bg-white text-black ring-[#e0e0e0] hover:ring-black"
                      )}
                    >
                      {copiedKey === m.url ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                      {copiedKey === m.url ? "Copied" : "Copy URL"}
                    </button>
                    <IconBtn
                      title="Delete image"
                      tone="danger"
                      onClick={() => {
                        if (confirm(`Delete ${m.fileName}?${used ? " It is currently used by a product." : ""}`))
                          deleteMedia(m.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
