"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending_review");
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadMentors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/mentors?status=${filter}`);
      if (!res.ok) throw new Error("Failed to load mentors");
      const json = await res.json();
      setMentors(json.mentors || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  async function handleAction(action: "approve" | "reject") {
    if (!selectedMentor) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/mentors/${selectedMentor.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: actionNotes }),
      });
      if (!res.ok) throw new Error(`Failed to ${action} mentor`);
      setNotification(`Mentor ${action === "approve" ? "approved and upgraded to active mentor" : "application rejected"}.`);
      setSelectedMentor(null);
      setActionNotes("");
      loadMentors();
      setTimeout(() => setNotification(null), 4000);
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
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Mentor Verification Queue
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Review credential submissions, employment proof, and approve mentor capabilities.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high/40 shadow-xs">
            {["pending_review", "active", "rejected", "all"].map((tab) => (
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
          <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading mentor records...</div>
        ) : mentors.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-surface-container-high/40">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">verified_user</span>
            <p className="text-on-surface font-semibold">No mentors in this queue</p>
            <p className="text-body-sm text-on-surface-variant mt-1">All applications in this category have been processed.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-high/60 bg-surface-container-low/50 text-label-sm uppercase text-on-surface-variant font-bold">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Headline / Role</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30 text-body-sm">
                  {mentors.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-on-surface">{m.full_name}</div>
                        <div className="text-label-sm font-mono text-outline">{m.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant max-w-xs truncate">
                        {m.headline || "No headline provided"}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-on-surface">
                        {m.years_experience ? `${m.years_experience} yrs` : "N/A"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${
                          m.verification_status === "active"
                            ? "bg-tertiary/10 text-tertiary"
                            : m.verification_status === "rejected"
                            ? "bg-error-container text-on-error-container"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {m.verification_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedMentor(m)}
                          className="px-3 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors text-label-sm font-medium"
                        >
                          Review KYC
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC Review Modal */}
        {selectedMentor && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-xl border border-surface-container-high">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Review Mentor Application
                </h3>
                <button onClick={() => setSelectedMentor(null)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="py-4 space-y-3 text-body-sm">
                <div>
                  <span className="text-label-sm uppercase font-bold text-outline block">Full Name</span>
                  <span className="font-semibold text-on-surface text-base">{selectedMentor.full_name}</span>
                </div>
                <div>
                  <span className="text-label-sm uppercase font-bold text-outline block">Email</span>
                  <span className="font-mono text-on-surface">{selectedMentor.email}</span>
                </div>
                <div>
                  <span className="text-label-sm uppercase font-bold text-outline block">Headline &amp; Bio</span>
                  <p className="text-on-surface-variant bg-surface-container-low p-2 rounded-md mt-1">
                    {selectedMentor.bio || selectedMentor.headline || "No details provided"}
                  </p>
                </div>
                <div>
                  <label htmlFor="mentor-decision-notes" className="text-label-sm uppercase font-bold text-outline block mb-1">
                    Audit Notes / Justification
                  </label>
                  <textarea
                    id="mentor-decision-notes"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter verification notes (e.g., Verified Google corporate badge via email)..."
                    className="w-full p-2.5 rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-container-high">
                <button
                  disabled={submitting}
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 rounded-lg text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleAction("reject")}
                  className="px-4 py-2 rounded-lg text-body-sm bg-error-container text-on-error-container hover:opacity-90 transition-opacity font-medium"
                >
                  Reject Application
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleAction("approve")}
                  className="px-4 py-2 rounded-lg text-body-sm bg-primary text-on-primary hover:opacity-90 transition-opacity font-medium"
                >
                  Approve &amp; Activate Mentor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
