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
  EmptyState,
  Field,
  IconBtn,
  Input,
  PageHeader,
  SearchInput,
  Segmented,
  Select,
  StatCard,
  Textarea,
  Toggle,
  cx,
} from "@/components/ui/kit";
import { EmailLogItem } from "@/types/admin";
import { ImagePicker } from "@/components/ui/ImagePicker";
import {
  Star,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Flag,
  Reply,
  Send,
  Megaphone,
  Image as ImageIcon,
  Mail,
  Inbox,
  Clock,
  Sparkles,
  Eye,
} from "lucide-react";

/* =========================== REVIEWS =========================== */
export function ReviewsSection() {
  const { reviewsList, updateReviewStatus, replyToReview, deleteReview } = useAdmin();
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState<"All" | number>("All");
  const [status, setStatus] = useState<"All" | "approved" | "pending" | "flagged">("All");
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = useMemo(
    () =>
      reviewsList.filter((r) => {
        if (rating !== "All" && r.rating !== rating) return false;
        if (status !== "All" && (r.status ?? "approved") !== status) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            r.authorName.toLowerCase().includes(q) ||
            r.comment.toLowerCase().includes(q) ||
            (r.productTitle ?? "").toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [reviewsList, rating, status, search]
  );

  const avg =
    reviewsList.length > 0
      ? (reviewsList.reduce((s, r) => s + r.rating, 0) / reviewsList.length).toFixed(1)
      : "5.0";
  const flagged = reviewsList.filter((r) => r.status === "flagged").length;
  const pending = reviewsList.filter((r) => r.status === "pending").length;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviewsList.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Community"
        title="Reviews & moderation"
        subtitle="Approve, flag or reply to customer feedback across the catalogue."
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHead title="Rating summary" subtitle={`${reviewsList.length} total reviews`} icon={<Star className="h-4 w-4" />} />
          <div className="mt-5 flex items-end gap-3">
            <p className="font-display text-5xl font-extrabold leading-none text-[#000000]">{avg}</p>
            <div className="pb-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cx(
                      "h-4 w-4",
                      i <= Math.round(Number(avg)) ? "fill-black text-black" : "text-[#d6d6d6]"
                    )}
                  />
                ))}
              </div>
              <p className="mt-1 text-[11px] text-[#9a9a9a]">average score</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2 text-[11px]">
                <span className="tabular w-3 font-semibold text-[#666666]">{d.star}</span>
                <Star className="h-3 w-3 fill-black text-black" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f5f5f5]">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-500"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="tabular w-5 text-right text-[#9a9a9a]">{d.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[#ececec] pt-4">
            <div className="rounded-xl bg-black p-2.5 text-center">
              <p className="tabular font-display text-lg font-extrabold text-white">{flagged}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/60">Flagged</p>
            </div>
            <div className="rounded-xl bg-[#f5f5f5] p-2.5 text-center ring-1 ring-inset ring-[#e5e5e5]">
              <p className="tabular font-display text-lg font-extrabold text-black">{pending}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#666666]">Pending</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput value={search} onChange={setSearch} placeholder="Search reviews…" className="sm:max-w-xs" />
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(rating)}
                onChange={(e) => setRating(e.target.value === "All" ? "All" : Number(e.target.value))}
                className="h-10 py-0"
              >
                <option value="All">All ratings</option>
                {[5, 4, 3, 2, 1].map((s) => (
                  <option key={s} value={s}>
                    {s} stars
                  </option>
                ))}
              </Select>
              <Segmented<"All" | "approved" | "pending" | "flagged">
                value={status}
                onChange={setStatus}
                options={[
                  { value: "All", label: "All" },
                  { value: "approved", label: "Approved" },
                  { value: "pending", label: "Pending" },
                  { value: "flagged", label: "Flagged" },
                ]}
              />
            </div>
          </Card>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState icon={<MessageSquare className="h-5 w-5" />} title="No reviews match these filters" />
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => {
                const st = r.status ?? "approved";
                return (
                  <Card key={r.id} hover>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Avatar name={r.authorName} size={30} ring={false} />
                          <span className="text-[13px] font-bold text-[#000000]">{r.authorName}</span>
                          <span className="text-[#d6d6d6]">·</span>
                          <span className="truncate text-xs text-[#666666]">{r.productTitle}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={cx("h-3.5 w-3.5", i <= r.rating ? "fill-black text-black" : "text-[#d6d6d6]")}
                              />
                            ))}
                          </div>
                          <Badge tone={st === "approved" ? "success" : st === "flagged" ? "danger" : "warning"} dot>
                            {st}
                          </Badge>
                        </div>

                        <p className="text-[13px] leading-relaxed text-[#3a3a3a]">&ldquo;{r.comment}&rdquo;</p>

                        {r.adminReply && (
                          <div className="rounded-xl border-l-2 border-[#000000] bg-[#fafafa] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a9a9a]">
                              OTOPZ response
                            </p>
                            <p className="mt-1 text-xs text-[#3a3a3a]">{r.adminReply}</p>
                          </div>
                        )}

                        {replyId === r.id && (
                          <div className="space-y-2 rounded-xl bg-[#fafafa] p-3 ring-1 ring-inset ring-[#ececec]">
                            <Textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a public response…"
                            />
                            <div className="flex items-center gap-2">
                              <Btn
                                size="xs"
                                variant="primary"
                                onClick={async () => {
                                  if (!replyText.trim()) return;
                                  const ok = await replyToReview(r.id, replyText.trim());
                                  if (ok) {
                                    setReplyId(null);
                                    setReplyText("");
                                  }
                                }}
                              >
                                <Send className="h-3 w-3" /> Publish reply
                              </Btn>
                              <Btn size="xs" variant="ghost" onClick={() => setReplyId(null)}>
                                Cancel
                              </Btn>
                            </div>
                          </div>
                        )}

                        <p className="text-[11px] text-[#b5b5b5]">
                          {new Date(r.createdAt).toLocaleDateString()} · Verified purchase
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        <IconBtn title="Approve" tone="success" onClick={() => updateReviewStatus(r.id, "approved")}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn title="Flag for review" onClick={() => updateReviewStatus(r.id, "flagged")}>
                          <Flag className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn
                          title="Reply"
                          onClick={() => {
                            setReplyId(replyId === r.id ? null : r.id);
                            setReplyText(r.adminReply ?? "");
                          }}
                        >
                          <Reply className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn
                          title="Delete review"
                          tone="danger"
                          onClick={() => {
                            if (confirm("Delete this review permanently?")) deleteReview(r.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconBtn>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================== HOMEPAGE / BANNERS =========================== */
export function BannersSection() {
  const { bannerConfig, setBannerConfig, saveBanner, couponsList } = useAdmin();
  const [saving, setSaving] = useState(false);

  if (!bannerConfig) {
    return (
      <Card>
        <EmptyState icon={<Megaphone className="h-5 w-5" />} title="No banner configuration found" />
      </Card>
    );
  }

  const cfg = bannerConfig;
  const update = (patch: Partial<typeof cfg>) => setBannerConfig({ ...cfg, ...patch });

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Storefront"
        title="Homepage & banners"
        subtitle="Control the announcement bar, hero content and featured artwork."
        actions={
          <Btn
            variant="primary"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await saveBanner(cfg);
              setSaving(false);
            }}
          >
            {saving ? "Publishing…" : "Publish changes"}
          </Btn>
        }
      />

      {/* live preview */}
      <Card pad={false} className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#ececec] px-5 py-3">
          <CardHead title="Live preview" subtitle="How the storefront renders right now" icon={<Eye className="h-4 w-4" />} />
          <Toggle checked={cfg.isBannerActive} onChange={(v) => update({ isBannerActive: v })} label="Banner visible" />
        </div>

        {cfg.isBannerActive && (
          <div className="flex items-center justify-center gap-2 bg-[#000000] px-4 py-2 text-center text-[11px] font-semibold text-[#ffffff]">
            <Sparkles className="h-3 w-3" />
            <span className="truncate">{cfg.announcementText}</span>
            {cfg.promoCode && (
              <span className="rounded bg-[#ffffff] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#000000]">
                {cfg.promoCode}
              </span>
            )}
          </div>
        )}

        <div className="relative min-h-[260px] overflow-hidden bg-[#000000] p-8">
          <Image src={cfg.heroImage} alt="Hero" fill sizes="900px" className="object-cover opacity-40 grayscale" unoptimized={cfg.heroImage.startsWith("/api/media/")} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/70 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end gap-3 pt-16">
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              {cfg.heroTitle}
            </h2>
            <p className="max-w-xl text-sm text-white/70">{cfg.heroSubtitle}</p>
            <span className="inline-flex w-fit items-center rounded-xl bg-[#ffffff] px-5 py-2.5 text-xs font-bold text-[#000000]">
              {cfg.heroCtaText}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="Announcement bar" subtitle="Thin promo strip above the header" icon={<Megaphone className="h-4 w-4" />} />
          <div className="mt-5 space-y-4">
            <Field label="Announcement text">
              <Input value={cfg.announcementText} onChange={(e) => update({ announcementText: e.target.value })} />
            </Field>
            <Field label="Linked promo code" hint="Shown as a highlighted chip inside the banner.">
              <Select value={cfg.promoCode} onChange={(e) => update({ promoCode: e.target.value })}>
                <option value="">No code</option>
                {couponsList.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} — {c.discountType === "percent" ? `${c.discountValue}%` : `$${(c.discountValue / 100).toFixed(2)}`} off
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <Card>
          <CardHead title="Hero section" subtitle="Primary storefront message" icon={<ImageIcon className="h-4 w-4" />} />
          <div className="mt-5 space-y-4">
            <Field label="Hero title">
              <Input value={cfg.heroTitle} onChange={(e) => update({ heroTitle: e.target.value })} />
            </Field>
            <Field label="Hero subtitle">
              <Textarea rows={2} value={cfg.heroSubtitle} onChange={(e) => update({ heroSubtitle: e.target.value })} />
            </Field>
            <Field label="Call to action label">
              <Input value={cfg.heroCtaText} onChange={(e) => update({ heroCtaText: e.target.value })} />
            </Field>
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Hero artwork" subtitle="Upload a new image or choose one from your library" icon={<ImageIcon className="h-4 w-4" />} />
        <div className="mt-5 max-w-xl">
          <ImagePicker value={cfg.heroImage} onChange={(url) => update({ heroImage: url })} previewAspect="aspect-video" />
        </div>
      </Card>
    </div>
  );
}

