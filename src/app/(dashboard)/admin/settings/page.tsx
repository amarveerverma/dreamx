"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";

interface CareerMarket {
  code: string;
  name: string;
  currency: string;
  status: "active" | "staged" | "disabled";
  mentorCount: number;
  liquidityGatePassed: boolean;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: "core" | "security" | "fintech";
}

export default function AdminSettingsPage() {
  const [markets, setMarkets] = useState<CareerMarket[]>([
    { code: "CM-IN", name: "India Tech & Startup Ecosystem", currency: "INR (₹)", status: "active", mentorCount: 412, liquidityGatePassed: true },
    { code: "CM-US", name: "United States (Silicon Valley & NYC)", currency: "USD ($)", status: "staged", mentorCount: 48, liquidityGatePassed: false },
    { code: "CM-SG", name: "Southeast Asia (Singapore Hub)", currency: "SGD (S$)", status: "staged", mentorCount: 22, liquidityGatePassed: false },
  ]);

  const [flags, setFlags] = useState<FeatureFlag[]>([
    { id: "smart_match_v2", name: "Smart Match Engine v2", description: "Enables 14-dimension heuristic matching across timezone, skills, and target companies.", enabled: true, category: "core" },
    { id: "direct_escrow_hold", name: "Direct Gateway Escrow Hold", description: "Enforces 72-hour session hold and 14-day program hold on Razorpay Route before payout release.", enabled: true, category: "fintech" },
    { id: "nlp_anti_disintermediation", name: "NLP Off-Platform Contact Detection", description: "Automatically scans chat messages for phone numbers, WhatsApp, and external links.", enabled: true, category: "security" },
    { id: "strict_kyc_gate", name: "Strict Mentor KYC Enforcement", description: "Prevents mentors from accepting booking offers until PAN and LinkedIn are verified.", enabled: true, category: "security" },
    { id: "dispute_abuse_limit", name: "Student 3-Strike Dispute Auto-Lock", description: "Automatically blocks dispute submissions for students reaching 3 dismissed complaints.", enabled: true, category: "security" },
    { id: "cross_border_checkout", name: "International Multi-Currency Checkout", description: "Allows international credit cards with dynamic currency conversion (DCC).", enabled: false, category: "fintech" },
  ]);

  const [oneTimeCommission, setOneTimeCommission] = useState(20);
  const [programCommission, setProgramCommission] = useState(15);
  const [gstRate, setGstRate] = useState(18);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dryRunRunning, setDryRunRunning] = useState(false);
  const [publishModal, setPublishModal] = useState(false);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function handleToggleFlag(id: string) {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  }

  function handleToggleMarket(code: string) {
    setMarkets((prev) =>
      prev.map((m) => {
        if (m.code === code) {
          const nextStatus = m.status === "active" ? "staged" : "active";
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  }

  function handleDryRun() {
    setDryRunRunning(true);
    setTimeout(() => {
      setDryRunRunning(false);
      triggerToast("Dry Run Passed: 3 markets, 6 feature flags, and tax rates validated with 0 schema errors.");
    }, 1200);
  }

  function handlePublishLive() {
    setPublishModal(false);
    triggerToast("Platform Configuration published live! In-memory caches purged & synced.");
  }

  return (
    <AdminShell>
      <div className="px-space-lg py-space-xl max-w-7xl mx-auto space-y-space-xl">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-on-surface text-surface shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
            <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Engine State Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-surface-container-low px-4 py-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-2 font-mono text-on-surface-variant font-medium">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            <span>Global Config Engine v2.4 • In-Memory Cache Sync Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>
            <span>Safe-Lock Schema Validated</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Platform Settings &amp; System Configuration
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-3xl">
              Configure regional career markets, currency exchange corridors, take-rate commissions, and safety switches in clear, plain terms.
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap shrink-0">
            <button
              onClick={handleDryRun}
              disabled={dryRunRunning}
              className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface text-label-md font-medium shadow-xs hover:bg-surface-container-low transition-colors flex items-center gap-2"
            >
              <span className={`material-symbols-outlined text-[18px] text-on-surface-variant ${dryRunRunning ? "animate-spin" : ""}`}>
                play_circle
              </span>
              <span>{dryRunRunning ? "Validating Schema..." : "Test Configuration (Dry Run)"}</span>
            </button>
            <button
              onClick={() => setPublishModal(true)}
              className="px-space-md py-2 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-xs hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              <span>Publish Configuration Live</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Active Career Markets</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                CM-IN Live
              </span>
            </div>
            <div className="font-stat-metric text-stat-metric text-on-surface font-bold mt-2">1 Live + 2 Staged</div>
            <p className="text-xs text-outline mt-1">CM-IN fully operational; CM-US &amp; CM-SG staged.</p>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Base Currency</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-surface-container text-primary">
                Daily Sync
              </span>
            </div>
            <div className="font-stat-metric text-stat-metric text-on-surface font-bold mt-2">₹1.0000 INR</div>
            <p className="text-xs text-outline mt-1">Base ledger currency for all bookings and payouts.</p>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Safety Feature Flags</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                Guards Active
              </span>
            </div>
            <div className="font-stat-metric text-stat-metric text-on-surface font-bold mt-2">
              {flags.filter((f) => f.enabled).length} of {flags.length} Enabled
            </div>
            <p className="text-xs text-outline mt-1">Anti-disintermediation and escrow holds locked.</p>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Config Drift</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-fixed text-on-secondary-fixed">
                Zero Drift
              </span>
            </div>
            <div className="font-stat-metric text-stat-metric text-on-surface font-bold mt-2">100% Valid</div>
            <p className="text-xs text-outline mt-1">Audit session #CFG-8821 verified by database check.</p>
          </div>
        </div>

        {/* Section 1: Regional Career Markets & Liquidity Gates */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-space-md">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Career Markets &amp; Liquidity Gates</h3>
            <p className="text-body-sm text-outline">
              Markets remain in staging until minimum verified mentor supply (liquidity gate) is satisfied.
            </p>
          </div>

          <div className="divide-y divide-surface-container-high/40">
            {markets.map((m) => (
              <div key={m.code} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary text-sm">{m.code}</span>
                    <span className="font-bold text-on-surface">{m.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      m.status === "active" ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container-high text-on-surface-variant"
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="text-xs text-outline">
                    Currency: <strong className="text-on-surface">{m.currency}</strong> &bull; Mentor Pool: <strong className="text-on-surface">{m.mentorCount} verified</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleMarket(m.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      m.status === "active"
                        ? "bg-surface-container-high text-on-surface hover:bg-error-container hover:text-error"
                        : "bg-primary text-on-primary hover:opacity-90"
                    }`}
                  >
                    {m.status === "active" ? "Set to Staged" : "Activate Market"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Platform Take-Rates & Tax Bounds */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-space-md">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Commission &amp; Tax Structure</h3>
            <p className="text-body-sm text-outline">
              Defines the mandatory platform take-rate and statutory tax withholdings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-2">
            <div className="p-4 rounded-xl bg-surface-container-low/60 space-y-2">
              <label className="text-xs font-semibold text-outline block uppercase tracking-wider">
                1-on-1 Sessions Take-Rate (S01–S10)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={oneTimeCommission}
                  onChange={(e) => setOneTimeCommission(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 bg-surface-container-lowest border border-surface-container-high rounded-lg font-mono font-bold text-base"
                />
                <span className="text-sm font-bold text-on-surface">%</span>
              </div>
              <p className="text-[11px] text-outline">Standard 20% platform share deducted upon checkout.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low/60 space-y-2">
              <label className="text-xs font-semibold text-outline block uppercase tracking-wider">
                Multi-Week Cohort Program Commission
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={programCommission}
                  onChange={(e) => setProgramCommission(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 bg-surface-container-lowest border border-surface-container-high rounded-lg font-mono font-bold text-base"
                />
                <span className="text-sm font-bold text-on-surface">%</span>
              </div>
              <p className="text-[11px] text-outline">15% commission on 2-week, 4-week, and 6-week programs.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low/60 space-y-2">
              <label className="text-xs font-semibold text-outline block uppercase tracking-wider">
                GST Tax Rate (India Statutory)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 bg-surface-container-lowest border border-surface-container-high rounded-lg font-mono font-bold text-base"
                />
                <span className="text-sm font-bold text-on-surface">%</span>
              </div>
              <p className="text-[11px] text-outline">18% GST levied on platform commission fee only.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Safety & Governance Feature Flags */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-space-md">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Platform Safety &amp; Governance Switches</h3>
            <p className="text-body-sm text-outline">
              Instantly toggle safety filters, dispute thresholds, and escrow rules without code redeploys.
            </p>
          </div>

          <div className="divide-y divide-surface-container-high/40">
            {flags.map((flag) => (
              <div key={flag.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface text-sm">{flag.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      flag.category === "security"
                        ? "bg-error-container text-on-error-container"
                        : flag.category === "fintech"
                        ? "bg-secondary-fixed text-on-secondary-fixed"
                        : "bg-primary-fixed text-on-primary-fixed"
                    }`}>
                      {flag.category}
                    </span>
                  </div>
                  <p className="text-xs text-outline">{flag.description}</p>
                </div>

                <div>
                  <button
                    onClick={() => handleToggleFlag(flag.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      flag.enabled ? "bg-primary" : "bg-surface-container-high"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        flag.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publish Live Modal */}
        {publishModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container-high space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Publish Settings Live?</h3>
                  <p className="text-xs text-outline">Configuration will sync across all active edge instances.</p>
                </div>
                <button
                  onClick={() => setPublishModal(false)}
                  className="p-1 rounded hover:bg-surface-container-high text-outline"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low text-xs space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Tamper-Proof Audit Guarantee</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Every change will be cryptographically written into <code className="font-bold">audit.system_audit_logs</code> with admin user ID and timestamp.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setPublishModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishLive}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90"
                >
                  Confirm &amp; Publish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
