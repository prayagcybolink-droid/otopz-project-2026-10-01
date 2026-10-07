"use client";

import React from "react";
import { X, Search, ChevronDown, Inbox } from "lucide-react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ============================ TONES ============================ */
export type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "violet"
  | "ink";

// Monochrome tone system: meaning is carried by contrast + weight, not hue.
const toneStyles: Record<Tone, string> = {
  neutral: "bg-[#f5f5f5] text-[#565656] ring-1 ring-inset ring-[#e0e0e0]",
  success: "bg-black text-white ring-1 ring-inset ring-black",
  warning: "bg-[#e5e5e5] text-black ring-1 ring-inset ring-[#cfcfcf]",
  danger: "bg-white text-black ring-1 ring-inset ring-black",
  info: "bg-white text-[#3a3a3a] ring-1 ring-inset ring-[#d6d6d6]",
  violet: "bg-[#3a3a3a] text-white ring-1 ring-inset ring-[#3a3a3a]",
  ink: "bg-black text-white ring-1 ring-inset ring-black",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  const dotColor: Record<Tone, string> = {
    neutral: "bg-[#9a9a9a]",
    success: "bg-white",
    warning: "bg-black",
    danger: "bg-black ring-2 ring-black/15",
    info: "bg-[#8a8a8a]",
    violet: "bg-white",
    ink: "bg-white",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize leading-none",
        toneStyles[tone],
        className
      )}
    >
      {dot && <span className={cx("h-1.5 w-1.5 rounded-full", dotColor[tone])} />}
      {children}
    </span>
  );
}

/* ============================ BUTTONS ============================ */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "brand";
type BtnSize = "xs" | "sm" | "md";

const btnVariants: Record<BtnVariant, string> = {
  primary:
    "bg-[#000000] text-white hover:bg-[#262626] shadow-[0_1px_2px_rgba(0,0,0,.18)] active:translate-y-px",
  brand:
    "bg-[#ffffff] text-[#000000] hover:bg-[#f0f0f0] shadow-[0_1px_2px_rgba(0,0,0,.12)] active:translate-y-px",
  secondary:
    "bg-white text-[#000000] ring-1 ring-inset ring-[#e0e0e0] hover:bg-[#fafafa] hover:ring-[#bdbdbd]",
  ghost: "text-[#565656] hover:bg-[#ececec] hover:text-[#000000]",
  danger:
    "bg-white text-black ring-1 ring-inset ring-black hover:bg-black hover:text-white active:translate-y-px",
  success:
    "bg-black text-white hover:bg-[#262626] shadow-[0_1px_2px_rgba(0,0,0,.14)] active:translate-y-px",
};

const btnSizes: Record<BtnSize, string> = {
  xs: "h-7 px-2.5 text-[11px] gap-1.5 rounded-lg",
  sm: "h-9 px-3.5 text-xs gap-2 rounded-[10px]",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
};

