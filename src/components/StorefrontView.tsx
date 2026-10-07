"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Heart,
  Zap,
  RefreshCw,
  BadgeCheck,
  Lock,
  Star,
  FolderArchive,
  Plus,
} from "lucide-react";
import {
  ProductItem,
  UserSession,
  PRODUCT_CATEGORIES,
  formatPrice,
} from "@/types/foundry";

/* ---------- Scroll reveal wrapper ---------- */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface StorefrontViewProps {
  products: ProductItem[];
  cartCount: number;
  currentUser: UserSession | null;
  myLicensesCount: number;
  onInspect: (p: ProductItem) => void;
  onAddToCart: (p: ProductItem) => void;
  onBuyNow: (p: ProductItem) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onGoLibrary: () => void;
}

const BRAND = "OTOPZ";

const CATEGORY_TILES = [
  {
    title: "Automation",
    category: "Automation Tools",
    desc: "Blueprints & AI agents that run your busywork.",
    image: "/images/cat-automation.jpg",
  },
  {
    title: "E-Books & Docs",
    category: "E-Books",
    desc: "Playbooks, guides & ready-to-edit documents.",
    image: "/images/cat-ebooks.jpg",
  },
  {
    title: "Presets & Packs",
    category: "Preset Kits",
    desc: "Editing kits, LUTs & creator mega packs.",
    image: "/images/cat-presets.jpg",
  },
];