/* =========================== NOTIFICATIONS =========================== */
const EMAIL_TEMPLATES: Record<string, { subject: string; body: string }> = {
  license_delivery: {
    subject: "Your OTOPZ license key is ready",
    body: "Thanks for your purchase! Your license key and download link are attached to this message.",
  },
  order_confirmation: {
    subject: "Order confirmation — OTOPZ",
    body: "We have received your order. A receipt and your download certificate are enclosed.",
  },
  discount_drop: {
    subject: "New drop: 20% off automation kits",
    body: "A fresh batch of automation workflows just landed. Use your code at checkout before it expires.",
  },
  security_alert: {
    subject: "Security notice for your OTOPZ account",
    body: "We detected a new download location for your license. If this wasn't you, contact support.",
  },
};

export function NotificationsSection() {
  const { emailLogsList, sendEmail, customerList } = useAdmin();
  const [recipient, setRecipient] = useState("customer@studio.co");
  const [type, setType] = useState("license_delivery");
  const [subject, setSubject] = useState(EMAIL_TEMPLATES.license_delivery.subject);
  const [body, setBody] = useState(EMAIL_TEMPLATES.license_delivery.body);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<EmailLogItem | null>(null);

  function applyTemplate(t: string) {
    setType(t);
    const tpl = EMAIL_TEMPLATES[t];
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  }

  const sent = emailLogsList.filter((e) => e.status === "sent").length;
  const queued = emailLogsList.filter((e) => e.status === "queued").length;
  const failed = emailLogsList.filter((e) => e.status === "failed").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Lifecycle"
        title="Notifications & emails"
        subtitle="Dispatch transactional messages and audit the delivery log."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Delivered" value={sent} icon={<CheckCircle2 className="h-5 w-5" />} sub="successfully sent" accent="#262626" />
        <StatCard label="Queued" value={queued} icon={<Clock className="h-5 w-5" />} sub="awaiting dispatch" accent="#737373" />
        <StatCard label="Failed" value={failed} icon={<Inbox className="h-5 w-5" />} sub="needs attention" accent="#0a0a0a" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
        <Card>
          <CardHead title="Compose message" subtitle="Send a transactional email now" icon={<Mail className="h-4 w-4" />} />
          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setSending(true);
              await sendEmail({ recipient, subject, type, previewContent: body });
              setSending(false);
            }}
          >
            <Field label="Template">
              <Select value={type} onChange={(e) => applyTemplate(e.target.value)}>
                <option value="license_delivery">License delivery</option>
                <option value="order_confirmation">Order confirmation</option>
                <option value="discount_drop">Discount / new drop</option>
                <option value="security_alert">Security alert</option>
              </Select>
            </Field>
            <Field label="Recipient">
              <Input type="email" value={recipient} onChange={(e) => setRecipient(e.target.value)} required list="customer-emails" />
              <datalist id="customer-emails">
                {customerList.map((c) => (
                  <option key={c.email} value={c.email} />
                ))}
              </datalist>
            </Field>
            <Field label="Subject">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </Field>
            <Field label="Message body">
              <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
            <Btn type="submit" variant="primary" size="md" className="w-full" disabled={sending}>
              <Send className="h-4 w-4" /> {sending ? "Dispatching…" : "Send email"}
            </Btn>
          </form>
        </Card>

        <Card pad={false}>
          <div className="px-5 pt-5">
            <CardHead title="Delivery log" subtitle={`${emailLogsList.length} messages dispatched`} icon={<Inbox className="h-4 w-4" />} />
          </div>
          <div className="mt-4 divide-y divide-[#ececec]">
            {emailLogsList.length === 0 && <EmptyState title="No emails sent yet" />}
            {emailLogsList.map((e) => (
              <button
                key={e.id}
                onClick={() => setPreview(preview?.id === e.id ? null : e)}
                className="flex w-full items-start justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#fafafa]"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cx(
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                      e.status === "sent"
                        ? "bg-black text-white"
                        : e.status === "queued"
                        ? "bg-[#e5e5e5] text-black"
                        : "bg-white text-black ring-1 ring-inset ring-black"
                    )}
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#000000]">{e.subject}</p>
                    <p className="truncate text-[11px] text-[#9a9a9a]">
                      {e.recipient} · {e.type.replace(/_/g, " ")}
                    </p>
                    {preview?.id === e.id && e.previewContent && (
                      <p className="mt-2 rounded-lg bg-[#fafafa] p-2.5 text-[11px] leading-relaxed text-[#565656] ring-1 ring-inset ring-[#ececec]">
                        {e.previewContent}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge tone={e.status === "sent" ? "success" : e.status === "queued" ? "warning" : "danger"} dot>
                    {e.status}
                  </Badge>
                  <span className="text-[10px] text-[#b5b5b5]">{new Date(e.sentAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
