"use client";

import React, { useMemo, useState } from "react";
import { useAdmin } from "../AdminContext";
import {
  Badge,
  Btn,
  Card,
  EmptyState,
  Field,
  IconBtn,
  Input,
  KeyChip,
  Modal,
  PageHeader,
  Progress,
  SearchInput,
  Segmented,
  Select,
  StatCard,
  TableWrap,
  Td,
  Th,
  Tr,
} from "@/components/ui/kit";
import { formatPrice } from "@/types/admin";
import {
  FileCode,
  Plus,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  DownloadCloud,
  Ban,
  CheckCircle2,
  KeyRound,
  Globe,
  Package,
} from "lucide-react";

/* =========================== DIGITAL FILES =========================== */
export function DigitalFilesSection() {
  const { digitalFilesList, products, saveDigitalFile, recalcChecksum, copy, copiedKey } = useAdmin();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fileName, setFileName] = useState("");
  const [format, setFormat] = useState("ZIP");
  const [size, setSize] = useState("15 MB");
  const [version, setVersion] = useState("1.0.0");
  const [productId, setProductId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(
    () =>
      digitalFilesList.filter((f) =>
        search.trim()
          ? f.fileName.toLowerCase().includes(search.toLowerCase()) ||
            (f.productTitle ?? "").toLowerCase().includes(search.toLowerCase())
          : true
      ),
    [digitalFilesList, search]
  );

  const totalDownloads = digitalFilesList.reduce((s, f) => s + f.downloadCount, 0);
  const unlinked = digitalFilesList.filter((f) => !f.productId).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileName.trim()) return;
    setSaving(true);
    const ok = await saveDigitalFile({
      fileName: fileName.trim(),
      fileFormat: format.trim(),
      fileSizeMb: size.trim(),
      version: version.trim(),
      productId: productId ? Number(productId) : null,
    });
    setSaving(false);
    if (ok) {
      setOpen(false);
      setFileName("");
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Delivery"
        title="Digital files"
        subtitle="Registered packages, SHA-256 integrity checksums and storage paths."
        actions={
          <Btn variant="primary" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Register file
          </Btn>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered files" value={digitalFilesList.length} icon={<FileCode className="h-5 w-5" />} sub="in secure storage" accent="#000000" />
        <StatCard label="Integrity" value="100%" icon={<ShieldCheck className="h-5 w-5" />} sub="checksums verified" accent="#262626" />
        <StatCard label="Served downloads" value={totalDownloads} icon={<DownloadCloud className="h-5 w-5" />} sub="lifetime deliveries" accent="#525252" />
        <StatCard label="Unlinked files" value={unlinked} icon={<Package className="h-5 w-5" />} sub="not attached to a product" accent="#737373" />
      </div>

      <Card>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by file name or product…" className="sm:max-w-md" />
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<FileCode className="h-5 w-5" />} title="No files registered" message="Register a package to issue verified downloads." />
        </Card>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>File</Th>
              <Th>Linked product</Th>
              <Th>Format</Th>
              <Th>Size</Th>
              <Th>Version</Th>
              <Th>SHA-256</Th>
              <Th align="right">Downloads</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <Tr key={f.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f5f5f5] text-[#000000]">
                      <FileCode className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 max-w-[240px]">
                      <p className="truncate text-[13px] font-semibold text-[#000000]">{f.fileName}</p>
                      <p className="truncate font-mono text-[10px] text-[#9a9a9a]">{f.storagePath}</p>
                    </div>
                  </div>
                </Td>
                <Td className="max-w-[200px]">
                  {f.productTitle ? (
                    <span className="block truncate text-[12px] text-[#3a3a3a]">{f.productTitle}</span>
                  ) : (
                    <Badge tone="warning">unlinked</Badge>
                  )}
                </Td>
                <Td>
                  <Badge tone="neutral">{f.fileFormat}</Badge>
                </Td>
                <Td className="text-[12px] text-[#666666]">{f.fileSizeMb}</Td>
                <Td className="tabular text-[12px] font-semibold">v{f.version}</Td>
                <Td>
                  <KeyChip
                    value={`${f.sha256Checksum.slice(0, 14)}…`}
                    copied={copiedKey === f.sha256Checksum}
                    onCopy={() => copy(f.sha256Checksum, "Checksum")}
                  />
                </Td>
                <Td align="right" className="tabular font-semibold">{f.downloadCount}</Td>
                <Td align="right">
                  <Btn size="xs" variant="secondary" onClick={() => recalcChecksum(f.id)}>
                    <RefreshCw className="h-3 w-3" /> Verify
                  </Btn>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Register digital package"
        subtitle="A SHA-256 checksum is generated automatically on registration."
        icon={<HardDrive className="h-4 w-4" />}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={submit} disabled={saving}>
              {saving ? "Registering…" : "Register file"}
            </Btn>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="File name">
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g. n8n-automation-suite-v3.2.zip" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Format">
              <Input value={format} onChange={(e) => setFormat(e.target.value)} placeholder="ZIP" />
            </Field>
            <Field label="Size">
              <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="24 MB" />
            </Field>
            <Field label="Version">
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" />
            </Field>
          </div>
          <Field label="Attach to product" hint="Optional — link the package to a catalogue item.">
            <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">No linked product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  );
}

/* =========================== DOWNLOADS =========================== */
export function DownloadsSection() {
  const { downloadsList, toggleDownloadStatus, regenerateDownloadToken, copy, copiedKey, exportCSV } = useAdmin();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | "active" | "revoked">("All");

  const filtered = useMemo(
    () =>
      downloadsList.filter((d) => {
        if (status !== "All" && d.status !== status) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            d.buyerEmail.toLowerCase().includes(q) ||
            (d.productTitle ?? "").toLowerCase().includes(q) ||
            d.downloadToken.toLowerCase().includes(q) ||
            d.ipAddress.includes(q)
          );
        }
        return true;
      }),
    [downloadsList, status, search]
  );

  const active = downloadsList.filter((d) => d.status === "active").length;
  const revoked = downloadsList.filter((d) => d.status === "revoked").length;
  const totalHits = downloadsList.reduce((s, d) => s + d.downloadCount, 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Delivery"
        title="Download management"
        subtitle="Secure delivery tokens, access limits and abuse controls."
        actions={
          <Btn
            variant="secondary"
            onClick={() =>
              exportCSV(
                "otopz-downloads.csv",
                ["ID", "Order", "Product", "Customer", "IP", "Token", "Hits", "Status", "Date"],
                downloadsList.map((d) => [
                  d.id,
                  d.orderId,
                  `"${d.productTitle ?? ""}"`,
                  d.buyerEmail,
                  d.ipAddress,
                  d.downloadToken,
                  d.downloadCount,
                  d.status,
                  new Date(d.downloadedAt).toISOString().slice(0, 10),
                ])
              )
            }
          >
            <DownloadCloud className="h-3.5 w-3.5" /> Export log
          </Btn>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active links" value={active} icon={<CheckCircle2 className="h-5 w-5" />} sub="customers can download" accent="#262626" />
        <StatCard label="Revoked links" value={revoked} icon={<Ban className="h-5 w-5" />} sub="blocked by support" accent="#0a0a0a" />
        <StatCard label="Total downloads" value={totalHits} icon={<DownloadCloud className="h-5 w-5" />} sub="all-time file deliveries" accent="#525252" />
      </div>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by customer, product, token or IP…" className="sm:max-w-md" />
        <Segmented<"All" | "active" | "revoked">
          value={status}
          onChange={setStatus}
          options={[
            { value: "All", label: "All", count: downloadsList.length },
            { value: "active", label: "Active", count: active },
            { value: "revoked", label: "Revoked", count: revoked },
          ]}
        />
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<DownloadCloud className="h-5 w-5" />} title="No download records" />
        </Card>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Product</Th>
              <Th>Customer</Th>
              <Th>Access token</Th>
              <Th>IP address</Th>
              <Th align="right">Hits</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <Tr key={d.id}>
                <Td className="tabular font-bold text-[#000000]">#{d.orderId}</Td>
                <Td className="max-w-[200px]">
                  <span className="block truncate text-[12px] text-[#3a3a3a]">{d.productTitle ?? "—"}</span>
                </Td>
                <Td className="text-[12px] text-[#3a3a3a]">{d.buyerEmail}</Td>
                <Td>
                  <KeyChip
                    value={`${d.downloadToken.slice(0, 16)}…`}
                    copied={copiedKey === d.downloadToken}
                    onCopy={() => copy(d.downloadToken, "Download token")}
                  />
                </Td>
                <Td>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#666666]">
                    <Globe className="h-3 w-3 text-[#b5b5b5]" />
                    {d.ipAddress}
                  </span>
                </Td>
                <Td align="right">
                  <div className="ml-auto w-16">
                    <p className="tabular text-right text-[12px] font-semibold">{d.downloadCount}/5</p>
                    <div className="mt-1">
                      <Progress value={(d.downloadCount / 5) * 100} tone={d.downloadCount >= 5 ? "#0a0a0a" : "#000000"} />
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge tone={d.status === "active" ? "success" : "danger"} dot>
                    {d.status}
                  </Badge>
                </Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconBtn title="Issue new token" onClick={() => regenerateDownloadToken(d.id)}>
                      <KeyRound className="h-3.5 w-3.5" />
                    </IconBtn>
                    <Btn
                      size="xs"
                      variant={d.status === "active" ? "danger" : "success"}
                      onClick={() => toggleDownloadStatus(d.id, d.status)}
                    >
                      {d.status === "active" ? "Revoke" : "Restore"}
                    </Btn>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
