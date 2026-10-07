import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "OTOPZ Admin Suite — Repository & Operations Control",
  description:
    "Operations dashboard, product catalog management, orders ledger, customer intelligence, and store settings.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#f4f4f4] text-[#000000]">{children}</div>;
}
