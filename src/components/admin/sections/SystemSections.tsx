"use client";

import React, { useState } from "react";
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
  Modal,
  PageHeader,
  Segmented,
  Select,
  StatCard,
  TableWrap,
  Td,
  Th,
  Tr,
  cx,
} from "@/components/ui/kit";
import {
  Settings as SettingsIcon,
  Store,
  KeyRound,
  Sparkles,
  DatabaseBackup,
  Download,
  FileArchive,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  Trash2,
  Shield,
  History,
  Lock,
  Server,
  CheckCircle2,
} from "lucide-react";

/* =========================== SETTINGS =========================== */
export function SettingsSection() {
  const { settingsState, setSettingsState, saveSettings, simulateOrder, reseedDatabase, exportBackup } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"store" | "licensing" | "sandbox">("store");

  const set = (k: string, v: string) => setSettingsState({ ...settingsState, [k]: v });

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Configuration"
        title="Store settings"
        subtitle="Branding, licensing rules, support details and sandbox tooling."
        actions={
          <Btn
            variant="primary"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await saveSettings(settingsState);
              setSaving(false);
            }}
          >
            {saving ? "Saving…" : "Save settings"}
          </Btn>
        }
      />

      <Segmented<"store" | "licensing" | "sandbox">
        value={tab}
        onChange={setTab}
        options={[
          { value: "store", label: "Store profile" },
          { value: "licensing", label: "Licensing & payments" },
          { value: "sandbox", label: "Data & sandbox" },
        ]}
      />

      {tab === "store" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHead title="Brand identity" subtitle="Shown across the storefront and emails" icon={<Store className="h-4 w-4" />} />
            <div className="mt-5 space-y-4">
              <Field label="Store name">
                <Input value={settingsState.store_name ?? "OTOPZ"} onChange={(e) => set("store_name", e.target.value)} />
              </Field>
              <Field label="Tagline">
                <Input value={settingsState.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
              </Field>
              <Field label="Announcement default">
                <Input value={settingsState.announcement ?? ""} onChange={(e) => set("announcement", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHead title="Contact & support" subtitle="Where customers reach your team" icon={<ShieldCheck className="h-4 w-4" />} />
            <div className="mt-5 space-y-4">
              <Field label="Support email">
                <Input
                  type="email"
                  value={settingsState.support_email ?? "support@otopz.studio"}
                  onChange={(e) => set("support_email", e.target.value)}
                />
              </Field>
              <Field label="Business address">
                <Input
                  value={settingsState.business_address ?? "Remote-first · Worldwide"}
                  onChange={(e) => set("business_address", e.target.value)}
                />
              </Field>
              <Field label="Storefront URL">
                <Input
                  value={settingsState.store_url ?? "https://otopz.store"}
                  onChange={(e) => set("store_url", e.target.value)}
                />
              </Field>
            </div>
          </Card>
        </div>
      )}

      {tab === "licensing" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHead title="License engine" subtitle="Key format and delivery rules" icon={<KeyRound className="h-4 w-4" />} />
            <div className="mt-5 space-y-4">
              <Field label="License key prefix" hint="Keys are issued as PREFIX-XXXX-XXXX-XXXX.">
                <Input
                  value={settingsState.license_prefix ?? "OTOPZ"}
                  onChange={(e) => set("license_prefix", e.target.value.toUpperCase())}
                  className="font-mono tracking-wider"
                />
              </Field>
              <Field label="Download limit per order">
                <Input
                  type="number"
                  min={1}
                  value={settingsState.download_limit ?? "5"}
                  onChange={(e) => set("download_limit", e.target.value)}
                />
              </Field>
              <div className="rounded-xl bg-[#000000] p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/50">Example key</p>
                <p className="tabular mt-1 font-mono text-sm font-bold text-[#ffffff]">
                  {(settingsState.license_prefix ?? "OTOPZ")}-8F29-KL94-M201
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Payments" subtitle="Currency and settlement preferences" icon={<Server className="h-4 w-4" />} />
            <div className="mt-5 space-y-4">
              <Field label="Store currency">
                <Select value={settingsState.currency ?? "USD"} onChange={(e) => set("currency", e.target.value)}>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="INR">INR — Indian Rupee</option>
                </Select>
              </Field>
              <Field label="Default gateway">
                <Select value={settingsState.default_gateway ?? "Stripe"} onChange={(e) => set("default_gateway", e.target.value)}>
                  <option value="Stripe">Stripe</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Manual">Manual / bank transfer</option>
                </Select>
              </Field>
              <Field label="Tax rate (%)">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={settingsState.tax_rate ?? "0"}
                  onChange={(e) => set("tax_rate", e.target.value)}
                />
              </Field>
            </div>
          </Card>
        </div>
      )}

      {tab === "sandbox" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ToolCard
            icon={<Sparkles className="h-4 w-4" />}
            tone="violet"
            title="Simulate an order"
            copy="Generate a realistic order with a valid license key to test dashboards and reports."
            cta="Create test order"
            onClick={simulateOrder}
          />
          <ToolCard
            icon={<Download className="h-4 w-4" />}
            tone="ink"
            title="Download full backup"
            copy="Export products, orders, payments, coupons, reviews and settings as JSON."
            cta="Export backup"
            onClick={exportBackup}
          />
          <ToolCard
            icon={<FileArchive className="h-4 w-4" />}
            tone="ink"
            title="Download source code"
            copy="Get the complete project as a .zip — Next.js app, API routes, database schema, seed data and README."
            cta="Download .zip"
            onClick={() => {
              window.location.href = "/api/admin/export-source";
            }}
          />
          <ToolCard
            icon={<DatabaseBackup className="h-4 w-4" />}
            tone="danger"
            title="Reset to baseline"
            copy="Wipe current records and restore the demo dataset. This cannot be undone."
            cta="Reseed database"
            onClick={() => {
              if (confirm("Reset the database to the demo baseline? All current data will be lost.")) reseedDatabase();
            }}
          />
        </div>
      )}
    </div>
  );
}

