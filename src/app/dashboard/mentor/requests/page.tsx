"use client";

import React, { useEffect, useState } from "react";
import { MentorDashboardShell } from "@/components/layout/MentorDashboardShell";

export default function MentorRequestsMarketplacePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidModal, setBidModal] = useState<{
    requestId: string;
    studentName: string;
    serviceTitle: string;
    budgetMin: number;
    budgetMax: number;
  } | null>(null);

  const [bidPrice, setBidPrice] = useState<number>(1000);
  const [bidPitch, setBidPitch] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);

  async function loadMarketplace() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/smart-match/requests?view=marketplace");
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarketplace();
  }, []);

  async function handleSubmitBid(e: React.FormEvent) {
    e.preventDefault();
    if (!bidModal) return;

    try {
      setSubmittingBid(true);
      const res = await fetch("/api/v1/marketplace/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: bidModal.requestId,
          price: bidPrice,
          currency: "INR",
          mentor_pitch: bidPitch,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit bid");
      }

      alert("Offer submitted successfully! Student has 24 hours to review.");
      setBidModal(null);
      setBidPitch("");
      await loadMarketplace();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingBid(false);
    }
  }

  return (
    <MentorDashboardShell>
      <div className="py-space-md mb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-tertiary">
            <span>Mentor Portal</span>
            <span>/</span>
            <span>Marketplace</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">Student Requests & Live Bidding</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Student Mentorship Requests
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Browse verified students actively seeking mock interviews, resume teardowns, and system design coaching. Place your bids to win engagements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            80% Net Payout • 3-Day Escrow Release
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-tertiary">
          <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-3"></div>
          Scanning marketplace for active student broadcasts...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-container-lowest text-center max-w-xl mx-auto border border-surface-container my-12">
          <span className="material-symbols-outlined text-secondary text-[40px] mb-2">radar</span>
          <h3 className="font-headline-sm text-lg font-bold mb-2">No Open Broadcasts</h3>
          <p className="text-tertiary text-sm">
            All current student requests have received max bids or been booked. New broadcasts appear in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg mb-12">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-primary-fixed text-on-primary-fixed">
                    {req.status}
                  </span>
                  <span className="text-xs text-tertiary font-mono">
                    Budget: ₹{req.budget_min} – ₹{req.budget_max}
                  </span>
                </div>

                <h3 className="font-title-md text-lg font-bold text-on-surface mb-1">
                  {req.service?.title || "Career Consultation"}
                </h3>

                <div className="flex items-center gap-2 text-sm text-tertiary mb-4">
                  <span className="material-symbols-outlined text-[16px] text-secondary">person</span>
                  <span>Student: {req.student?.full_name || "Verified Student"}</span>
                  <span>•</span>
                  <span>Market: {req.target_career_market_id}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-primary">event</span>
                    <span>Requested Date: <strong className="text-on-surface">{req.preferred_date}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                    <span>Time: <strong className="text-on-surface">{req.preferred_time_utc} UTC</strong> ({req.student_time_zone})</span>
                  </div>
                  {req.attached_resume_url && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-primary">description</span>
                      <a
                        href={req.attached_resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold"
                      >
                        View Student Resume PDF
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container flex items-center justify-between">
                <span className="text-xs text-tertiary">
                  {req.offers?.length || 0} Mentor Bids Submitted
                </span>

                <button
                  onClick={() => {
                    setBidModal({
                      requestId: req.id,
                      studentName: req.student?.full_name || "Student",
                      serviceTitle: req.service?.title || "Session",
                      budgetMin: req.budget_min,
                      budgetMax: req.budget_max,
                    });
                    setBidPrice(req.budget_min);
                  }}
                  className="px-5 py-2 rounded-xl bg-secondary text-white font-semibold text-sm hover:opacity-95 shadow-sm transition-opacity flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Submit Pitch & Bid</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      {bidModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-container">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-1">
              Submit Offer & Pitch
            </h2>
            <p className="text-xs text-tertiary mb-4">
              Responding to <strong className="text-on-surface">{bidModal.studentName}</strong> for {bidModal.serviceTitle}. Student budget: ₹{bidModal.budgetMin} – ₹{bidModal.budgetMax}.
            </p>

            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                  Your Proposed Price (₹ INR)
                </label>
                <input
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm font-bold"
                  required
                />
                <span className="text-[11px] text-tertiary mt-1 block">
                  You will receive ₹{(bidPrice * 0.8).toFixed(2)} (80% net share after 20% platform fee).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                  Mentor Pitch & Focus Areas
                </label>
                <textarea
                  value={bidPitch}
                  onChange={(e) => setBidPitch(e.target.value)}
                  placeholder="Outline your Big Tech experience and how you will guide the student through this session..."
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm h-28"
                  required
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setBidModal(null)}
                  className="px-4 py-2 rounded-xl text-tertiary hover:text-on-surface text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="px-6 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:opacity-90 shadow-sm transition-opacity"
                >
                  {submittingBid ? "Submitting Bid..." : "Submit 24h Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MentorDashboardShell>
  );
}
