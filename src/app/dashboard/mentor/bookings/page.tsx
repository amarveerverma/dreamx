"use client";

import React, { useEffect, useState } from "react";
import { MentorDashboardShell } from "@/components/layout/MentorDashboardShell";

export default function MentorBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  // Complete Deliverable Modal
  const [completeModal, setCompleteModal] = useState<{
    bookingId: string;
    studentName: string;
    serviceTitle: string;
  } | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState("https://ogpgoxikulkfpyoorisc.supabase.co/storage/v1/object/public/deliverables/session_notes.pdf");
  const [completing, setCompleting] = useState(false);

  async function loadBookings() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/mentors/me/bookings");
      if (!res.ok) throw new Error("Failed to load mentor bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCompleteSession(e: React.FormEvent) {
    e.preventDefault();
    if (!completeModal) return;

    try {
      setCompleting(true);
      const res = await fetch(`/api/v1/bookings/${completeModal.bookingId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverable_file_url: deliverableUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to complete session");
      }

      alert("Session completed! 3-day escrow hold initiated. Payout will disburse automatically.");
      setCompleteModal(null);
      await loadBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCompleting(false);
    }
  }

  const filtered = bookings.filter((b) => {
    if (filter === "upcoming") return ["confirmed", "pending_payment", "in_progress"].includes(b.status);
    if (filter === "completed") return ["completed", "deliverable_submitted"].includes(b.status);
    return true;
  });

  const totalEarnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + Number(b.mentor_earning || 0), 0);

  const pendingHeld = bookings
    .filter((b) => b.payout_status === "held")
    .reduce((sum, b) => sum + Number(b.mentor_earning || 0), 0);

  return (
    <MentorDashboardShell>
      <div className="py-space-md mb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-tertiary">
            <span>Mentor Portal</span>
            <span>/</span>
            <span>Bookings</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">Scheduled Sessions & Escrow Payouts</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Mentor Sessions & Deliverables
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage your scheduled mentorship sessions, join live Google Meet calls, and submit deliverables to unlock 3-day escrow payout releases.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mb-space-lg">
        <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <span className="text-xs font-semibold uppercase text-tertiary">Active Bookings</span>
          <div className="text-2xl font-bold text-on-surface mt-2">
            {bookings.filter((b) => ["confirmed", "pending_payment"].includes(b.status)).length} Sessions
          </div>
          <p className="text-xs text-tertiary mt-1">Google Meet links populated upon confirmation</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <span className="text-xs font-semibold uppercase text-secondary">Escrow Held Balance</span>
          <div className="text-2xl font-bold text-secondary mt-2">
            ₹{pendingHeld.toFixed(2)} INR
          </div>
          <p className="text-xs text-tertiary mt-1">Under 72-hour dispute-safe hold</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <span className="text-xs font-semibold uppercase text-primary">Completed Earnings</span>
          <div className="text-2xl font-bold text-primary mt-2">
            ₹{totalEarnings.toFixed(2)} INR
          </div>
          <p className="text-xs text-tertiary mt-1">80% Net after platform commission</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-space-lg">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            filter === "all"
              ? "bg-secondary text-white shadow-sm"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          }`}
        >
          All Sessions ({bookings.length})
        </button>
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            filter === "upcoming"
              ? "bg-secondary text-white shadow-sm"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            filter === "completed"
              ? "bg-secondary text-white shadow-sm"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-tertiary">
          <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-3"></div>
          Loading scheduled sessions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-container-lowest text-center max-w-xl mx-auto border border-surface-container my-8">
          <span className="material-symbols-outlined text-secondary text-[40px] mb-2">event_available</span>
          <h3 className="font-headline-sm text-lg font-bold mb-2">No Sessions in View</h3>
          <p className="text-tertiary text-sm">
            When students book your catalog services or accept your bids, their sessions appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg mb-12">
          {filtered.map((b) => {
            const start = new Date(b.scheduled_start_utc);
            const isConfirmed = b.status === "confirmed";
            const isCompleted = b.status === "completed";

            return (
              <div
                key={b.id}
                className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isConfirmed
                          ? "bg-green-100 text-green-700"
                          : isCompleted
                          ? "bg-surface-container text-tertiary"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-bold text-on-surface">
                      Your Payout: ₹{b.mentor_earning} INR
                    </span>
                  </div>

                  <h3 className="font-title-md text-lg font-bold text-on-surface mb-1">
                    {b.service?.title || "1-on-1 Mentorship Session"}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-tertiary mb-4">
                    <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
                    <span>
                      {start.toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      •{" "}
                      {start.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low mb-4 text-xs">
                    <div className="font-semibold text-on-surface">
                      Student: {b.student?.full_name || "Enrolled Student"}
                    </div>
                    <div className="text-tertiary mt-0.5">
                      Fee split: Gross ₹{b.gross_amount} • 20% Fee ₹{b.platform_fee}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-container flex flex-col gap-2">
                  {isConfirmed && b.meeting_url && (
                    <a
                      href={b.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-semibold text-center text-sm hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">videocam</span>
                      <span>Join Google Meet</span>
                    </a>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() =>
                        setCompleteModal({
                          bookingId: b.id,
                          studentName: b.student?.full_name || "Student",
                          serviceTitle: b.service?.title || "Session",
                        })
                      }
                      className="w-full py-2.5 px-4 rounded-xl bg-secondary text-white font-semibold text-center text-sm hover:opacity-95 transition-opacity shadow-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Complete Session & Submit Deliverable</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="p-2.5 rounded-xl bg-green-50 text-green-800 text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Completed</span>
                      </span>
                      <span className="text-[11px] text-green-600">
                        Hold: {b.payout_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-container">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-1">
              Complete Session Deliverable
            </h2>
            <p className="text-xs text-tertiary mb-4">
              Student: <strong className="text-on-surface">{completeModal.studentName}</strong> for {completeModal.serviceTitle}.
            </p>

            <form onSubmit={handleCompleteSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                  Deliverable Document URL (Report / PDF / Sandbox)
                </label>
                <input
                  type="text"
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="https://ogpgoxikulkfpyoorisc.supabase.co/..."
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm"
                  required
                />
                <span className="text-[11px] text-tertiary mt-1 block">
                  Per PRD §3.A, submitting your deliverable transitions the booking to <code>completed</code> and begins the mandatory 72-hour escrow release hold.
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setCompleteModal(null)}
                  className="px-4 py-2 rounded-xl text-tertiary hover:text-on-surface text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completing}
                  className="px-6 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:opacity-90 shadow-sm"
                >
                  {completing ? "Submitting..." : "Submit Deliverable & Trigger Hold"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MentorDashboardShell>
  );
}