function ToolCard({
  icon,
  title,
  copy,
  cta,
  onClick,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  cta: string;
  onClick: () => void;
  tone: "violet" | "ink" | "danger";
}) {
  const tones = {
    violet: "bg-[#3a3a3a] text-white ring-[#3a3a3a]",
    ink: "bg-[#f5f5f5] text-[#000000] ring-[#e5e5e5]",
    danger: "bg-white text-black ring-black",
  };
  return (
    <Card className="flex flex-col justify-between gap-4" hover>
      <div className="space-y-3">
        <span className={cx("grid h-10 w-10 place-items-center rounded-xl ring-1 ring-inset", tones[tone])}>{icon}</span>
        <div>
          <p className="font-display text-sm font-bold text-[#000000]">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#777777]">{copy}</p>
        </div>
      </div>
      <Btn variant={tone === "danger" ? "danger" : "secondary"} onClick={onClick}>
        {cta}
      </Btn>
    </Card>
  );
}

/* =========================== ADMIN USERS =========================== */
const ROLE_META: Record<string, { label: string; tone: "ink" | "violet" | "info" | "neutral"; perms: string }> = {
  super_admin: { label: "Super admin", tone: "ink", perms: "Full access to every module" },
  product_manager: { label: "Product manager", tone: "violet", perms: "Catalogue, categories, files, reviews" },
  support: { label: "Support", tone: "info", perms: "Orders, customers, downloads" },
  creator: { label: "Creator", tone: "neutral", perms: "Own products and sales" },
  admin: { label: "Admin", tone: "ink", perms: "Administrative access" },
  buyer: { label: "Buyer", tone: "neutral", perms: "Storefront only" },
};

