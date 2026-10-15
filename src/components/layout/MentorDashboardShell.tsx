"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface MentorDashboardShellProps {
  children: React.ReactNode;
}

export function MentorDashboardShell({ children }: MentorDashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) setProfile(profile);
      }
    }
    loadUser();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const navLinks = [
    { href: "/dashboard/mentor", label: "Overview", icon: "dashboard" },
    { href: "/dashboard/mentor/analytics", label: "Performance & Analytics", icon: "insights" },
    { href: "/dashboard/mentor/earnings", label: "Earnings & Payouts", icon: "payments" },
    { href: "/dashboard/mentor/requests", label: "Student Requests & Bidding", icon: "broadcast_on_personal" },
    { href: "/dashboard/mentor/bookings", label: "My Bookings & Sessions", icon: "calendar_month" },
    { href: "/dashboard/mentor/services", label: "Services & Pricing", icon: "inventory_2" },
    { href: "/dashboard/mentor/programs", label: "Cohort Programs", icon: "groups" },
  ];

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col">
          <div className="h-16 px-space-lg flex items-center justify-between">
            <Link href="/dashboard/mentor" className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[22px]">verified</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md font-bold text-on-surface leading-tight tracking-tight">DreamX</span>
                <span className="font-label-sm text-label-sm text-secondary tracking-wide uppercase font-semibold">Mentor Portal</span>
              </div>
            </Link>
          </div>

          <div className="px-space-md py-space-sm">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/dashboard/mentor" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-space-sm px-space-md py-2.5 rounded-lg transition-colors font-body-md text-body-md ${
                      isActive
                        ? "bg-secondary text-white font-semibold shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-space-md flex flex-col gap-space-sm">
          <div className="p-space-md rounded-xl bg-surface-container-low shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">Verified Mentor</span>
              <span className="font-label-sm text-label-sm text-tertiary">80% Net Share</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">3-Day Escrow Payout Cycle</p>
          </div>

          <div className="flex items-center justify-between px-space-sm py-space-xs">
            <Link
              href="/dashboard/student"
              className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              <span>Student Portal</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-space-xs text-on-surface-variant hover:text-error font-body-sm text-body-sm transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="pl-72">
        {/* Top Header */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs font-body-sm text-body-sm">
              <span className="text-tertiary">Mentor Dashboard</span>
              <span className="text-tertiary">/</span>
              <span className="text-on-surface font-medium capitalize">
                {pathname.split("/").pop()?.replace("-", " ") || "Home"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden xl:flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px] text-tertiary">currency_rupee</span>
              <span>80% Platform Revenue Share Guaranteed</span>
            </div>

            <div className="flex items-center gap-space-sm pl-space-xs">
              <div className="flex flex-col text-right hidden sm:flex">
                <div className="flex items-center gap-space-xs justify-end">
                  <span className="font-title-md text-body-md font-semibold text-on-surface leading-none">
                    {profile?.full_name || user?.email?.split("@")[0] || "Mentor"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm uppercase font-bold">
                    MENTOR
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary">
                  {profile?.title || "Industry Expert"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
                {(profile?.full_name || user?.email || "M")[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="w-full pt-16 px-gutter bg-surface min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
