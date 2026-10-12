"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { StudentDashboardShell } from "@/components/layout/StudentDashboardShell";
import { useRouter } from "next/navigation";

export default function StudentRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatrix, setShowMatrix] = useState(false);
  const [counterModal, setCounterModal] = useState<{
    offerId: string;
    mentorName: string;
    price: number;
  } | null>(null);
  const [counterPrice, setCounterPrice] = useState(0);
  const [counterPitch, setCounterPitch] = useState("");
  const [submittingCounter, setSubmittingCounter] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);

  async function loadRequests() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/smart-match/requests");
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
    loadRequests();
  }, []);

  async function handleAccept(offerId: string) {
    try {
      setAcceptingOffer(offerId);
      const res = await fetch(`/api/v1/marketplace/offers/${offerId}/accept`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to accept offer");
      }
      alert("Offer accepted! Moving to Escrow Booking.");
      router.push("/dashboard/student/bookings");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAcceptingOffer(null);
    }
  }

  async function handleCounter(e: React.FormEvent) {
    e.preventDefault();
    if (!counterModal) return;
    try {
      setSubmittingCounter(true);
      const res = await fetch(`/api/v1/marketplace/offers/${counterModal.offerId}/counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counter_price: counterPrice,
          counter_pitch: counterPitch,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to counter offer");
      }
      alert("Counter-offer submitted to mentor (1 limit enforced)!");
      setCounterModal(null);
      await loadRequests();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingCounter(false);
    }
  }

  const allOffers = requests.flatMap((r) =>
    (r.offers || []).map((o: any) => ({
      ...o,
      request: r,
    }))
  );

  return (
    <StudentDashboardShell>
      <div className="flex flex-col gap-space-sm mb-space-lg">
        <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
          <span>Dashboard</span>
          <span className="text-outline-variant">/</span>
          <span className="text-tertiary">Services & Bookings</span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-medium">Smart Match Requests & Offers</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Smart Match Requests & Received Offers
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Live Bidding Active
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-4xl">
              Review live candidate bids, inspect 14-dimension match scores, compare counter-offers, and lock confirmed slots under 100% DreamX Safe Escrow.
            </p>
          </div>

          <Link
            href="/dashboard/student/services"
            className="h-10 px-space-md rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-title-md text-body-md font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs self-start lg:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Submit New Smart Match</span>
          </Link>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase font-semibold text-tertiary tracking-wider">
              Active Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">broadcast_on_personal</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-on-surface">{requests.length} In Bidding</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">48h TTL Window</p>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase font-semibold text-tertiary tracking-wider">
              Offers Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-on-surface">{allOffers.length} Mentor Offers</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">100% Escrow Verified</p>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase font-semibold text-tertiary tracking-wider">
              Avg Compatibility
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-primary">94.2% Match</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Top: Google Staff Bar Raiser</p>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase font-semibold text-tertiary tracking-wider">
              Safe Escrow Protection
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[18px]">security</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-on-surface">100% Held</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Payout released post-session</p>
          </div>
        </div>
      </div>

      {/* 14-Dimension Comparison Matrix Toggle */}
      <div className="mb-space-lg">
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container"
        >
          <span className="material-symbols-outlined text-[20px]">
            {showMatrix ? "expand_less" : "expand_more"}
          </span>
          <span>{showMatrix ? "Hide 14-Dimension Comparison Matrix" : "Inspect 14-Dimension Comparison Matrix"}</span>
        </button>

        {showMatrix && (
          <div className="mt-4 p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-container text-xs font-semibold text-tertiary uppercase">
                  <th className="pb-3">Dimension</th>
                  <th className="pb-3">Weight</th>
                  <th className="pb-3">Algorithmic Calibrator</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface">
                <tr>
                  <td className="py-2.5 font-medium">Domain & Role Specialization</td>
                  <td className="py-2.5">25%</td>
                  <td className="py-2.5 text-tertiary">Google / Meta L5+ Staff Architecture Alignment</td>
                  <td className="py-2.5 text-green-700 font-semibold">98% Match</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium">Interview Rubric Caliber</td>
                  <td className="py-2.5">20%</td>
                  <td className="py-2.5 text-tertiary">100+ Completed Loops with Structured Deliverables</td>
                  <td className="py-2.5 text-green-700 font-semibold">95% Match</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium">Timezone & Availability Intersect</td>
                  <td className="py-2.5">15%</td>
                  <td className="py-2.5 text-tertiary">Direct overlap in preferred student slot</td>
                  <td className="py-2.5 text-green-700 font-semibold">100% Match</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium">Target Market Depth (CM-IN)</td>
                  <td className="py-2.5">15%</td>
                  <td className="py-2.5 text-tertiary">Pan-India Tier-1 Placement Bar Raising</td>
                  <td className="py-2.5 text-green-700 font-semibold">96% Match</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Smart Match Requests & AI Top-5 Matched Mentors */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
            <span>AI Smart Match Requests</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-semibold">
              {requests.length} Requests Active
            </span>
          </h2>
          <Link
            href="/services/mock-interview/match"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>+ Create New Match Request</span>
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-lowest text-center border border-surface-container">
            <span className="material-symbols-outlined text-tertiary text-[36px] mb-2">auto_awesome</span>
            <h3 className="font-bold text-on-surface text-base mb-1">No Active Match Requests</h3>
            <p className="text-xs text-tertiary mb-4">
              Submit your target career goals, preferred time slot, and budget. Our 6-stage AI engine will instantly rank candidate mentors.
            </p>
            <Link
              href="/discover"
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors inline-block"
            >
              Explore Career Goals
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-title-md font-bold text-on-surface text-base">
                        {req.service?.title || "Career Mentorship"}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        req.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : req.status === "offers_received"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {req.status === "pending" ? "Broadcasted (Bidding Open)" : req.status}
                      </span>
                    </div>
                    <p className="text-xs text-tertiary mt-1">
                      Budget: ₹{req.budget_min} - ₹{req.budget_max} • Target Slot: {req.preferred_date} at {req.preferred_time_utc} • Market: {req.target_career_market_id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-tertiary">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    <span>Expires in 48h</span>
                  </div>
                </div>

                {/* AI Top Matches Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
                      AI Top Matches (14-Dimension Fit)
                    </span>
                    <span className="text-[11px] text-tertiary">
                      {req.matches?.length || 0} Candidates Evaluated
                    </span>
                  </div>

                  {!req.matches || req.matches.length === 0 ? (
                    <div className="p-4 rounded-xl bg-surface-container-low text-xs text-tertiary text-center">
                      AI is evaluating candidate mentor profiles against your criteria...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {req.matches.map((m: any, idx: number) => (
                        <div
                          key={m.id || idx}
                          className="p-3.5 rounded-xl border border-surface-container bg-surface-container-low/50 hover:bg-surface-container-low hover:border-primary/30 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-bold text-[10px]">
                                Rank #{idx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs">
                                {m.match_score}% Match
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 mb-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                                {(m.mentor?.full_name || "M")[0]}
                              </div>
                              <div className="overflow-hidden">
                                <span className="block font-bold text-xs text-on-surface truncate">
                                  {m.mentor?.full_name || "Big Tech Mentor"}
                                </span>
                                <span className="block text-[10px] text-tertiary truncate">
                                  {m.mentor?.headline || "Senior Staff Engineer"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-surface-container/60 flex items-center justify-between text-[11px]">
                            <span className="text-tertiary">{m.mentor?.years_experience || 8}+ yrs exp</span>
                            <Link
                              href={`/mentors/${m.mentor?.public_slug || m.mentor_id}`}
                              className="text-primary font-semibold hover:underline"
                            >
                              Profile →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bids List */}
      <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-4">
        Active Candidate Bids ({allOffers.length})
      </h2>

      {allOffers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-container-lowest text-center max-w-xl mx-auto border border-surface-container mb-12">
          <span className="material-symbols-outlined text-tertiary text-[40px] mb-2">pending</span>
          <h3 className="font-headline-sm text-lg font-bold mb-2">No Active Bids In Progress</h3>
          <p className="text-tertiary text-sm mb-4">
            Broadcast a smart match request to invite top mentors to submit competitive offers.
          </p>
          <Link
            href="/dashboard/student/services"
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-colors shadow-sm inline-block"
          >
            Create Request Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mb-12">
          {allOffers.map((offer) => (
            <div
              key={offer.id}
              className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {(offer.mentor?.full_name || "M")[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-title-md font-bold text-on-surface text-base">
                      {offer.mentor?.full_name || "Big Tech Mentor"}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700">
                      94.5% Match
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-primary mt-1">
                    {offer.request?.service?.title || "Career Session"} • Slot: {offer.request?.preferred_date}
                  </div>
                  <p className="text-sm text-on-surface-variant mt-2 italic bg-surface-container-low p-3 rounded-xl">
                    "{offer.mentor_pitch}"
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="text-2xl font-bold text-on-surface">
                  ₹{offer.price}{" "}
                  <span className="text-xs font-normal text-tertiary">INR</span>
                </div>

                {offer.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCounterModal({
                          offerId: offer.id,
                          mentorName: offer.mentor?.full_name || "Mentor",
                          price: offer.price,
                        });
                        setCounterPrice(Math.round(offer.price * 0.9));
                      }}
                      className="px-4 py-2 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
                    >
                      Counter (1 Limit)
                    </button>
                    <button
                      onClick={() => handleAccept(offer.id)}
                      disabled={acceptingOffer === offer.id}
                      className="px-5 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-colors shadow-sm"
                    >
                      {acceptingOffer === offer.id ? "Locking..." : "Accept & Escrow Lock"}
                    </button>
                  </div>
                )}

                {offer.status === "accepted" && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    Accepted & Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter Modal */}
      {counterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-container">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-2">
              Negotiate Counter-Offer
            </h2>
            <p className="text-xs text-tertiary mb-4">
              Mentor: <span className="font-semibold text-on-surface">{counterModal.mentorName}</span>. Listed: ₹{counterModal.price}.
            </p>

            <form onSubmit={handleCounter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                  Proposed Counter Price (₹)
                </label>
                <input
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                  Pitch & Scope Details
                </label>
                <textarea
                  value={counterPitch}
                  onChange={(e) => setCounterPitch(e.target.value)}
                  placeholder="Explain why you are countering..."
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm h-24"
                  required
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setCounterModal(null)}
                  className="px-4 py-2 rounded-xl text-tertiary hover:text-on-surface text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCounter}
                  className="px-6 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:opacity-90 shadow-sm"
                >
                  {submittingCounter ? "Submitting..." : "Send Counter (1 Limit)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentDashboardShell>
  );
}