export function AdminUsersSection() {
  const { adminUsersList, auditLogsList, inviteAdmin, deleteAdmin, session } = useAdmin();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("product_manager");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const staff = adminUsersList.filter((u) => u.role !== "buyer");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    const ok = await inviteAdmin({ name: name.trim(), email: email.trim(), role, password });
    setSaving(false);
    if (ok) {
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Security"
        title="Admin users & permissions"
        subtitle="Manage who can access the control panel and what they can change."
        actions={
          <Btn variant="primary" onClick={() => setOpen(true)}>
            <UserPlus className="h-3.5 w-3.5" /> Invite admin
          </Btn>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Team members" value={staff.length} icon={<Shield className="h-5 w-5" />} sub="with panel access" accent="#000000" />
        <StatCard
          label="Super admins"
          value={staff.filter((u) => u.role === "super_admin").length}
          icon={<Lock className="h-5 w-5" />}
          sub="unrestricted access"
          accent="#525252"
        />
        <StatCard label="Audit events" value={auditLogsList.length} icon={<History className="h-5 w-5" />} sub="recent admin actions" accent="#262626" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <TableWrap>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Role</Th>
              <Th>Permissions</Th>
              <Th>Last login</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => {
              const meta = ROLE_META[u.role] ?? ROLE_META.admin;
              const isMe = session?.email === u.email;
              return (
                <Tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.avatarUrl} size={34} ring={false} />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-[#000000]">
                          {u.name} {isMe && <span className="text-[10px] font-semibold text-[#9a9a9a]">(you)</span>}
                        </p>
                        <p className="truncate text-[11px] text-[#9a9a9a]">{u.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </Td>
                  <Td className="max-w-[260px]">
                    <span className="block truncate text-[12px] text-[#666666]">
                      {u.permissions === "all" ? "Full access to every module" : meta.perms}
                    </span>
                  </Td>
                  <Td className="text-[12px] text-[#666666]">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                  </Td>
                  <Td align="right">
                    <IconBtn
                      title={isMe ? "You cannot remove yourself" : "Revoke access"}
                      tone="danger"
                      disabled={isMe}
                      onClick={() => {
                        if (confirm(`Revoke admin access for ${u.name}?`)) deleteAdmin(u.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </TableWrap>

        <Card pad={false}>
          <div className="px-5 pt-5">
            <CardHead title="Audit trail" subtitle="Recent administrative activity" icon={<History className="h-4 w-4" />} />
          </div>
          <div className="mt-4 divide-y divide-[#ececec]">
            {auditLogsList.length === 0 && <EmptyState title="No audit events yet" />}
            {auditLogsList.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#f5f5f5] text-[#666666]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#000000]">
                    {log.action} <span className="font-normal text-[#9a9a9a]">on {log.entity}</span>
                  </p>
                  <p className="truncate text-[11px] text-[#9a9a9a]">
                    {log.adminEmail} · {new Date(log.createdAt).toLocaleString()}
                  </p>
                  {log.details && <p className="mt-0.5 truncate text-[11px] text-[#b5b5b5]">{log.details}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* role matrix */}
      <Card>
        <CardHead title="Role permissions" subtitle="What each role can access inside the panel" icon={<Shield className="h-4 w-4" />} />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {(["super_admin", "product_manager", "support"] as const).map((r) => {
            const meta = ROLE_META[r];
            const modules =
              r === "super_admin"
                ? ["Dashboard", "Products", "Categories", "Orders", "Customers", "Payments", "Coupons", "Files", "Downloads", "Reviews", "Banners", "Emails", "Reports", "Settings", "Admin users"]
                : r === "product_manager"
                ? ["Dashboard", "Products", "Categories", "Files", "Reviews", "Banners", "Reports"]
                : ["Dashboard", "Orders", "Customers", "Downloads", "Reviews", "Emails"];
            return (
              <div key={r} className="rounded-2xl border border-[#ececec] p-4">
                <Badge tone={meta.tone}>{meta.label}</Badge>
                <p className="mt-2 text-[11px] text-[#9a9a9a]">{meta.perms}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {modules.map((m) => (
                    <li key={m} className="rounded-md bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-medium text-[#565656]">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite an admin"
        subtitle="They will be able to sign in with the password you set."
        icon={<UserPlus className="h-4 w-4" />}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={submit} disabled={saving}>
              {saving ? "Inviting…" : "Send invite"}
            </Btn>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Morgan" required />
          </Field>
          <Field label="Work email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@otopz.studio" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role">
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="product_manager">Product manager</option>
                <option value="support">Support</option>
              </Select>
            </Field>
            <Field label="Temporary password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={12}
                required
              />
            </Field>
          </div>
          <div className="rounded-xl bg-[#fafafa] p-3 text-[11px] text-[#666666] ring-1 ring-inset ring-[#ececec]">
            <strong className="font-semibold text-[#000000]">{ROLE_META[role]?.label}</strong> — {ROLE_META[role]?.perms}
          </div>
        </form>
      </Modal>
    </div>
  );
}
