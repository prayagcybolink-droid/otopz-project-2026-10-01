"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Btn, Input, Segmented, cx } from "./kit";
import { COVER_PRESETS, MediaItem, formatBytes } from "@/types/admin";
import {
  UploadCloud,
  Images,
  LayoutGrid,
  Link2,
  CheckCircle2,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

type Tab = "upload" | "library" | "presets" | "url";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

/** Upload a file with progress via XHR (fetch has no upload progress). */
export function uploadImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ ok: true; media: MediaItem } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const form = new FormData();
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.ok) resolve({ ok: true, media: data.media });
        else resolve({ ok: false, error: data.error || "Upload failed" });
      } catch {
        resolve({ ok: false, error: "Unexpected server response" });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: "Network error during upload" });
    xhr.send(form);
  });
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPT.split(",").includes(file.type)) return "Only JPG, PNG, WebP or GIF images are allowed.";
  if (file.size > MAX_BYTES) return "Image must be 5 MB or smaller.";
  return null;
}

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  onUploaded?: (m: MediaItem) => void;
  /** aspect ratio class for the preview, e.g. "aspect-[4/3]" */
  previewAspect?: string;
  showPreview?: boolean;
  className?: string;
}

export function ImagePicker({
  value,
  onChange,
  onUploaded,
  previewAspect = "aspect-[4/3]",
  showPreview = true,
  className,
}: ImagePickerProps) {
  const [tab, setTab] = useState<Tab>("upload");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<MediaItem[] | null>(null);
  const [libLoading, setLibLoading] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value.startsWith("http") ? value : "");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadLibrary = useCallback(async () => {
    setLibLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.ok) setLibrary(data.media as MediaItem[]);
    } catch {
      /* ignore */
    } finally {
      setLibLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "library" && library === null) loadLibrary();
  }, [tab, library, loadLibrary]);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setProgress(0);
    const result = await uploadImage(file, setProgress);
    setProgress(null);
    if (result.ok) {
      onChange(result.media.url);
      onUploaded?.(result.media);
      setLibrary((prev) => (prev ? [result.media, ...prev] : prev));
    } else {
      setError(result.error);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cx("space-y-3", className)}>
      {showPreview && (
        <div className={cx("relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-black", previewAspect)}>
          {value ? (
            <>
              <Image src={value} alt="Selected image" fill sizes="400px" className="object-contain p-3" unoptimized={value.startsWith("/api/media/")} />
              <button
                type="button"
                onClick={() => onChange("")}
                title="Remove image"
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-white text-black shadow transition-colors hover:bg-black hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded-md bg-white/90 px-2 py-0.5 font-mono text-[10px] text-black">
                {value}
              </span>
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center text-white/50">
              <div>
                <Images className="mx-auto h-6 w-6" />
                <p className="mt-1 text-[11px]">No image selected</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        size="xs"
        options={[
          { value: "upload", label: "Upload" },
          { value: "library", label: "Library" },
          { value: "presets", label: "Presets" },
          { value: "url", label: "URL" },
        ]}
      />

      {/* ---------- UPLOAD ---------- */}
      {tab === "upload" && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div
            role="button"
            tabIndex={0}
            onClick={() => progress === null && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
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
            className={cx(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-all",
              dragging ? "border-black bg-[#f5f5f5]" : "border-[#d6d6d6] bg-white hover:border-black hover:bg-[#fafafa]"
            )}
          >
            {progress !== null ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-black" />
                <p className="text-xs font-semibold text-black">Uploading… {progress}%</p>
                <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#ececec]">
                  <div className="h-full rounded-full bg-black transition-all" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <p className="text-[13px] font-bold text-black">
                  Drop an image here, or <span className="underline">browse</span>
                </p>
                <p className="text-[11px] text-[#858585]">JPG, PNG, WebP or GIF · up to 5 MB</p>
              </>
            )}
          </div>
          {error && (
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-black p-2.5 text-[11px] text-white">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* ---------- LIBRARY ---------- */}
      {tab === "library" && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] text-[#858585]">
              {library ? `${library.length} uploaded image(s)` : "Loading…"}
            </p>
            <button
              type="button"
              onClick={loadLibrary}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline"
            >
              <RefreshCw className={cx("h-3 w-3", libLoading && "animate-spin")} /> Refresh
            </button>
          </div>
          {library && library.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d6d6d6] p-6 text-center">
              <Images className="mx-auto h-5 w-5 text-[#9a9a9a]" />
              <p className="mt-1 text-xs text-[#858585]">Nothing uploaded yet. Use the Upload tab.</p>
              <Btn size="xs" variant="secondary" className="mt-3" onClick={() => setTab("upload")}>
                Upload an image
              </Btn>
            </div>
          ) : (
            <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto p-0.5">
              {(library ?? []).map((m) => {
                const selected = value === m.url;
                return (
                  <button
                    key={m.id}
                    type="button"
                    title={`${m.fileName} · ${formatBytes(m.sizeBytes)}`}
                    onClick={() => onChange(m.url)}
                    className={cx(
                      "relative aspect-square overflow-hidden rounded-xl bg-black ring-2 transition-all",
                      selected ? "ring-black" : "ring-transparent hover:ring-[#bdbdbd]"
                    )}
                  >
                    <Image src={m.url} alt={m.fileName} fill sizes="90px" className="object-cover" unoptimized />
                    {selected && (
                      <span className="absolute inset-0 grid place-items-center bg-black/50">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------- PRESETS ---------- */}
      {tab === "presets" && (
        <div className="grid grid-cols-5 gap-2">
          {COVER_PRESETS.map((preset) => {
            const selected = value === preset.path;
            return (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                onClick={() => onChange(preset.path)}
                className={cx(
                  "relative aspect-square overflow-hidden rounded-xl bg-black ring-2 transition-all",
                  selected ? "ring-black" : "ring-transparent hover:ring-[#bdbdbd]"
                )}
              >
                <Image src={preset.path} alt={preset.label} fill sizes="70px" className="object-cover opacity-80 grayscale" />
                {selected && (
                  <span className="absolute inset-0 grid place-items-center bg-black/50">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ---------- URL ---------- */}
      {tab === "url" && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a9a9a]" />
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://… or /images/…"
              className="pl-9 font-mono text-[11px]"
            />
          </div>
          <Btn size="sm" variant="primary" onClick={() => urlDraft.trim() && onChange(urlDraft.trim())}>
            Use URL
          </Btn>
        </div>
      )}
    </div>
  );
}

/** Small reusable thumbnail that handles uploaded (/api/media) and static sources alike. */
export function Thumb({
  src,
  alt,
  className,
  sizes = "64px",
  fit = "contain",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fit?: "contain" | "cover";
}) {
  return (
    <span className={cx("relative block overflow-hidden bg-black", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={fit === "contain" ? "object-contain p-1" : "object-cover"}
          unoptimized={src.startsWith("/api/media/")}
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-white/40">
          <LayoutGrid className="h-4 w-4" />
        </span>
      )}
    </span>
  );
}