export function StorefrontView({
  products,
  cartCount,
  currentUser,
  myLicensesCount,
  onInspect,
  onAddToCart,
  onBuyNow,
  onOpenCart,
  onOpenAuth,
  onGoLibrary,
}: StorefrontViewProps) {
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "newest">("popular");
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const published = useMemo(
    () => products.filter((p) => p.status === "published"),
    [products]
  );

  const filtered = useMemo(() => {
    let list = published;
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fileFormat.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sortBy === "popular") sorted.sort((a, b) => b.salesCount - a.salesCount);
    if (sortBy === "price-asc") sorted.sort((a, b) => a.priceCents - b.priceCents);
    if (sortBy === "price-desc") sorted.sort((a, b) => b.priceCents - a.priceCents);
    if (sortBy === "newest")
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted;
  }, [published, category, search, sortBy]);

  const visibleProducts = showAll || search || category !== "All" ? filtered : filtered.slice(0, 8);
  const newest = useMemo(
    () =>
      [...published].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0],
    [published]
  );

  const scrollToGrid = () =>
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const pickCategory = (c: string) => {
    setCategory(c);
    setMenuOpen(false);
    setTimeout(scrollToGrid, 50);
  };

  const toggleWish = (id: number) =>
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const totalSold = published.reduce((s, p) => s + p.salesCount, 0);

  return (
    <div className="min-h-screen bg-[#FFFFE3] text-[#0A0A0A]">
      {/* ===== Announcement bar ===== */}
      <div className="bg-[#0A0A0A] text-[#FFFFE3]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-8 flex items-center justify-between text-[10px] sm:text-[11px] tracking-[0.18em] uppercase">
          <span className="truncate">Instant download on every digital product</span>
          <span className="hidden sm:flex items-center gap-3">
            <span>Lifetime updates</span>
            <span className="opacity-40">|</span>
            <span>24/7 support</span>
          </span>
        </div>
      </div>

      {/* ===== Header ===== */}
      <header
        className={`sticky top-0 z-40 bg-[#FFFFE3]/90 backdrop-blur-md transition-shadow ${
          scrolled ? "shadow-[0_1px_0_#E4E4E4]" : ""
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-16 grid grid-cols-3 items-center">
          <nav className="flex items-center gap-6 text-[11px] font-medium tracking-[0.18em] uppercase">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden -ml-2 p-2"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {[
              ["New", "All"],
              ["Automation", "Automation Tools"],
              ["E-Books", "E-Books"],
              ["Presets", "Preset Kits"],
            ].map(([label, cat]) => (
              <button
                key={label}
                type="button"
                onClick={() => pickCategory(cat)}
                className="hidden lg:inline link-sweep pb-0.5 hover:opacity-70"
              >
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="justify-self-center font-splatink text-3xl sm:text-[38px] leading-none py-1 hover:opacity-80"
            aria-label="OTOPZ home"
          >
            {BRAND}
          </button>

          <div className="justify-self-end flex items-center gap-1 sm:gap-4 text-[11px] font-medium tracking-[0.14em] uppercase">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="flex items-center gap-1.5 p-2 hover:opacity-70"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline">Search</span>
            </button>
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 p-2 hover:opacity-70"
              aria-label="Account"
            >
              <User className="w-4 h-4" />
              <span className="hidden xl:inline">
                {currentUser ? currentUser.name.split(" ")[0] : "Login"}
              </span>
            </button>
            <button
              type="button"
              onClick={onGoLibrary}
              className="hidden sm:flex items-center gap-1.5 p-2 hover:opacity-70"
              aria-label="My library"
            >
              <FolderArchive className="w-4 h-4" />
              <span className="hidden xl:inline">Library ({myLicensesCount})</span>
            </button>
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 p-2 hover:opacity-70"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xl:inline">Cart</span>
              <span
                key={cartCount}
                className="anim-pop absolute -top-0.5 -right-0.5 xl:static min-w-4 h-4 px-1 rounded-full bg-[#0A0A0A] text-[#FFFFE3] text-[9px] flex items-center justify-center"
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="anim-fade-in border-t border-[#E4E4E4] bg-[#FFFFE3]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#8A8A8A]" />
              <input
                autoFocus
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value.length === 1) setTimeout(scrollToGrid, 50);
                }}
                placeholder="Search automation tools, workflows, e-books, presets..."
                className="flex-1 bg-transparent text-base sm:text-lg font-display outline-none placeholder:text-[#B5B5B5]"
              />
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchOpen(false);
                }}
                className="p-1"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ===== Mobile menu ===== */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="anim-fade-in absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="anim-slide-left absolute inset-y-0 left-0 w-[82vw] max-w-sm bg-[#FFFFE3] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <span className="font-display text-2xl font-semibold tracking-[0.12em]">{BRAND}</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="stagger flex flex-col gap-1">
              {PRODUCT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => pickCategory(c)}
                  className="flex items-center justify-between py-3 border-b border-[#E8E2D8] font-display text-xl text-left"
                >
                  {c === "All" ? "Shop All" : c}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ))}
            </div>
            <div className="mt-auto pt-6">
              <button type="button" onClick={onGoLibrary} className="w-full h-11 border border-[#0A0A0A] text-[11px] tracking-[0.16em] uppercase">
                My Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Hero ===== */}
      <section className="relative isolate overflow-hidden bg-[#0A0A0A]">
        {/* Full-bleed photo layer — spans the entire viewport width */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-model.jpg"
            alt="OTOPZ featured digital products"
            className="hero-fill absolute inset-0 h-full w-full object-cover object-[45%_center] sm:object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(10,10,10,.60) 0%, rgba(10,10,10,.15) 38%, rgba(10,10,10,.28) 64%, rgba(10,10,10,.72) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 h-[600px] sm:h-[720px] lg:h-[calc(100vh-96px)] lg:min-h-[640px]">
          {/* Tagline top-left */}
          <div className="absolute top-8 sm:top-12 left-4 sm:left-8 z-20 font-display uppercase text-sm sm:text-base leading-[1.35] tracking-[0.08em] text-[#FFFFE3]">
            {["Automate.", "Relax.", "Repeat."].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <span className="letter-rise" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                  {line}
                </span>
              </span>
            ))}
          </div>

          {/* Stat top-right */}
          <div className="absolute top-8 sm:top-12 right-4 sm:right-8 z-20 text-right anim-fade-in" style={{ animationDelay: ".8s" }}>
            <div className="font-display text-2xl sm:text-3xl font-semibold text-[#FFFFE3]">{(totalSold / 1000).toFixed(1)}K+</div>
            <div className="eyebrow text-[#FFFFE3]/75">Downloads</div>
          </div>

          {/* CTAs bottom-left */}
          <div className="absolute bottom-8 sm:bottom-12 left-4 sm:left-8 z-20 flex flex-wrap items-center gap-4 sm:gap-6 anim-fade-up" style={{ animationDelay: ".9s" }}>
            <button
              type="button"
              onClick={scrollToGrid}
              className="h-11 sm:h-12 px-6 sm:px-8 bg-[#FFFFE3] text-[#0A0A0A] text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#E4E4E4]"
            >
              Shop Now
            </button>
            <button
              type="button"
              onClick={() => pickCategory("Digital Packs")}
              className="arrow-nudge hidden sm:inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-[#FFFFE3] link-sweep pb-1"
            >
              Explore Packs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Collection tag bottom-right */}
          <button
            type="button"
            onClick={() => newest && onInspect(newest)}
            className="group absolute bottom-8 sm:bottom-12 right-4 sm:right-8 z-20 text-right anim-fade-up"
            style={{ animationDelay: "1s" }}
          >
            <div className="font-display uppercase text-sm sm:text-base leading-tight tracking-[0.08em] text-[#FFFFE3]">
              New
              <br />
              Collection
              <br />
              2026
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <span className="line-grow block h-px w-10 bg-[#FFFFE3]" style={{ animationDelay: "1.3s" }} />
              <ArrowUpRight className="w-4 h-4 text-[#FFFFE3] group-hover:rotate-45 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* ===== Category band ===== */}
      <section className="bg-[#0A0A0A] text-[#FFFFE3]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:divide-x md:divide-[#FFFFE3]/15">
          {CATEGORY_TILES.map((tile, i) => (
            <Reveal key={tile.title} delay={i * 120}>
              <button
                type="button"
                onClick={() => pickCategory(tile.category)}
                className="group w-full flex items-center gap-5 md:px-8 first:md:pl-0 text-left"
              >
                <div className="img-zoom w-24 h-32 sm:w-28 sm:h-[150px] shrink-0 overflow-hidden bg-[#1A1A1A]">
                  <img src={tile.image} alt={tile.title} className="w-full h-full object-contain grayscale" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg sm:text-xl font-medium uppercase tracking-[0.08em]">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-[#FFFFE3]/60 leading-relaxed max-w-[200px]">{tile.desc}</p>
                  <span className="arrow-nudge inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase pt-1">
                    Shop Now <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== New drop split ===== */}
      <section className="bg-[#FFFFE3] overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 px-4 sm:px-8 py-14 sm:py-20 flex flex-col justify-center">
            <Reveal>
              <span className="eyebrow text-[#5E5E5E]">New Season</span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-4 font-display font-semibold uppercase leading-[0.88] tracking-[-0.02em] text-[56px] sm:text-[80px] lg:text-[96px]">
                New
                <br />
                Flows
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 text-sm text-[#5E5E5E] max-w-xs leading-relaxed">
                Fresh automation kits, AI agent workflows and editing presets — built to save you hours every week.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <button
                type="button"
                onClick={() => pickCategory("Automation Tools")}
                className="arrow-nudge mt-8 inline-flex items-center gap-3 h-12 px-8 bg-[#0A0A0A] text-[#FFFFE3] text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#333]"
              >
                Explore Collection <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7">
            <div className="img-zoom relative w-full aspect-[4/3] overflow-hidden bg-[#FFFFE3]">
              <img src="/images/new-vibes.jpg" alt="New season digital products" className="absolute inset-0 w-full h-full object-contain grayscale" />
              <div className="absolute bottom-5 right-5 bg-[#FFFFE3] px-4 py-3 text-right">
                <div className="eyebrow text-[#5E5E5E]">Starting at</div>
                <div className="font-display text-2xl font-semibold">
                  {formatPrice(Math.min(...published.map((p) => p.priceCents), 1500))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Features strip ===== */}
      <section className="border-b border-[#E4E4E4]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 sm:py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, t: "Instant Download", d: "Files delivered in seconds" },
            { icon: RefreshCw, t: "Lifetime Updates", d: "Every new version, free" },
            { icon: BadgeCheck, t: "Quality Assured", d: "Tested by real creators" },
            { icon: Lock, t: "Secure Payment", d: "Encrypted checkout" },
          ].map(({ icon: Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 90}>
              <div className="group flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 border border-[#0A0A0A] flex items-center justify-center group-hover:bg-[#0A0A0A] group-hover:text-[#FFFFE3] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.16em] uppercase">{t}</div>
                  <div className="text-xs text-[#8A8A8A]">{d}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Best of grid ===== */}
      <section ref={gridRef} className="scroll-mt-20 max-w-[1400px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display font-semibold uppercase text-3xl sm:text-5xl tracking-[-0.01em]">
              {search ? `Results for “${search}”` : category === "All" ? `Best of ${BRAND}` : category}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowAll(true);
                setCategory("All");
                setSearch("");
              }}
              className="arrow-nudge shrink-0 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase link-sweep pb-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Reveal>

        {/* Filters */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E4] pb-4">
          <div className="flex gap-6 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
            {PRODUCT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`relative whitespace-nowrap pb-2 text-[11px] font-medium tracking-[0.16em] uppercase ${
                  category === c ? "text-[#0A0A0A]" : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                }`}
              >
                {c}
                {category === c && <span className="line-grow absolute left-0 right-0 -bottom-[17px] h-[2px] bg-[#0A0A0A]" />}
              </button>
            ))}
          </div>
          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-9 px-3 border border-[#D4D4D4] bg-[#FFFFE3] text-[11px] tracking-[0.12em] uppercase focus:outline-none focus:border-[#0A0A0A] self-start md:self-auto"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="anim-scale-in py-24 text-center">
            <div className="anim-float mx-auto w-14 h-14 border border-[#0A0A0A] flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-semibold uppercase">Nothing found</h3>
            <p className="mt-2 text-sm text-[#8A8A8A]">Try a different keyword or browse all digital products.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 h-11 px-8 bg-[#0A0A0A] text-[#FFFFE3] text-[11px] tracking-[0.2em] uppercase"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            key={`${category}-${sortBy}-${search}-${showAll}`}
            className="stagger mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-10"
          >
            {visibleProducts.map((p) => (
              <article key={p.id} className="group">
                <div className="relative aspect-square overflow-hidden bg-[#FFFFE3]">
                  <button type="button" onClick={() => onInspect(p)} className="img-zoom block w-full h-full" aria-label={`View ${p.title}`}>
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-contain grayscale" />
                  </button>
                  <span className="absolute top-3 left-3 bg-[#FFFFE3] px-2 py-1 text-[9px] sm:text-[10px] font-medium tracking-[0.14em] uppercase">
                    {p.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleWish(p.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-[#FFFFE3] flex items-center justify-center hover:scale-110"
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 transition-colors ${wishlist.has(p.id) ? "fill-[#0A0A0A]" : ""}`} />
                  </button>
                  {/* Quick add bar */}
                  <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <button
                      type="button"
                      onClick={() => onAddToCart(p)}
                      className="h-10 sm:h-11 bg-[#FFFFE3] text-[#0A0A0A] text-[9px] sm:text-[10px] font-medium tracking-[0.16em] uppercase flex items-center justify-center gap-1.5 hover:bg-[#E8E2D8]"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                    <button
                      type="button"
                      onClick={() => onBuyNow(p)}
                      className="h-10 sm:h-11 bg-[#0A0A0A] text-[#FFFFE3] text-[9px] sm:text-[10px] font-medium tracking-[0.16em] uppercase flex items-center justify-center gap-1.5 hover:bg-[#333]"
                    >
                      <Zap className="w-3 h-3" /> Buy Now
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => onInspect(p)} className="mt-3 block w-full text-left">
                  <div className="flex items-center justify-between text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A]">
                    <span className="truncate">{p.fileFormat}</span>
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <Star className="w-3 h-3 fill-[#0A0A0A] text-[#0A0A0A]" />
                      <span className="text-[#0A0A0A]">{p.avgRating.toFixed(1)}</span>
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-medium leading-snug line-clamp-2 group-hover:underline underline-offset-4">
                    {p.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-display text-base font-semibold">{formatPrice(p.priceCents)}</span>
                    <span className="text-[11px] text-[#8A8A8A]">· {p.salesCount.toLocaleString()} sold</span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        )}

        {!showAll && !search && category === "All" && filtered.length > 8 && (
          <div className="mt-14 text-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="h-12 px-10 border border-[#0A0A0A] text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#0A0A0A] hover:text-[#FFFFE3]"
            >
              Load More ({filtered.length - 8})
            </button>
          </div>
        )}
      </section>

      {/* ===== Marquee ===== */}
      <section className="bg-[#0A0A0A] text-[#FFFFE3] py-6 overflow-hidden">
        <div className="marquee-track font-display text-3xl sm:text-5xl font-semibold uppercase tracking-tight">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center gap-10 pr-10">
              {PRODUCT_CATEGORIES.filter((c) => c !== "All").map((c) => (
                <span key={c} className="flex items-center gap-10 whitespace-nowrap">
                  <button type="button" onClick={() => pickCategory(c)} className="hover:text-[#FFFFE3]/60">
                    {c}
                  </button>
                  <span className="text-[#FFFFE3]/30">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ===== Newsletter ===== */}
      <section className="bg-[#FFFFE3]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <Reveal>
            <span className="eyebrow text-[#5E5E5E]">Join the list</span>
            <h2 className="mt-3 font-display font-semibold uppercase text-4xl sm:text-6xl leading-[0.9]">
              Get 15% off
              <br />
              your first pack
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value = "";
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                name="email"
                type="email"
                required
                placeholder="Your email address"
                className="flex-1 h-12 px-4 bg-[#FFFFE3] border border-[#D4D4D4] text-sm focus:outline-none focus:border-[#0A0A0A]"
              />
              <button type="submit" className="h-12 px-8 bg-[#0A0A0A] text-[#FFFFE3] text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-[#333]">
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-[#8A8A8A]">New drops, free workflows and creator tips. No spam.</p>
          </Reveal>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-[#0A0A0A] text-[#FFFFE3]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-14 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div className="col-span-2 md:col-span-1">
              <div className="font-display text-2xl font-semibold tracking-[0.12em]">{BRAND}</div>
              <p className="mt-3 text-xs text-[#FFFFE3]/50 max-w-[220px] leading-relaxed">
                Digital products that work for you — automation, workflows, e-books, docs and presets.
              </p>
            </div>
            <div>
              <div className="eyebrow text-[#FFFFE3]/40 mb-4">Shop</div>
              <ul className="space-y-2 text-[#FFFFE3]/80">
                {PRODUCT_CATEGORIES.filter((c) => c !== "All").slice(0, 4).map((c) => (
                  <li key={c}>
                    <button type="button" onClick={() => pickCategory(c)} className="hover:text-[#FFFFE3] link-sweep">
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow text-[#FFFFE3]/40 mb-4">More</div>
              <ul className="space-y-2 text-[#FFFFE3]/80">
                {PRODUCT_CATEGORIES.filter((c) => c !== "All").slice(4).map((c) => (
                  <li key={c}>
                    <button type="button" onClick={() => pickCategory(c)} className="hover:text-[#FFFFE3] link-sweep">
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow text-[#FFFFE3]/40 mb-4">Account</div>
              <ul className="space-y-2 text-[#FFFFE3]/80">
                <li><button type="button" onClick={onOpenAuth} className="hover:text-[#FFFFE3] link-sweep">Sign in</button></li>
                <li><button type="button" onClick={onGoLibrary} className="hover:text-[#FFFFE3] link-sweep">My Library</button></li>
                <li><button type="button" onClick={onOpenCart} className="hover:text-[#FFFFE3] link-sweep">Cart ({cartCount})</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-[#FFFFE3]/10 flex flex-col sm:flex-row justify-between gap-2 text-[11px] tracking-[0.12em] uppercase text-[#FFFFE3]/40">
            <span>© {new Date().getFullYear()} {BRAND} Digital</span>
            <span>Instant delivery · Lifetime updates · Secure checkout</span>
          </div>
        </div>
      </footer>
    </div>
  );
}