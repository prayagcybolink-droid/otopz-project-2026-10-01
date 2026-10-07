import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OTOPZ — Digital Products That Work For You",
  description:
    "Automation tools, workflows, e-books, doc templates, preset editing kits and digital packs — instant download with lifetime updates.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="bg-[#FFFFE3] text-[#0A0A0A] antialiased selection:bg-black selection:text-[#FFFFE3]">
        {children}
      </body>
    </html>
  );
}
