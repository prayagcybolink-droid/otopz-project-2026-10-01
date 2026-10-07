"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  UserCheck,
  LogOut,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { UserSession } from "@/types/foundry";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  onUserChange: (user: UserSession | null) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}: AuthModalProps) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleQuickDemo = async (
    demoEmail: string,
    demoName: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: demoEmail,
          name: demoName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUserChange(data.user);
        onClose();
      }
    } catch (err) {
      console.error("Quick demo switch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: email.trim(),
          name: name.trim(),
          password: password || "studio-pass",
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUserChange(data.user);
        onClose();
      }
    } catch (err) {
      console.error("Custom auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      onUserChange(null);
      onClose();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/50 backdrop-blur-[2px]">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close auth modal backdrop"
      />
      <div className="anim-scale-in relative z-10 w-full max-w-md max-h-[92vh] overflow-y-auto rounded-none bg-[#FFFFE3] border border-[#E4E4E4] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFE3] border-b border-[#E4E4E4]">
          <div>
            <span className="font-mono-spec text-[11px] uppercase tracking-wider text-[#0A0A0A] font-semibold">
              OTOPZ Identity
            </span>
            <h2 className="font-serif-display text-lg font-semibold text-[#0A0A0A]">
              Sign In
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-none text-[#5E5E5E] hover:text-[#0A0A0A] hover:bg-[#E4E4E4]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Session Banner */}
          {currentUser && (
            <div className="flex items-center justify-between p-3.5 rounded-none bg-[#FFFFE3] border border-[#E4E4E4]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0A0A0A] text-[#FFFFE3] font-mono-spec text-xs font-semibold flex items-center justify-center">
                  {currentUser.avatarUrl || "AF"}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#0A0A0A]">
                    {currentUser.name}
                  </div>
                  <div className="font-mono-spec text-[11px] text-[#5E5E5E]">
                    {currentUser.email} •{" "}
                    <span className="uppercase text-[#0A0A0A]">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-none text-xs font-medium text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}

          {/* 1-Click Demo Personas */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
              Demo Account
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleQuickDemo(
                    "marcus@studio.co",
                    "Marcus Sterling"
                  )
                }
                className={`flex items-center justify-between p-3.5 rounded-none border text-left transition-all cursor-pointer ${
                  currentUser?.email === "marcus@studio.co"
                    ? "bg-[#FFFFE3] border-[#0A0A0A] ring-1 ring-[#0A0A0A]"
                    : "bg-[#FFFFE3] border-[#E4E4E4] hover:border-[#0A0A0A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-none bg-[#FFFFE3] text-[#0A0A0A] flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-[#262626]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#0A0A0A]">
                      Marcus Sterling — Demo Buyer
                    </div>
                    <div className="font-mono-spec text-[11px] text-[#5E5E5E]">
                      marcus@studio.co • 3 Pre-loaded Licenses in Vault
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A8A8A]" />
              </button>
            </div>
          </div>

          {/* Custom Sign In / Register Form */}
          <form
            onSubmit={handleCustomSubmit}
            className="pt-4 border-t border-[#E4E4E4] space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                Or Sign In / Create Account
              </span>
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name (e.g. Julian Vance)"
                className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work Email (e.g. julian@foundry.co)"
                className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (optional for sandbox)"
                className="w-full h-10 px-3.5 rounded-none bg-[#FFFFE3] border border-[#D4D4D4] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-xs font-medium bg-[#0A0A0A] text-[#FFFFE3] hover:bg-[#262626] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
              {loading ? "Authenticating..." : "Continue"}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8A8A8A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B7A43]" />
            <span>Persisted in PostgreSQL • Session cookie active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
