"use client";

import React, { useMemo, useState } from "react";
import {
  ShoppingBag,
  FolderArchive,
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  Store,
  Menu,
  X,
} from "lucide-react";
import {
  ProductItem,
  OrderItem,
  UserSession,
  WorkspaceMode,
} from "@/types/foundry";
import { ProductDetailDrawer } from "./ProductDetailDrawer";
import { CheckoutDrawer } from "./CheckoutDrawer";
import { AuthModal } from "./AuthModal";
import { MyLibraryView } from "./MyLibraryView";
import { StorefrontView } from "./StorefrontView";

interface FoundryWorkspaceProps {
  initialProducts: ProductItem[];
  initialOrders: OrderItem[];
  initialUser: UserSession | null;
}

export function FoundryWorkspace({
  initialProducts,
  initialOrders,
  initialUser,
}: FoundryWorkspaceProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(initialUser);

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("storefront");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [inspectedProduct, setInspectedProduct] = useState<ProductItem | null>(null);
  const [cartItems, setCartItems] = useState<ProductItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [lastCheckoutEmail, setLastCheckoutEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 3200);
  };

  const goTo = (mode: WorkspaceMode) => {
    setWorkspaceMode(mode);
    setMobileNavOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const refreshAllData = async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
      ]);
      if (prodRes.ok) {
        const pData = await prodRes.json();
        const list: ProductItem[] = pData.products || [];
        setProducts(list);
        setInspectedProduct((cur) => (cur ? list.find((p) => p.id === cur.id) ?? cur : cur));
      }
      if (ordRes.ok) {
        const oData = await ordRes.json();
        setOrders(oData.orders || []);
      }
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  };

  /* ---------- Cart ---------- */
  const handleAddToCart = (product: ProductItem) => {
    setCartItems((prev) => (prev.some((i) => i.id === product.id) ? prev : [...prev, product]));
    showToast(`Added "${product.title}" to cart`);
  };

  const handleBuyNow = (product: ProductItem) => {
    setCartItems((prev) => (prev.some((i) => i.id === product.id) ? prev : [product, ...prev]));
    setInspectedProduct(null);
    setCheckoutOpen(true);
  };

  const handleOrderSuccess = (createdOrders: OrderItem[], buyerEmail: string) => {
    setOrders((prev) => [...createdOrders, ...prev]);
    setLastCheckoutEmail(buyerEmail);
    const ids = new Set(createdOrders.map((o) => o.productId));
    setProducts((prev) =>
      prev.map((p) => (ids.has(p.id) ? { ...p, salesCount: p.salesCount + 1 } : p))
    );
    showToast(`${createdOrders.length} product(s) delivered to ${buyerEmail}`);
  };

  const myLicensesCount = useMemo(() => {
    const email = (lastCheckoutEmail || currentUser?.email || "marcus@studio.co").toLowerCase();
    return orders.filter((o) => o.buyerEmail.toLowerCase() === email).length;
  }, [orders, currentUser, lastCheckoutEmail]);

  /* ---------- Shared overlays ---------- */
  const overlays = (
    <>
      {toast && (
        <div
          key={toast}
          className="anim-toast fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-[60] max-w-[calc(100vw-2rem)] flex items-center gap-2.5 px-4 py-3 bg-[#0A0A0A] text-[#FFFFE3] text-xs font-medium shadow-2xl"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <ProductDetailDrawer
        key={inspectedProduct?.id ?? "none"}
        product={inspectedProduct}
        onClose={() => setInspectedProduct(null)}
        onBuyNow={handleBuyNow}
        onAddToCart={handleAddToCart}
        currentUser={currentUser}
        onReviewSubmitted={() => {
          refreshAllData();
          showToast("Review published");
        }}
      />

      <CheckoutDrawer
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((i) => i.id !== id))}
        onClearCart={() => setCartItems([])}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
        onGoToLibrary={() => {
          setCheckoutOpen(false);
          goTo("library");
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          setLastCheckoutEmail(null);
          showToast(user ? `Signed in as ${user.name}` : "Signed out");
        }}
      />
    </>
  );

  /* ---------- Storefront ---------- */
  if (workspaceMode === "storefront") {
    return (
      <>
        <StorefrontView
          products={products}
          cartCount={cartItems.length}
          currentUser={currentUser}
          myLicensesCount={myLicensesCount}
          onInspect={setInspectedProduct}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onOpenCart={() => setCheckoutOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
          onGoLibrary={() => goTo("library")}
        />
        {overlays}
      </>
    );
  }

  /* ---------- My Library (buyer dashboard) ---------- */
  const navItems: { mode: WorkspaceMode; label: string; icon: typeof Store; badge?: number }[] = [
    { mode: "storefront", label: "Back to Shop", icon: Store },
    { mode: "library", label: "My Library", icon: FolderArchive, badge: myLicensesCount },
  ];

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#FFFFE3]/10">
        <button type="button" onClick={() => goTo("storefront")} className="font-display text-2xl font-semibold tracking-[0.12em]">
          OTOPZ
        </button>
        <button type="button" className="lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 pb-2 eyebrow text-[#FFFFE3]/40">Account</div>
        {navItems.map(({ mode, label, icon: Icon, badge }) => {
          const active = workspaceMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => goTo(mode)}
              className={`group w-full flex items-center justify-between px-3 py-3 text-[11px] font-medium tracking-[0.16em] uppercase ${
                active
                  ? "bg-[#FFFFE3] text-[#0A0A0A]"
                  : "text-[#FFFFE3]/70 hover:text-[#FFFFE3] hover:bg-[#FFFFE3]/5"
              }`}
            >
              <span className="flex items-center gap-3">
                {mode === "storefront" ? (
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                {label}
              </span>
              {badge !== undefined && (
                <span className={`px-1.5 py-0.5 text-[10px] ${active ? "bg-[#0A0A0A] text-[#FFFFE3]" : "bg-[#FFFFE3]/10"}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#FFFFE3]/10">
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="w-full flex items-center gap-3 p-2 text-left hover:bg-[#FFFFE3]/5"
        >
          <span className="w-9 h-9 rounded-full bg-[#FFFFE3] text-[#0A0A0A] text-xs font-semibold flex items-center justify-center shrink-0">
            {currentUser?.avatarUrl || "GU"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium truncate">{currentUser ? currentUser.name : "Guest"}</span>
            <span className="block text-[10px] text-[#FFFFE3]/50 truncate uppercase tracking-[0.12em]">
              {currentUser ? currentUser.email : "Sign in"}
            </span>
          </span>
          <UserCheck className="w-4 h-4 text-[#FFFFE3]/60" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFE3] text-[#0A0A0A]">
      {/* Desktop sidebar */}
      <aside className="anim-slide-left hidden lg:block fixed inset-y-0 left-0 w-[260px] bg-[#0A0A0A] text-[#FFFFE3] z-30">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="anim-fade-in absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <aside className="anim-slide-left absolute inset-y-0 left-0 w-[80vw] max-w-[280px] bg-[#0A0A0A] text-[#FFFFE3]">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 h-16 bg-[#FFFFE3]/90 backdrop-blur-md border-b border-[#E4E4E4] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileNavOpen(true)} className="lg:hidden -ml-2 p-2" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <span className="eyebrow text-[#8A8A8A] hidden sm:inline">OTOPZ /</span>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">My Library</span>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="h-9 px-4 flex items-center gap-2 bg-[#0A0A0A] text-[#FFFFE3] text-[10px] font-medium tracking-[0.18em] uppercase hover:bg-[#333]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cart</span>
            <span key={cartItems.length} className="anim-pop">({cartItems.length})</span>
          </button>
        </header>

        <main key={workspaceMode} className="anim-fade-in max-w-[1400px] mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-24">
          <MyLibraryView
            orders={orders}
            products={products}
            currentUser={currentUser}
            lastCheckoutEmail={lastCheckoutEmail}
            onInspectProduct={setInspectedProduct}
            onExploreStorefront={() => goTo("storefront")}
          />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-[#FFFFE3] border-t border-[#E4E4E4] grid grid-cols-2">
          {navItems.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => goTo(mode)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium tracking-[0.14em] uppercase ${
                workspaceMode === mode ? "text-[#0A0A0A]" : "text-[#8A8A8A]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {mode === "storefront" ? "Shop" : label.replace("My ", "")}
            </button>
          ))}
        </nav>
      </div>

      {overlays}
    </div>
  );
}
