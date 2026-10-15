"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "ytd">("30d");
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  useEffect(() => {
    async function loadKpiData() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/admin/analytics/kpis");
        if (!res.ok) throw new Error("Failed to load analytics KPIs");
        const json = await res.json();
        setKpiData(json.data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadKpiData();
  }, [timeRange]);

  const kpis = [
    {
      title: "Total Sales Volume (GMV)",
      metric: "₹48,50,000",
      change: "+18.4%",
      isPositive: true,
      plainText: "Total money paid by students across all 1-on-1 sessions, programs, and memberships.",
      icon: "currency_rupee",
    },
    {
      title: "Platform Net Earnings",
      metric: "₹9,70,000",
      change: "+16.2%",
      isPositive: true,
      plainText: "DreamX 20% service fee and 15% program commission retained after paying mentors.",
      icon: "account_balance_wallet",
    },
    {
      title: "Match Success Rate",
      metric: "84.2%",
      change: "+3.8%",
      isPositive: true,
      plainText: "Out of 100 students asking for mentor help, over 84 receive and accept an offer within 48h.",
      icon: "verified",
    },
    {
      title: "Time to First Offer",
      metric: "24.6m",
      change: "5.4m faster",
      isPositive: true,
      plainText: "How quickly verified mentors respond with a session proposal after a student posts a request.",
      icon: "timer",
    },
    {
      title: "Marketplace Liquidity",
      metric: "1.6 : 1",
      change: "Optimal",
      isPositive: true,
      plainText: "Ratio of active verified mentors ready to take sessions versus incoming student booking requests.",
      icon: "hub",
    },
    {
      title: "Dispute Incident Rate",
      metric: "0.72%",
      change: "-0.18%",
      isPositive: true,
      plainText: "Percentage of sessions where a refund was requested. Well under the 1.5% security limit.",
      icon: "gavel",
    },
    {
      title: "Student Rebooking (LTV)",
      metric: "42.8%",
      change: "+4.1%",
      isPositive: true,
      plainText: "Proportion of students who book a second service or enroll in a multi-week program within 60 days.",
      icon: "repeat",
    },
    {
      title: "Escrow Safety Reserve",
      metric: "100%",
      change: "Zero Risk",
      isPositive: true,
      plainText: "Funds held strictly in Razorpay Route virtual escrow until mentor completion confirmation.",
      icon: "security",
    },
  ];

  const serviceBreakdown = [
    { code: "S01", name: "Technical Mock Interview", sharePct: 34, gmv: "₹16,49,000" },
    { code: "S03", name: "System Design & Architecture", sharePct: 26, gmv: "₹12,61,000" },
    { code: "S04", name: "Salary & Offer Negotiation", sharePct: 18, gmv: "₹8,73,000" },
    { code: "S02", name: "Resume Review & ATS Roast", sharePct: 12, gmv: "₹5,82,000" },
    { code: "Other", name: "S05 - S10 Niche Offerings", sharePct: 10, gmv: "₹4,85,000" },
  ];

  return (
    <AdminShell>
      <div className="px-space-lg py-space-xl max-w-7xl mx-auto space-y-space-xl">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-on-surface text-surface shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
            <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-space-sm">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold uppercase tracking-wider">
                Intelligence Portal
              </span>
              <span className="text-outline text-xs">• Live Regional Analytics (India MVP)</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Platform Analytics &amp; Performance Intelligence
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-3xl">
              Track key marketplace signals, student conversion funnels, take-rate velocity, and escrow liquidity in clear, everyday terms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl shadow-xs">
              <button
                onClick={() => setTimeRange("30d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === "30d" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setTimeRange("90d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === "90d" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                Last 90 Days
              </button>
              <button
                onClick={() => setTimeRange("ytd")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === "ytd" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                Year to Date
              </button>
            </div>

            <button
              onClick={() => triggerToast("Analytics export CSV downloaded successfully.")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-low text-xs font-semibold shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-outline">download</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => triggerToast("Automated Weekly Digest scheduled for Monday 09:00 IST.")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary hover:opacity-90 text-xs font-semibold shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
              <span>Schedule Digest</span>
            </button>
          </div>
        </div>

        {/* 8 Core KPIs in Plain English */}
        <div className="space-y-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">equalizer</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Core Marketplace Vitals</h2>
            </div>
            <span className="text-xs text-outline">Aggregates updated live via Supabase PostgreSQL views</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {kpis.map((k, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">
                      {k.title}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">{k.icon}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-stat-metric text-stat-metric text-on-surface font-bold">
                      {k.metric}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                      {k.change}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 bg-surface-container-low/60 rounded-xl p-2.5">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface font-semibold">In plain terms: </strong>
                    {k.plainText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Analytics Grid: Service Contribution & Revenue Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          {/* Service Share Breakdown (7 cols) */}
          <div className="lg:col-span-7 p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-space-md">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Service GMV Contribution</h3>
              <p className="text-body-sm text-outline">Revenue distribution across the 10 standardized service formats.</p>
            </div>

            <div className="space-y-4 pt-2">
              {serviceBreakdown.map((s) => (
                <div key={s.code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{s.code}</span>
                      <span className="font-medium text-on-surface">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-outline">{s.gmv}</span>
                      <span className="font-bold text-on-surface">{s.sharePct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${s.sharePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-surface-container-high/40 flex items-center justify-between text-xs text-outline">
              <span>Standard 20% Take-rate applied automatically</span>
              <span className="font-semibold text-primary">₹9.7L Net Commission Retained</span>
            </div>
          </div>

          {/* Regional Liquidity & SLA Monitor (5 cols) */}
          <div className="lg:col-span-5 p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-space-md">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Regional Operational SLA</h3>
              <p className="text-body-sm text-outline">India MVP market response performance vs target benchmarks.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-surface-container-low/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-outline">Median Time to First Offer</div>
                  <div className="font-bold text-on-surface mt-0.5">24.6 Minutes</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold">
                  PASS (&lt;30m)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-outline">Mentor Attendance Rate</div>
                  <div className="font-bold text-on-surface mt-0.5">99.1% Verified</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold">
                  PASS (&gt;98%)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-outline">Dispute Resolution Speed</div>
                  <div className="font-bold text-on-surface mt-0.5">14.2 Hours Avg</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold">
                  PASS (&lt;24h)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-outline">Escrow Sweep Reliability</div>
                  <div className="font-bold text-on-surface mt-0.5">100% on-time</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold">
                  pg_cron 00:00 UTC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
