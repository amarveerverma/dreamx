"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [pendingMentorCount, setPendingMentorCount] = useState<number>(0);
  const [activeDisputeCount, setActiveDisputeCount] = useState<number>(0);

  useEffect(() => {
    async function loadAdminData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (prof) setProfile(prof);

        // Fetch counts for badge indicators
        const [{ count: pCount }, { count: dCount }] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending_review"),
          supabase.from("booking_disputes").select("*", { count: "exact", head: true }).in("status", ["opened", "mentor_notified", "under_review"]),
        ]);
        setPendingMentorCount(pCount || 0);
        setActiveDisputeCount(dCount || 0);
      }
    }
    loadAdminData();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const navSections = [
    {
      title: "Overview",
      links: [
        { href: "/admin", label: "Executive Dashboard", icon: "dashboard" },
        { href: "/admin/marketplace", label: "Marketplace Health", icon: "vital_signs" },
        { href: "/admin/analytics", label: "Analytics & Performance", icon: "query_stats" },
      ],
    },
    {
      title: "Management",
      links: [
        { href: "/admin/users", label: "User Directory", icon: "group" },
        {
          href: "/admin/mentors",
          label: "Mentor Verification",
          icon: "verified_user",
          badge: pendingMentorCount > 0 ? `${pendingMentorCount} pending` : undefined,
          badgeColor: "bg-surface-container text-primary",
        },
        { href: "/admin/programs", label: "Program Catalog", icon: "layers" },
        {
          href: "/admin/moderation",
          label: "Disputes & Moderation",
          icon: "shield",
          badge: activeDisputeCount > 0 ? `${activeDisputeCount} active` : undefined,
          badgeColor: "bg-error-container text-on-error-container",
        },
      ],
    },
    {
      title: "Finance & Operations",
      links: [
        { href: "/admin/payments", label: "Payments & Escrow", icon: "payments" },
        { href: "/admin/reports", label: "Reports & Exports", icon: "analytics" },
      ],
    },
    {
      title: "System & Governance",
      links: [
        { href: "/admin/settings", label: "Platform Settings", icon: "tune" },
      ],
    },
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-16 px-space-lg flex items-center gap-space-sm border-b border-surface-container-high/40">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container font-headline-sm text-headline-sm font-bold shadow-xs">
              DX
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">DreamX</span>
              <span className="font-overline text-overline uppercase text-on-surface-variant font-semibold">Admin Console</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-space-md py-space-sm">
            <nav className="space-y-4">
              {navSections.map((sec) => (
                <div key={sec.title} className="space-y-1">
                  <span className="px-space-sm font-overline text-overline uppercase tracking-wider text-on-surface-variant/80 font-bold">
                    {sec.title}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {sec.links.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-body-sm ${
                            isActive
                              ? "bg-primary text-on-primary font-medium shadow-xs"
                              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                          }`}
                        >
                          <span className="flex items-center gap-2.5 truncate">
                            <span className={`material-symbols-outlined text-[18px] ${isActive ? "text-on-primary" : "text-outline"}`}>
                              {link.icon}
                            </span>
                            <span className="truncate">{link.label}</span>
                          </span>
                          {link.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-label-sm font-medium ${link.badgeColor}`}>
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer Status Badge */}
        <div className="p-space-md border-t border-surface-container-high/40">
          <div className="px-space-sm py-space-xs rounded-lg bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
              <span className="font-code-table text-code-table text-on-surface-variant">Zero-Trust Protected</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="text-on-surface-variant hover:text-error transition-colors p-1"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Body */}
      <div className="pl-[260px]">
        {/* Top Navbar */}
        <header className="fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-space-lg flex items-center justify-between border-b border-surface-container-high/30">
          <div className="flex items-center gap-space-md">
            <nav className="flex items-center gap-2 text-label-md text-on-surface-variant font-medium">
              <span>Admin Console</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-on-surface font-semibold capitalize">
                {pathname.replace("/admin", "").replace("/", "") || "Executive Overview"}
              </span>
            </nav>
            <div className="flex items-center gap-2 px-space-sm py-1 rounded-lg bg-surface-container-low">
              <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
              <span className="text-label-sm text-on-surface font-medium">India MVP (CM-IN)</span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden xl:flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-low text-tertiary">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="text-label-sm font-medium">pg_cron Active • All Systems Operational</span>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-space-sm pl-space-xs border-l border-surface-container-high pl-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {profile?.full_name ? profile.full_name[0] : "A"}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-label-md font-semibold text-on-surface leading-tight">
                  {profile?.full_name || "Platform Admin"}
                </span>
                <span className="text-label-sm text-on-surface-variant leading-tight">
                  Superuser (admin)
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="w-full pt-16 bg-surface min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
