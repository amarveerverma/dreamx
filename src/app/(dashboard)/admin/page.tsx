"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOverview() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/overview");
      if (!res.ok) throw new Error("Failed to load overview data");
      const json = await res.json();
      setData(json.kpis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <AdminShell>
      <div className="px-space-lg py-space-xl max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md mb-space-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                Executive Overview
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary text-label-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                Live Telemetry
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant max-w-2xl">
              Live platform heartbeat, financial settlement velocity, mentor liquidity, and dispute triage across India MVP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={fetchOverview}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface shadow-xs hover:bg-surface-container-high transition-colors text-label-md font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
              <span>Refresh Telemetry</span>
            </button>
            <Link
              href="/admin/moderation"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary shadow-xs hover:opacity-95 transition-opacity text-label-md font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              <span>Open Dispute Triage</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-lg animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-surface-container-high/40 rounded-xl"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-space-lg rounded-xl bg-error-container text-on-error-container">
            <p className="font-semibold">Failed to load telemetry:</p>
            <p className="text-body-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* 4 Primary Executive KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-lg mb-space-xl">
              {/* Card 1: Total Sales GMV */}
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-overline uppercase tracking-wider text-on-surface-variant font-bold">
                      Gross Merchandise Value (GMV)
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      ₹
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold tracking-tight text-on-surface">
                      ₹{data?.totalGmv?.toLocaleString("en-IN") || "0"}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-surface-container-high/40 flex items-center justify-between text-label-sm text-tertiary font-medium">
                  <span>Processed via Razorpay</span>
                  <span className="text-on-surface-variant">India MVP</span>
                </div>
              </div>

              {/* Card 2: Platform Commission Revenue */}
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-overline uppercase tracking-wider text-on-surface-variant font-bold">
                      Platform Retained Margin
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[18px]">savings</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold tracking-tight text-on-surface">
                      ₹{data?.totalPlatformRevenue?.toLocaleString("en-IN") || "0"}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-surface-container-high/40 flex items-center justify-between text-label-sm text-tertiary font-medium">
                  <span>20% Services • 15% Programs</span>
                  <span>18% GST Accounted</span>
                </div>
              </div>

              {/* Card 3: Active Verified Mentors */}
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-overline uppercase tracking-wider text-on-surface-variant font-bold">
                      Active Supply (Mentors)
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold tracking-tight text-on-surface">
                      {data?.verifiedMentors || 0}
                    </span>
                    <span className="text-label-sm text-primary font-semibold">
                      +{data?.pendingMentors || 0} pending review
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-surface-container-high/40 flex items-center justify-between text-label-sm text-on-surface-variant">
                  <Link href="/admin/mentors" className="text-primary hover:underline font-medium">
                    Review KYC Queue →
                  </Link>
                </div>
              </div>

              {/* Card 4: Active Disputes & Trust */}
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-overline uppercase tracking-wider text-on-surface-variant font-bold">
                      Dispute Triage Queue
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data?.activeDisputes > 0 ? "bg-error-container text-on-error-container" : "bg-tertiary/10 text-tertiary"}`}>
                      <span className="material-symbols-outlined text-[18px]">gavel</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold tracking-tight text-on-surface">
                      {data?.activeDisputes || 0}
                    </span>
                    <span className="text-label-sm text-on-surface-variant font-medium">
                      1h Telemetry SLA
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-surface-container-high/40 flex items-center justify-between text-label-sm text-on-surface-variant">
                  <Link href="/admin/moderation" className="text-error hover:underline font-medium">
                    Inspect Telemetry Proof →
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Operational Control Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg mb-space-xl">
              {/* Liquidity Meter */}
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high/40">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                    Marketplace Liquidity
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-label-sm font-medium bg-tertiary/10 text-tertiary">
                    Target: &gt;60%
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-body-sm mb-1 font-medium">
                      <span className="text-on-surface-variant">Active Liquidity Ratio</span>
                      <span className="text-on-surface font-bold">{data?.liquidityRatio || 0}%</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, data?.liquidityRatio || 0)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-surface-container-high/40 grid grid-cols-2 gap-2 text-body-sm">
                    <div>
                      <span className="text-label-sm text-on-surface-variant block">Total Bookings</span>
                      <span className="text-lg font-bold text-on-surface">{data?.totalBookings || 0}</span>
                    </div>
                    <div>
                      <span className="text-label-sm text-on-surface-variant block">Registered Users</span>
                      <span className="text-lg font-bold text-on-surface">{data?.totalUsers || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Architecture Status */}
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high/40">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                    System Reliability
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-label-sm font-medium bg-tertiary/10 text-tertiary">
                    {data?.systemHealth || "ONLINE"}
                  </span>
                </div>
                <div className="space-y-3 text-body-sm">
                  <div className="flex items-center justify-between py-1 border-b border-surface-container-high/40">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">database</span>
                      Supabase PostgreSQL 16
                    </span>
                    <span className="font-mono text-tertiary font-semibold">RLS Active</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-surface-container-high/40">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span>
                      pg_cron Sweeps
                    </span>
                    <span className="font-mono text-tertiary font-semibold">Active (Every 1m)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-surface-container-high/40">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">payments</span>
                      Razorpay Route Escrow
                    </span>
                    <span className="font-mono text-tertiary font-semibold">3d/14d Hold</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">policy</span>
                      WORM Audit Trail
                    </span>
                    <span className="font-mono text-tertiary font-semibold">Append-Only</span>
                  </div>
                </div>
              </div>

              {/* Quick Admin Actions */}
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-3">
                    Fast Administrative Access
                  </h2>
                  <div className="space-y-2">
                    <Link
                      href="/admin/users"
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors text-body-sm text-on-surface font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">group</span>
                        <span>Manage Users &amp; Suspensions</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                    <Link
                      href="/admin/payments"
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors text-body-sm text-on-surface font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary">payments</span>
                        <span>Payout Releases &amp; Escrow Holds</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                    <Link
                      href="/admin/marketplace"
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors text-body-sm text-on-surface font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">storefront</span>
                        <span>Service Catalog &amp; Matching Queue</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
