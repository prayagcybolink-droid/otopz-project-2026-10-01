"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useAdmin } from "../AdminContext";
import {
  Badge,
  Btn,
  Card,
  CardHead,
  EmptyState,
  Field,
  IconBtn,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  Segmented,
  Select,
  StatCard,
  TableWrap,
  Td,
  Textarea,
  Th,
  Toggle,
  Tr,
  cx,
} from "@/components/ui/kit";
import { ProductFormModal } from "@/components/AdminProductFormModal";
import { ImagePicker } from "@/components/ui/ImagePicker";
import {
  CategoryItem,
  formatPrice,
  PRODUCT_CATEGORIES,
  ProductItem,
} from "@/types/admin";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Archive,
  CheckCircle2,
  FolderTree,
  GripVertical,
  LayoutGrid,
  List,
  Star,
  Tag,
  Boxes,
  CircleDollarSign,
} from "lucide-react";

type StatusFilter = "All" | "published" | "draft" | "archived";

export function ProductsSection() {
  const {
    products,
    categoriesList,
    deleteProduct,
    setProductStatus,
    bulkProductStatus,
    bulkDeleteProducts,
    exportCSV,
    reloadAll,
    showToast,
  } = useAdmin();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [view, setView] = useState<"grid" | "table">("table");
  const [selected, setSelected] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductItem | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (catFilter !== "All" && p.category !== catFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.tagline ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, statusFilter, catFilter, search]);

  const published = products.filter((p) => p.status === "published").length;
  const drafts = products.filter((p) => p.status === "draft").length;
  const archived = products.filter((p) => p.status === "archived").length;
  const catalogValue = products.reduce((s, p) => s + p.priceCents, 0);

  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(p: ProductItem) {
    setEditing(p);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        subtitle="Create, price and publish every digital product in the store."
        actions={
          <>
            <Btn
              variant="secondary"
              onClick={() =>
                exportCSV(
                  "otopz-products.csv",
                  ["ID", "Title", "Category", "Price", "Format", "Version", "Sales", "Status"],
                  products.map((p) => [
                    p.id,
                    `"${p.title}"`,
                    p.category,
                    (p.priceCents / 100).toFixed(2),
                    p.fileFormat,
                    p.version,
                    p.salesCount,
                    p.status,
                  ])
                )
              }
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Btn>
            <Btn variant="primary" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" /> New product
            </Btn>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total products" value={products.length} icon={<Boxes className="h-5 w-5" />} sub={`${categoriesList.length} categories`} accent="#000000" />
        <StatCard label="Published" value={published} icon={<CheckCircle2 className="h-5 w-5" />} sub="live in storefront" accent="#262626" />
        <StatCard label="Drafts & archived" value={`${drafts} / ${archived}`} icon={<Archive className="h-5 w-5" />} sub="hidden from buyers" accent="#737373" />
        <StatCard label="Catalogue value" value={formatPrice(catalogValue)} icon={<CircleDollarSign className="h-5 w-5" />} sub="sum of list prices" accent="#525252" />
      </div>

      {/* toolbar */}
      <Card className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" pad>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products…" className="sm:max-w-xs" />
          <div className="flex items-center gap-2">
            <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="h-10 py-0">
              <option value="All">All categories</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Segmented<StatusFilter>
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "All", label: "All" },
                { value: "published", label: "Live" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#9a9a9a]">
            {filtered.length} of {products.length}
          </span>
          <Segmented<"grid" | "table">
            value={view}
            onChange={setView}
            options={[
              { value: "table", label: "List" },
              { value: "grid", label: "Grid" },
            ]}
          />
        </div>
      </Card>

      {/* bulk bar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#000000] px-4 py-3 text-white shadow-lg animate-fade-up">
          <span className="text-xs font-semibold">
            {selected.length} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Btn size="xs" variant="success" onClick={() => bulkProductStatus(selected, "published").then(() => setSelected([]))}>
              <Eye className="h-3 w-3" /> Publish
            </Btn>
            <Btn size="xs" variant="secondary" onClick={() => bulkProductStatus(selected, "draft").then(() => setSelected([]))}>
              <EyeOff className="h-3 w-3" /> Draft
            </Btn>
            <Btn size="xs" variant="secondary" onClick={() => bulkProductStatus(selected, "archived").then(() => setSelected([]))}>
              <Archive className="h-3 w-3" /> Archive
            </Btn>
            <Btn
              size="xs"
              variant="danger"
              onClick={() => {
                if (confirm(`Delete ${selected.length} product(s)? This cannot be undone.`))
                  bulkDeleteProducts(selected).then(() => setSelected([]));
              }}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </Btn>
            <button onClick={() => setSelected([])} className="ml-1 text-[11px] text-white/60 underline hover:text-white">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* content */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title="No products match your filters"
            message="Try a different search term, category or status."
            action={
              <Btn variant="secondary" onClick={() => { setSearch(""); setCatFilter("All"); setStatusFilter("All"); }}>
                Reset filters
              </Btn>
            }
          />
        </Card>
      ) : view === "table" ? (
        <TableWrap>
          <thead>
            <tr>
              <Th className="w-10">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 cursor-pointer accent-[#000000]"
                  checked={allSelected}
                  onChange={(e) => setSelected(e.target.checked ? filtered.map((p) => p.id) : [])}
                />
              </Th>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th align="right">Price</Th>
              <Th>Delivery</Th>
              <Th align="right">Sales</Th>
              <Th>Rating</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const checked = selected.includes(p.id);
              return (
                <Tr key={p.id} selected={checked}>
                  <Td>
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 cursor-pointer accent-[#000000]"
                      checked={checked}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id)
                        )
                      }
                    />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#000000] ring-1 ring-[#e5e5e5]">
                        <Image src={p.coverImage} alt={p.title} fill sizes="44px" className="object-contain p-1" unoptimized={p.coverImage.startsWith("/api/media/")} />
                      </span>
                      <div className="min-w-0 max-w-[260px]">
                        <p className="truncate text-[13px] font-bold text-[#000000]">{p.title}</p>
                        <p className="truncate text-[11px] text-[#9a9a9a]">{p.tagline || p.slug}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone="neutral">{p.category}</Badge>
                  </Td>
                  <Td align="right" className="tabular font-bold text-[#000000]">
                    {formatPrice(p.priceCents)}
                  </Td>
                  <Td>
                    <p className="text-[12px] font-medium text-[#3a3a3a]">{p.fileFormat}</p>
                    <p className="text-[11px] text-[#9a9a9a]">
                      {p.fileSizeMb} · v{p.version}
                    </p>
                  </Td>
                  <Td align="right" className="tabular font-semibold">
                    {p.salesCount}
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3a3a3a]">
                      <Star className="h-3.5 w-3.5 fill-black text-black" />
                      {(p.avgRating ?? 5).toFixed(1)}
                      <span className="text-[11px] font-normal text-[#9a9a9a]">({p.reviewCount ?? 0})</span>
                    </span>
                  </Td>
                  <Td>
                    <button
                      onClick={() =>
                        setProductStatus(
                          p.id,
                          p.status === "published" ? "draft" : p.status === "draft" ? "archived" : "published"
                        )
                      }
                      title="Click to cycle status"
                    >
                      <Badge
                        tone={p.status === "published" ? "success" : p.status === "draft" ? "warning" : "neutral"}
                        dot
                      >
                        {p.status}
                      </Badge>
                    </button>
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-1.5">
                      <IconBtn title="Edit product" onClick={() => openEdit(p)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn
                        title="Delete product"
                        tone="danger"
                        onClick={() => {
                          if (confirm(`Delete "${p.title}"?`)) deleteProduct(p.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconBtn>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </TableWrap>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-[18px] border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(16,16,20,.05)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(16,16,20,.10)]"
            >
              <div className="relative aspect-[4/3] bg-[#000000]">
                <Image src={p.coverImage} alt={p.title} fill sizes="320px" className="object-contain p-4" unoptimized={p.coverImage.startsWith("/api/media/")} />
                <span className="absolute left-3 top-3">
                  <Badge tone={p.status === "published" ? "success" : p.status === "draft" ? "warning" : "neutral"} dot>
                    {p.status}
                  </Badge>
                </span>
                <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-[#000000]">
                  v{p.version}
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a9a9a]">{p.category}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-[#000000]">{p.title}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="tabular font-display text-lg font-extrabold text-[#000000]">
                    {formatPrice(p.priceCents)}
                  </span>
                  <span className="text-[11px] text-[#9a9a9a]">{p.salesCount} sold</span>
                </div>
                <div className="flex items-center gap-2 border-t border-[#ececec] pt-3">
                  <Btn size="xs" variant="secondary" className="flex-1" onClick={() => openEdit(p)}>
                    <Edit2 className="h-3 w-3" /> Edit
                  </Btn>
                  <IconBtn
                    title="Delete"
                    tone="danger"
                    onClick={() => {
                      if (confirm(`Delete "${p.title}"?`)) deleteProduct(p.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        productToEdit={editing}
        onSaved={() => reloadAll()}
        onShowToast={(m) => showToast(m)}
      />
    </div>
  );
}

/* =========================== CATEGORIES =========================== */
export function CategoriesSection() {
  const { categoriesList, products, saveCategory, deleteCategory, toggleCategory } = useAdmin();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("/images/cat-automation.jpg");
  const [order, setOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setName("");
    setDesc("");
    setImage("/images/cat-automation.jpg");
    setOrder(categoriesList.length + 1);
    setOpen(true);
  }

  function openEdit(c: CategoryItem) {
    setEditing(c);
    setName(c.name);
    setDesc(c.description ?? "");
    setImage(c.coverImage ?? "/images/cat-automation.jpg");
    setOrder(c.displayOrder);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const ok = await saveCategory(
      { name: name.trim(), description: desc.trim(), coverImage: image, displayOrder: Number(order) },
      editing?.id
    );
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Catalogue"
        title="Categories"
        subtitle="Group products into storefront collections and control their order."
        actions={
          <Btn variant="primary" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> New category
          </Btn>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categoriesList.map((c) => {
          const count = products.filter((p) => p.category === c.name).length;
          const revenueProducts = products.filter((p) => p.category === c.name);
          const sales = revenueProducts.reduce((s, p) => s + p.salesCount, 0);
          return (
            <Card key={c.id} pad={false} hover className="overflow-hidden">
              <div className="relative h-28 bg-[#000000]">
                {c.coverImage && (
                  <Image src={c.coverImage} alt={c.name} fill sizes="400px" className="object-cover opacity-55 grayscale" unoptimized={c.coverImage.startsWith("/api/media/")} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-3 flex items-end justify-between">
                  <div>
                    <p className="font-display text-base font-bold text-white">{c.name}</p>
                    <p className="text-[11px] text-white/60">/{c.slug}</p>
                  </div>
                  <Badge tone={c.isActive ? "success" : "neutral"} dot>
                    {c.isActive ? "active" : "hidden"}
                  </Badge>
                </div>
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur">
                  <GripVertical className="h-3 w-3" /> #{c.displayOrder}
                </span>
              </div>
              <div className="space-y-4 p-4">
                <p className="line-clamp-2 min-h-[32px] text-xs leading-relaxed text-[#666666]">
                  {c.description || "No description provided."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#fafafa] p-2.5 text-center ring-1 ring-inset ring-[#ececec]">
                    <p className="tabular font-display text-lg font-extrabold text-[#000000]">{count}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#9a9a9a]">Products</p>
                  </div>
                  <div className="rounded-xl bg-[#fafafa] p-2.5 text-center ring-1 ring-inset ring-[#ececec]">
                    <p className="tabular font-display text-lg font-extrabold text-[#000000]">{sales}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#9a9a9a]">Units sold</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[#ececec] pt-3">
                  <Toggle checked={c.isActive} onChange={() => toggleCategory(c)} label="Visible" />
                  <div className="flex items-center gap-1.5">
                    <IconBtn title="Edit category" onClick={() => openEdit(c)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      title="Delete category"
                      tone="danger"
                      onClick={() => {
                        if (confirm(`Delete category "${c.name}"?`)) deleteCategory(c.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        <button
          onClick={openCreate}
          className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[18px] border-2 border-dashed border-[#d6d6d6] bg-white/50 p-6 text-center transition-all hover:border-[#000000] hover:bg-white"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f5f5f5] text-[#000000]">
            <Plus className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold text-[#000000]">Add a category</span>
            <span className="mt-1 block text-xs text-[#9a9a9a]">Create a new storefront collection</span>
          </span>
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit category" : "New category"}
        subtitle="Collections power storefront navigation and filtering."
        icon={<FolderTree className="h-4 w-4" />}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={submit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create category"}
            </Btn>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <Field label="Category name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Automation Tools" required />
            </Field>
            <Field label="Order">
              <Input type="number" min={1} value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short summary shown on the storefront…" />
          </Field>
          <Field label="Cover image">
            <ImagePicker value={image} onChange={setImage} previewAspect="aspect-video" />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