export function Btn({
  children,
  variant = "secondary",
  size = "sm",
  className,
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
}) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex select-none items-center justify-center font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        btnVariants[variant],
        btnSizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconBtn({
  children,
  title,
  tone = "neutral",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "neutral" | "danger" | "success" }) {
  const tones = {
    neutral:
      "text-[#666666] ring-[#e5e5e5] hover:text-[#000000] hover:bg-[#f4f4f4] hover:ring-[#cfcfcf]",
    danger: "text-black ring-[#cfcfcf] hover:bg-black hover:text-white hover:ring-black",
    success: "text-black ring-[#cfcfcf] hover:bg-black hover:text-white hover:ring-black",
  };
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cx(
        "inline-grid h-8 w-8 place-items-center rounded-[9px] bg-white ring-1 ring-inset transition-all duration-150",
        tones[tone],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ============================ SURFACES ============================ */
export function Card({
  children,
  className,
  pad = true,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  pad?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-[18px] border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(16,16,20,.05)]",
        hover && "card-hover",
        pad && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHead({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f5f5f5] text-[#000000] ring-1 ring-inset ring-[#e5e5e5]">
            {icon}
          </span>
        )}
        <div>
          <h3 className="font-display text-[15px] font-bold leading-tight text-[#000000]">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-[#858585]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#a3a3a3]">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#000000] sm:text-[28px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-[#777777]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ============================ STATS ============================ */
export function StatCard({
  label,
  value,
  sub,
  icon,
  delta,
  deltaTone = "success",
  spark,
  accent = "#000000",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  delta?: string;
  deltaTone?: "success" | "danger" | "neutral";
  spark?: number[];
  accent?: string;
}) {
  const deltaCls =
    deltaTone === "success"
      ? "text-white bg-black ring-black"
      : deltaTone === "danger"
      ? "text-black bg-white ring-black"
      : "text-[#666666] bg-[#f5f5f5] ring-[#e5e5e5]";

  return (
    <div className="group relative overflow-hidden rounded-[18px] border border-[#e5e5e5] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,16,20,.09)]">
      <span
        className="absolute inset-x-0 top-0 h-[3px] opacity-80"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9a9a]">{label}</p>
          <p className="tabular mt-2 font-display text-[26px] font-extrabold leading-none tracking-tight text-[#000000]">
            {value}
          </p>
        </div>
        {icon && (
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
            style={{ background: accent }}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {delta && (
            <span
              className={cx(
                "rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset",
                deltaCls
              )}
            >
              {delta}
            </span>
          )}
          {sub && <span className="truncate text-[11px] text-[#9a9a9a]">{sub}</span>}
        </div>
        {spark && spark.length > 1 && <Spark data={spark} color={accent} />}
      </div>
    </div>
  );
}

export function Spark({ data, color = "#000000" }: { data: number[]; color?: string }) {
  const w = 64;
  const h = 22;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="shrink-0 overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}

/* ============================ CHARTS ============================ */
export function AreaChart({
  data,
  labels,
  height = 180,
  color = "#000000",
  valuePrefix = "",
}: {
  data: number[];
  labels: string[];
  height?: number;
  color?: string;
  valuePrefix?: string;
}) {
  const w = 720;
  const h = height;
  const padB = 24;
  const max = Math.max(...data, 1);
  const stepX = data.length > 1 ? w / (data.length - 1) : w;
  const yFor = (v: number) => h - padB - (v / max) * (h - padB - 12);

  const linePts = data.map((d, i) => `${i * stepX},${yFor(d)}`);
  const areaPath = `M0,${h - padB} L${linePts.join(" L")} L${w},${h - padB} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={0}
            x2={w}
            y1={12 + t * (h - padB - 12)}
            y2={12 + t * (h - padB - 12)}
            stroke="#ececec"
            strokeWidth={1}
          />
        ))}
        <path d={areaPath} fill="url(#areaFill)" />
        <polyline
          className="animate-draw-line"
          points={linePts.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={i * stepX} cy={yFor(d)} r={3.5} fill="#fff" stroke={color} strokeWidth={2} />
            <title>{`${labels[i]}: ${valuePrefix}${d}`}</title>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-0.5 text-[10px] font-medium text-[#a3a3a3]">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function Donut({
  segments,
  size = 168,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f5f5f5" strokeWidth={14} />
          {segments.map((s, index) => {
            const len = (s.value / total) * c;
            const offset = segments
              .slice(0, index)
              .reduce((sum, segment) => sum + (segment.value / total) * c, 0);
            return (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={14}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                className="transition-all duration-700"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="tabular font-display text-xl font-extrabold leading-none text-[#000000]">
              {centerValue}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#9a9a9a]">
              {centerLabel}
            </p>
          </div>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="truncate font-medium text-[#4a4a4a]">{s.label}</span>
            </span>
            <span className="tabular shrink-0 font-bold text-[#000000]">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarRow({
  label,
  value,
  max,
  caption,
  color = "#000000",
}: {
  label: string;
  value: number;
  max: number;
  caption?: string;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="truncate font-semibold text-[#2c2c2c]">{label}</span>
        <span className="tabular shrink-0 text-[#858585]">{caption}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f5f5f5]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(pct, value > 0 ? 3 : 0)}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ============================ FORMS ============================ */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#666666]">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-[11px] text-[#9a9a9a]">{hint}</span>}
    </label>
  );
}

const fieldBase =
  "w-full rounded-[10px] border border-[#e0e0e0] bg-white px-3 py-2.5 text-[13px] text-[#000000] placeholder:text-[#b5b5b5] transition-colors focus:border-[#000000] focus:outline-none";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(fieldBase, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(fieldBase, "resize-y leading-relaxed", props.className)} />;
}

export function Select({
  children,
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={cx(fieldBase, "cursor-pointer appearance-none pr-9", className)}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9a9a]" />
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-[10px] border border-[#e0e0e0] bg-white pl-9 pr-8 text-[13px] text-[#000000] placeholder:text-[#b5b5b5] transition-colors focus:border-[#000000] focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[#b5b5b5] hover:bg-[#f5f5f5] hover:text-[#000000]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2.5"
    >
      <span
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-black" : "bg-[#d8d8d8]"
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
      {label && <span className="text-xs font-semibold text-[#4a4a4a]">{label}</span>}
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  size?: "xs" | "sm";
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-[#f5f5f5] p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cx(
              "rounded-lg font-semibold transition-all duration-150",
              size === "xs" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
              active
                ? "bg-white text-[#000000] shadow-[0_1px_3px_rgba(0,0,0,.08)]"
                : "text-[#7a7a7a] hover:text-[#000000]"
            )}
          >
            {o.label}
            {typeof o.count === "number" && (
              <span className={cx("ml-1.5 tabular", active ? "text-[#9a9a9a]" : "text-[#b0b0b0]")}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============================ TABLE ============================ */
export function TableWrap({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[18px] border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(16,16,20,.05)]",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">{children}</table>
      </div>
    </div>
  );
}

export function Th({
  children,
  className,
  align = "left",
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      className={cx(
        "sticky top-0 z-10 whitespace-nowrap border-b border-[#ececec] bg-[#fafafa] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8b8b8b]",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = "left",
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <td
      className={cx(
        "border-b border-[#ececec] px-4 py-3 text-[13px] text-[#3a3a3a] align-middle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  className,
  selected,
}: {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
}) {
  return (
    <tr
      className={cx(
        "transition-colors duration-100 hover:bg-[#fafafa]",
        selected && "bg-[#f7f9ef]",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function EmptyState({
  title,
  message,
  action,
  icon,
}: {
  title: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f5f5f5] text-[#a3a3a3] ring-1 ring-inset ring-[#e5e5e5]">
        {icon ?? <Inbox className="h-5 w-5" />}
      </span>
      <div>
        <p className="font-display text-sm font-bold text-[#000000]">{title}</p>
        {message && <p className="mx-auto mt-1 max-w-sm text-xs text-[#858585]">{message}</p>}
      </div>
      {action}
    </div>
  );
}

/* ============================ OVERLAYS ============================ */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <div
        className="fixed inset-0 bg-[#000000]/45 backdrop-blur-[3px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cx(
          "relative my-6 w-full overflow-hidden rounded-[22px] border border-[#e5e5e5] bg-white shadow-[0_32px_80px_rgba(16,16,20,.28)] animate-scale-in",
          width
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#ececec] px-6 py-5">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black text-white">
                {icon}
              </span>
            )}
            <div>
              <h3 className="font-display text-lg font-bold leading-tight text-[#000000]">{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-[#858585]">{subtitle}</p>}
            </div>
          </div>
          <IconBtn title="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconBtn>
        </div>
        <div className="max-h-[calc(100vh-240px)] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[#ececec] bg-[#fbfbfb] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-[#000000]/45 backdrop-blur-[3px] animate-fade-in" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex max-w-full p-0 sm:p-3">
        <div
          className={cx(
            "flex h-full w-screen flex-col overflow-hidden border border-[#e5e5e5] bg-white shadow-[0_32px_80px_rgba(16,16,20,.3)] sm:rounded-[22px] animate-slide-in",
            width
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[#ececec] px-5 py-4">
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-bold text-[#000000]">{title}</h3>
              {subtitle && <p className="mt-0.5 truncate text-xs text-[#858585]">{subtitle}</p>}
            </div>
            <IconBtn title="Close" onClick={onClose}>
              <X className="h-4 w-4" />
            </IconBtn>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer && <div className="border-t border-[#ececec] bg-[#fbfbfb] px-5 py-4">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================ MISC ============================ */
export function Avatar({
  name,
  src,
  size = 36,
  ring = true,
}: {
  name: string;
  src?: string | null;
  size?: number;
  ring?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cx(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-black font-bold text-white",
        ring && "ring-2 ring-white"
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

export function KeyChip({
  value,
  onCopy,
  copied,
}: {
  value: string;
  onCopy: () => void;
  copied?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      title="Click to copy"
      className={cx(
        "tabular inline-flex max-w-full items-center gap-2 truncate rounded-lg border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors",
        copied
          ? "border-black bg-black text-white"
          : "border-[#e5e5e5] bg-[#fafafa] text-[#3a3a3a] hover:border-[#bdbdbd] hover:bg-[#f5f5f5]"
      )}
    >
      {copied ? "Copied!" : value}
    </button>
  );
}

export function Progress({ value, tone = "#000000" }: { value: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f5f5f5]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: tone }}
      />
    </div>
  );
}
