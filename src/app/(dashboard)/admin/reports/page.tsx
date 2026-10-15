"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";

interface AuditLogEntry {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}

export default function AdminReportsPage() {
  const [selectedRange, setSelectedRange] = useState("this_month");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [exportingReport, setExportingReport] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function fetchAuditLogs() {
    try {
      setLoadingLogs(true);
      const res = await fetch("/api/v1/admin/audit?limit=10");
      if (!res.ok) throw new Error("Failed to load audit logs");
      const json = await res.json();
      setAuditLogs(json.logs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  }

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  function handleTriggerExport(reportName: string) {
    setExportingReport(reportName);
    setTimeout(() => {
      setExportingReport(null);
      triggerToast(`Report "${reportName}" exported successfully.`);
    }, 1500);
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

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-space-xs text-primary text-xs font-semibold tracking-wide uppercase">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Compliant with Indian Tax Code &amp; RBI Guidelines</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Financial Reports &amp; Compliance Exports
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-3xl">
              Generate official transaction ledgers, 18% GST tax filings, Section 194-O TDS deductions, and mentor payout audit sheets with zero ambiguity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={() => handleTriggerExport("Month-End Financial Reconciliation Package")}
              disabled={!!exportingReport}
              className="flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-xs hover:opacity-90 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>{exportingReport ? "Generating..." : "Generate Month-End Package"}</span>
            </button>
          </div>
        </div>

        {/* Date Range Selector Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm p-1.5 rounded-xl bg-surface-container-low shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedRange("this_month")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedRange === "this_month" ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface-variant"
              }`}
            >
              This Month (Jul 2026)
            </button>
            <button
              onClick={() => setSelectedRange("last_month")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedRange === "last_month" ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface-variant"
              }`}
            >
              Last Month (Jun 2026)
            </button>
            <button
              onClick={() => setSelectedRange("q2")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedRange === "q2" ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface-variant"
              }`}
            >
              Q2 2026
            </button>
            <button
              onClick={() => setSelectedRange("fy26")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedRange === "fy26" ? "bg-surface-container-lowest text-primary shadow-xs" : "text-on-surface-variant"
              }`}
            >
              Fiscal Year 2026-27
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 font-mono text-xs text-outline">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            <span>Reconciliation sync completed 4m ago</span>
          </div>
        </div>

        {/* Top 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Total Money Processed</span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                +18.4%
              </span>
            </div>
            <div className="font-stat-metric text-stat-metric text-on-surface font-bold mt-2">₹48,50,000</div>
            <p className="text-xs text-outline mt-1">Total student fees collected before mentor revenue split.</p>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">GST Collected (18%)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                Reconciled
              </span>
            </div>
            <div className="font-stat-metric text-stat-metric text-on-surface font-bold mt-2">₹1,47,966</div>
            <p className="text-xs text-outline mt-1">18% GST collected strictly on DreamX platform commission cut (SAC: 999293).</p>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Mentor Payouts Released</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-fixed text-on-primary-fixed">
                384 Paid
              </span>
            </div>
            <div className="font-stat-metric text-stat-metric text-on-surface font-bold mt-2">₹34,25,500</div>
            <p className="text-xs text-outline mt-1">Released after 3-day (services) or 14-day (programs) escrow hold window.</p>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Audit Trail Integrity</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                Zero Tamper
              </span>
            </div>
            <div className="font-stat-metric text-stat-metric text-on-surface font-bold mt-2">100% WORM</div>
            <p className="text-xs text-outline mt-1">WORM trigger enforced on audit.system_audit_logs. Zero deletions allowed.</p>
          </div>
        </div>

        {/* Primary Export Suites */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {/* Suite 1 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Accounting Standard</span>
                <h3 className="font-bold text-on-surface text-base">General Ledger &amp; Transaction Journal</h3>
                <p className="text-xs text-outline">
                  Line-by-line double-entry accounting ledger of every credit and debit, mapping Razorpay settlement IDs to Supabase order records.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high text-primary">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40 text-xs">
              <span className="text-outline">File formats: CSV &bull; Excel (.xlsx)</span>
              <button
                onClick={() => handleTriggerExport("General Ledger Journal")}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary font-semibold text-on-surface transition-colors"
              >
                Export Ledger (.csv)
              </button>
            </div>
          </div>

          {/* Suite 2 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-tertiary uppercase tracking-wider">Tax Filing Ready</span>
                <h3 className="font-bold text-on-surface text-base">GSTR-1 Monthly Tax Return Export</h3>
                <p className="text-xs text-outline">
                  Government-compliant tax filing sheet formatted with SAC 999293 code, state GST breakdown (CGST/SGST vs IGST), and turnover summaries.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high text-tertiary">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40 text-xs">
              <span className="text-outline">GSTR-1 JSON &bull; Government Offline Tool</span>
              <button
                onClick={() => handleTriggerExport("GSTR-1 Monthly Return")}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-tertiary hover:text-on-tertiary font-semibold text-on-surface transition-colors"
              >
                Export GSTR-1 (.csv)
              </button>
            </div>
          </div>

          {/* Suite 3 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">TDS Compliance</span>
                <h3 className="font-bold text-on-surface text-base">Section 194-O Mentor TDS Deductions</h3>
                <p className="text-xs text-outline">
                  Automated 1% TDS deduction records on e-commerce mentor gross earnings, with PAN mapping for quarterly Form 26Q filing.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high text-secondary">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40 text-xs">
              <span className="text-outline">Form 16A prep &bull; TRACES compatible</span>
              <button
                onClick={() => handleTriggerExport("Section 194-O TDS Deductions")}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-secondary hover:text-on-secondary font-semibold text-on-surface transition-colors"
              >
                Export TDS Sheet (.csv)
              </button>
            </div>
          </div>

          {/* Suite 4 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-error uppercase tracking-wider">Dispute &amp; Chargebacks</span>
                <h3 className="font-bold text-on-surface text-base">Dispute Arbitration Evidence Package</h3>
                <p className="text-xs text-outline">
                  Google Meet attendance logs, session start/end timestamps, and mentor deliverable records compiled for bank chargeback defense.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high text-error">
                <span className="material-symbols-outlined text-[20px]">gavel</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40 text-xs">
              <span className="text-outline">PDF Dossier &bull; Razorpay Chargeback API</span>
              <button
                onClick={() => handleTriggerExport("Dispute Evidence Package")}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-error hover:text-on-error font-semibold text-on-surface transition-colors"
              >
                Generate Dossier (.zip)
              </button>
            </div>
          </div>
        </div>

        {/* Live WORM Audit Stream Container */}
        <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs p-space-lg space-y-space-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-on-surface text-base">Immutable System Audit Log (WORM)</h3>
              <p className="text-xs text-outline">
                Queried directly from <code className="text-primary font-bold">audit.system_audit_logs</code>. Anti-tampering trigger active.
              </p>
            </div>
            <button
              onClick={fetchAuditLogs}
              className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline"
            >
              <span className={`material-symbols-outlined text-[18px] ${loadingLogs ? "animate-spin" : ""}`}>
                autorenew
              </span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-surface-container-high/60 bg-surface-container-low/20 text-on-surface-variant font-semibold uppercase">
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Entity</th>
                  <th className="px-4 py-2.5">Entity ID</th>
                  <th className="px-4 py-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {loadingLogs ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-outline">
                      Loading audit entries...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-outline font-sans">
                      No system audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container-low/20">
                      <td className="px-4 py-2.5 text-outline whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-on-surface font-semibold">
                        {log.entity_type}
                      </td>
                      <td className="px-4 py-2.5 text-outline truncate max-w-xs">
                        {log.entity_id}
                      </td>
                      <td className="px-4 py-2.5 text-on-surface-variant truncate max-w-sm">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
