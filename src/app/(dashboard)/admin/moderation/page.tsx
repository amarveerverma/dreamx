"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminModerationPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("opened");
  const [activeDispute, setActiveDispute] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [penalizeStudent, setPenalizeStudent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadDisputes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/disputes${filter !== "all" ? `?status=${filter}` : ""}`);
      if (!res.ok) throw new Error("Failed to load disputes");
      const json = await res.json();
      setDisputes(json.disputes || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  async function inspectDispute(d: any) {
    setActiveDispute(d);
    setTelemetry(null);
    try {
      setTelemetryLoading(true);
      const res = await fetch(`/api/v1/admin/disputes/${d.id}/telemetry`);
      if (res.ok) {
        const json = await res.json();
        setTelemetry(json.telemetry);
      }
    } catch (err) {
      console.error("Failed to load telemetry:", err);
    } finally {
      setTelemetryLoading(false);
    }
  }

  async function handleArbitrate(decision: "refund" | "dismiss") {
    if (!activeDispute) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/disputes/${activeDispute.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          resolutionNotes,
          penalizeStudent: decision === "dismiss" && penalizeStudent,
        }),
      });

      if (!res.ok) throw new Error(`Failed to arbitrate dispute`);
      setNotification(`Dispute successfully arbitrated: ${decision === "refund" ? "Full refund dispatched to student" : "Dispute dismissed and mentor payout released"}.`);
      setActiveDispute(null);
      setResolutionNotes("");
      setPenalizeStudent(false);
      loadDisputes();
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell>
      <div className="px-space-lg py-space-xl max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-space-xl">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                Dispute Triage &amp; Moderation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-label-sm font-semibold">
                1h Telemetry SLA
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Arbitrate booking disputes with automated session telemetry, attendance records, and deliverable verification.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high/40 shadow-xs">
            {["opened", "under_review", "resolved_refunded", "resolved_dismissed", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-label-sm font-medium transition-colors capitalize ${
                  filter === tab
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {notification && (
          <div className="mb-4 p-3 rounded-lg bg-tertiary-container/20 text-tertiary font-medium text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{notification}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading active disputes...</div>
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-surface-container-high/40">
            <span className="material-symbols-outlined text-4xl text-tertiary mb-2">verified</span>
            <p className="text-on-surface font-semibold">No active disputes in this queue</p>
            <p className="text-body-sm text-on-surface-variant mt-1">Platform dispute rate is currently 0.0%. All sessions healthy.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-high/60 bg-surface-container-low/50 text-label-sm uppercase text-on-surface-variant font-bold">
                    <th className="py-3 px-4">Dispute ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Mentor</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30 text-body-sm">
                  {disputes.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-label-sm text-primary font-semibold">
                        #{d.id.slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-on-surface">{d.student?.full_name || "Student"}</div>
                        <div className="text-label-sm font-mono text-outline">{d.student?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-on-surface">{d.mentor?.full_name || "Mentor"}</div>
                        <div className="text-label-sm text-secondary font-medium">★ {d.mentor?.rolling_rating || 5.0}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high font-mono text-label-sm text-on-surface">
                          {d.reason_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${
                          d.status === "opened"
                            ? "bg-error-container text-on-error-container"
                            : d.status.startsWith("resolved")
                            ? "bg-tertiary/10 text-tertiary"
                            : "bg-surface-container text-primary"
                        }`}>
                          {d.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => inspectDispute(d)}
                          className="px-3 py-1 rounded-md bg-primary text-on-primary hover:opacity-95 transition-opacity text-label-sm font-medium shadow-xs"
                        >
                          Triage Proof
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Side-by-Side Dispute Triage Modal */}
        {activeDispute && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-surface-container-high">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Dispute Triage &amp; Telemetry Inspection
                  </h3>
                  <span className="font-mono text-label-sm text-outline">#{activeDispute.id.slice(0, 8)}</span>
                </div>
                <button onClick={() => setActiveDispute(null)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {telemetryLoading ? (
                <div className="py-12 text-center text-on-surface-variant animate-pulse">
                  Querying session telemetry proof, Google Meet logs, and deliverable signatures...
                </div>
              ) : (
                <div className="py-5 space-y-5">
                  {/* Side-by-Side 3-Column Inspection Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: Student Claim */}
                    <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-high/60 space-y-3">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-label-sm uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        Student Claim
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">{activeDispute.student?.full_name}</div>
                        <div className="text-label-sm text-outline font-mono">{activeDispute.student?.email}</div>
                      </div>
                      <div>
                        <span className="text-label-sm text-outline font-semibold block">Reason Code:</span>
                        <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded font-bold">
                          {activeDispute.reason_code}
                        </span>
                      </div>
                      <div>
                        <span className="text-label-sm text-outline font-semibold block">Student Notes:</span>
                        <p className="text-body-sm text-on-surface bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high/40 mt-1">
                          {activeDispute.student_notes}
                        </p>
                      </div>
                    </div>

                    {/* Column 2: Mentor Rebuttal */}
                    <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-high/60 space-y-3">
                      <div className="flex items-center gap-1.5 text-secondary font-bold text-label-sm uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">school</span>
                        Mentor Defense
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">{activeDispute.mentor?.full_name}</div>
                        <div className="text-label-sm text-outline font-mono">{activeDispute.mentor?.email}</div>
                      </div>
                      <div>
                        <span className="text-label-sm text-outline font-semibold block">Rebuttal Deadline:</span>
                        <span className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                          telemetry?.rebuttalTimer?.isExpired ? "bg-surface-container text-outline" : "bg-primary/10 text-primary"
                        }`}>
                          {telemetry?.rebuttalTimer?.isExpired ? "SLA Window Expired" : `${telemetry?.rebuttalTimer?.minutesRemaining}m remaining`}
                        </span>
                      </div>
                      <div>
                        <span className="text-label-sm text-outline font-semibold block">Mentor Statement:</span>
                        <p className="text-body-sm text-on-surface bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high/40 mt-1">
                          {activeDispute.mentor_rebuttal || "No rebuttal submitted by mentor yet."}
                        </p>
                      </div>
                    </div>

                    {/* Column 3: System Telemetry Proof */}
                    <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-high/60 space-y-3">
                      <div className="flex items-center gap-1.5 text-tertiary font-bold text-label-sm uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">telemetry</span>
                        Automated Proof
                      </div>
                      <div className="space-y-2 text-body-sm">
                        <div className="p-2 rounded bg-surface-container-lowest border border-surface-container-high/40">
                          <span className="text-label-sm text-outline block">Meet Attendance:</span>
                          <div className="flex justify-between font-mono text-xs mt-1">
                            <span>Mentor: <strong>{telemetry?.meetAttendance?.mentorDurationMinutes || 0}m</strong></span>
                            <span>Student: <strong>{telemetry?.meetAttendance?.studentDurationMinutes || 0}m</strong></span>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-surface-container-lowest border border-surface-container-high/40">
                          <span className="text-label-sm text-outline block">Deliverable Valid?:</span>
                          <span className={`text-xs font-bold ${telemetry?.deliverableCheck?.hasDeliverable ? "text-tertiary" : "text-error"}`}>
                            {telemetry?.deliverableCheck?.hasDeliverable ? "PDF Uploaded & Valid" : "No Deliverable Found"}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-surface-container-lowest border border-surface-container-high/40">
                          <span className="text-label-sm text-outline block">Student Risk Rating:</span>
                          <div className="flex justify-between text-xs mt-1">
                            <span>Dispute Rate: <strong>{telemetry?.studentRiskProfile?.disputeRatePercent || 0}%</strong></span>
                            <span className={`font-bold ${telemetry?.studentRiskProfile?.isAbuseFlagged ? "text-error" : "text-tertiary"}`}>
                              {telemetry?.studentRiskProfile?.riskLevel || "LOW"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Input Area */}
                  <div className="bg-surface-container-low p-4 rounded-xl space-y-3">
                    <label htmlFor="arbitration-notes" className="text-label-sm uppercase font-bold text-outline block">
                      Arbitrator Judgment Notes &amp; Rationale
                    </label>
                    <textarea
                      id="arbitration-notes"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter official arbitration rationale based on telemetry evidence (recorded to WORM audit log)..."
                      className="w-full p-2.5 rounded-lg border border-surface-container-high bg-surface-container-lowest text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      rows={2}
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="penalize-toggle"
                        checked={penalizeStudent}
                        onChange={(e) => setPenalizeStudent(e.target.checked)}
                        className="w-4 h-4 rounded text-error accent-error cursor-pointer"
                      />
                      <label htmlFor="penalize-toggle" className="text-body-sm text-on-surface cursor-pointer select-none">
                        Flag this claim as frivolous / abusive (Issues +1 Strike to student account; 3 strikes auto-blocks disputes).
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high">
                <button
                  disabled={submitting}
                  onClick={() => setActiveDispute(null)}
                  className="px-4 py-2 rounded-lg text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors font-medium"
                >
                  Close Inspection
                </button>
                <button
                  disabled={submitting || telemetryLoading}
                  onClick={() => handleArbitrate("dismiss")}
                  className="px-4 py-2 rounded-lg text-body-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-semibold"
                >
                  Dismiss Dispute (Release Payout)
                </button>
                <button
                  disabled={submitting || telemetryLoading}
                  onClick={() => handleArbitrate("refund")}
                  className="px-4 py-2 rounded-lg text-body-sm bg-error-container text-on-error-container hover:opacity-90 transition-opacity font-semibold"
                >
                  Approve 100% Refund to Student
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
