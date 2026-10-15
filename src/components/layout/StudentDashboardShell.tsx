"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface StudentDashboardShellProps {
  children: React.ReactNode;
}

export function StudentDashboardShell({ children }: StudentDashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        // Fetch unread notifications count
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false);
        setUnreadCount(count || 0);

        // Subscribe to real-time notifications
        const channel = supabase
          .channel(`shell-notifications-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.eventType === "INSERT") {
                setUnreadCount((c) => c + 1);
              } else if (payload.eventType === "UPDATE") {
                const updated = payload.new as any;
                if (updated.is_read) {
                  setUnreadCount((c) => Math.max(0, c - 1));
                }
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
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
    { href: "/dashboard/student", label: "Home", icon: "home" },
    { href: "/dashboard/student/journey", label: "Career Journey", icon: "explore" },
    { href: "/dashboard/student/score", label: "Career Score", icon: "speed" },
    { href: "/dashboard/student/ai", label: "AI Recommendations", icon: "psychology" },
    { href: "/dashboard/student/services", label: "Services & Match Queue", icon: "auto_awesome" },
    { href: "/dashboard/student/requests", label: "Smart Requests & Offers", icon: "neurology" },
    { href: "/dashboard/student/bookings", label: "Active Bookings & Schedule", icon: "event_available" },
    { href: "/dashboard/student/programs", label: "Programs & Cohorts", icon: "groups" },
    { href: "/dashboard/student/notifications", label: "Alerts & Messages", icon: "notifications", badge: unreadCount },
    { href: "/dashboard/student/membership", label: "Membership & Billing", icon: "credit_card" },
    { href: "/dashboard/student/settings", label: "Settings & Profile", icon: "settings" },
  ];

  const currentTier = profile?.membership_tier || "free";

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          <div className="h-16 px-space-lg flex items-center justify-between border-b border-surface-container-high/40">
            <Link
              href="/dashboard/student"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-space-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[22px]">auto_awesome</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md font-bold text-on-surface leading-tight tracking-tight">DreamX</span>
                <span className="font-label-sm text-label-sm text-tertiary tracking-wide uppercase font-semibold">Student Portal</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="px-space-md py-space-sm">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/dashboard/student" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-space-md py-2.5 rounded-lg transition-colors font-body-md text-body-md ${
                      isActive
                        ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                      <span>{link.label}</span>
                    </div>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-error text-white font-label-sm text-[11px] font-bold">
                        {link.badge > 99 ? '99+' : link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-space-md flex flex-col gap-space-sm border-t border-surface-container-high/40">
          <div className="p-space-md rounded-xl bg-surface-container-low shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                {currentTier} Plan
              </span>
              <span className="font-label-sm text-label-sm text-tertiary">Active</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {currentTier === 'elite' ? 'Unlimited AI Credits • Escrow Safe' : currentTier === 'pro' ? '100 Monthly AI Credits • Escrow Safe' : 'Free Tier • Upgrade for AI Mentorship'}
            </p>
          </div>

          <div className="flex items-center justify-between px-space-sm py-space-xs">
            <Link
              href="/dashboard/mentor"
              className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              <span>Mentor Portal</span>
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
      <div className="lg:pl-72 min-h-screen">
        {/* Top Header */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <div className="flex items-center gap-space-xs font-body-sm text-body-sm">
              <span className="text-tertiary hidden sm:inline">Dashboard</span>
              <span className="text-tertiary hidden sm:inline">/</span>
              <span className="text-on-surface font-medium capitalize">
                {pathname.split("/").pop()?.replace("-", " ") || "Student"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden xl:flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px] text-tertiary">public</span>
              <span>Target: CM-IN (India Tech) • IST</span>
            </div>

            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md">
              <span className="font-medium">⚡ {currentTier === 'elite' ? 'Unlimited' : currentTier === 'pro' ? '100' : '15'} AI Credits</span>
            </div>

            {/* Notification Bell */}
            <Link
              href="/dashboard/student/notifications"
              className="relative p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
              title="Notification Center"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/student/settings"
              className="flex items-center gap-space-sm pl-space-xs group cursor-pointer"
            >
              <div className="flex flex-col text-right hidden sm:flex">
                <div className="flex items-center gap-space-xs justify-end">
                  <span className="font-title-md text-body-md font-semibold text-on-surface leading-none group-hover:text-primary transition-colors">
                    {profile?.full_name || user?.email?.split("@")[0] || "Student"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase font-bold">
                    {currentTier}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary">
                  {profile?.target_role || "Aspiring Engineer"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:ring-2 ring-primary/30 transition-all">
                {(profile?.full_name || user?.email || "S")[0].toUpperCase()}
              </div>
            </Link>
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
