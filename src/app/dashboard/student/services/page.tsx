"use client";

import React, { useEffect, useState } from "react";
import { StudentDashboardShell } from "@/components/layout/StudentDashboardShell";
import { useRouter } from "next/navigation";

export default function StudentServicesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"smart-match" | "offers" | "catalog">("smart-match");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Smart Match Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [formData, setFormData] = useState({
    service_type_id: 1,
    budget_min: 800,
    budget_max: 1200,
    preferred_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    preferred_time_utc: "14:00:00",
    attached_resume_url: "https://ogpgoxikulkfpyoorisc.supabase.co/storage/v1/object/public/resumes/my_resume.pdf",
    target_career_market_id: "CM-IN",
  });

  // Counter Offer Modal
  const [counterModalData, setCounterModalData] = useState<{
    offerId: string;
    mentorName: string;
    originalPrice: number;
  } | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterPitch, setCounterPitch] = useState("");
  const [counterLoading, setCounterLoading] = useState(false);

  // Direct Booking action
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/smart-match/requests");
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmittingRequest(true);
      const res = await fetch("/api/v1/smart-match/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create request");
      }

      setShowRequestModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingRequest(false);
    }
  }

  async function handleAcceptOffer(offerId: string) {
    try {
      setBookingLoading(offerId);
      const res = await fetch(`/api/v1/marketplace/offers/${offerId}/accept`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to accept offer");
      }

      alert("Offer accepted successfully! Slot locked under 15m escrow checkout.");
      router.push("/dashboard/student/bookings");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBookingLoading(null);
    }
  }

  async function handleSendCounter(e: React.FormEvent) {
    e.preventDefault();
    if (!counterModalData) return;

    try {
      setCounterLoading(true);
      const res = await fetch(`/api/v1/marketplace/offers/${counterModalData.offerId}/counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counter_price: counterPrice,
          counter_pitch: counterPitch,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send counter-offer");
      }

      alert("Counter-offer sent! Mentor has 24 hours to review.");
      setCounterModalData(null);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCounterLoading(false);
    }
  }

  // Extract all received offers across all requests
  const allOffers = requests.flatMap((r) =>
    (r.offers || []).map((o: any) => ({
      ...o,
      request_title: r.service?.title,
      preferred_date: r.preferred_date,
      preferred_time: r.preferred_time_utc,
    }))
  );

  return (
    <StudentDashboardShell>
      <div className="py-space-md mb-space-lg flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-tertiary">
            <span>Dashboard</span>
            <span>/</span>
            <span>Services & Bookings</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">Services & Smart Match Hub</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            One-Time Services & Smart Match
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Request custom mentorship, receive reverse bids from verified Big Tech mentors, or book catalog sessions with 15-minute concurrency lock.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-semibold text-sm hover:opacity-95 shadow-md flex items-center gap-2 self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Submit New Smart Match Request</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-container-low max-w-fit mb-space-lg">
        <button
          onClick={() => setActiveTab("smart-match")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all ${
            activeTab === "smart-match"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-tertiary hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">neurology</span>
          <span>My Smart Requests</span>
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all ${
            activeTab === "offers"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-tertiary hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">local_offer</span>
          <span>Received Offers & Bids</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs">
            {allOffers.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Smart Match Requests */}
      {activeTab === "smart-match" && (
        <div className="space-y-4 mb-12">
          {loading ? (
            <div className="p-12 text-center text-tertiary">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface-container-lowest text-center max-w-xl mx-auto border border-surface-container">
              <span className="material-symbols-outlined text-primary text-[40px] mb-2">broadcast_on_personal</span>
              <h3 className="font-headline-sm text-lg font-bold mb-2">No Active Smart Match Requests</h3>
              <p className="text-tertiary text-sm mb-6">
                Broadcast your requirements, date/time, and resume to top mentors to receive competitive proposals.
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-colors shadow-sm"
              >
                Create First Request
              </button>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-primary-fixed text-on-primary-fixed">
                      {req.status}
                    </span>
                    <span className="text-xs text-tertiary">
                      Target: {req.target_career_market_id} • 48h TTL
                    </span>
                  </div>
                  <h3 className="font-title-md text-lg font-bold text-on-surface">
                    {req.service?.title || "Career Consultation"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-tertiary mt-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                      {req.preferred_date} @ {req.preferred_time_utc} UTC
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">payments</span>
                      Budget: ₹{req.budget_min} – ₹{req.budget_max}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">local_offer</span>
                      {req.offers?.length || 0} Offers Received
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("offers")}
                    className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-sm transition-colors"
                  >
                    View Offers ({req.offers?.length || 0})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Received Offers */}
      {activeTab === "offers" && (
        <div className="space-y-4 mb-12">
          {allOffers.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface-container-lowest text-center max-w-xl mx-auto border border-surface-container">
              <span className="material-symbols-outlined text-secondary text-[40px] mb-2">inbox</span>
              <h3 className="font-headline-sm text-lg font-bold mb-2">No Offers Received Yet</h3>
              <p className="text-tertiary text-sm">
                When mentors bid on your smart requests, their proposals and pitches will appear here.
              </p>
            </div>
          ) : (
            allOffers.map((offer) => (
              <div
                key={offer.id}
                className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {(offer.mentor?.full_name || "M")[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md font-bold text-on-surface text-base">
                        {offer.mentor?.full_name || "Verified Mentor"}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-surface-container-low text-on-surface">
                        {offer.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-primary mt-1">
                      {offer.request_title} • {offer.preferred_date}
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
                          setCounterModalData({
                            offerId: offer.id,
                            mentorName: offer.mentor?.full_name || "Mentor",
                            originalPrice: offer.price,
                          });
                          setCounterPrice(Math.round(offer.price * 0.9));
                        }}
                        className="px-4 py-2 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
                      >
                        Counter (1 Limit)
                      </button>
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        disabled={bookingLoading === offer.id}
                        className="px-5 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-colors shadow-sm"
                      >
                        {bookingLoading === offer.id ? "Locking Slot..." : "Accept & Lock Slot"}
                      </button>
                    </div>
                  )}

                  {offer.status === "accepted" && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      Accepted & Booked
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: Submit Smart Match Request */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-surface-container">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container mb-4">
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                Submit Smart Match Request
              </h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-tertiary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                  Service Type
                </label>
                <select
                  value={formData.service_type_id}
                  onChange={(e) => setFormData({ ...formData, service_type_id: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm"
                >
                  <option value={1}>1-on-1 Mock Interview (60 min)</option>
                  <option value={2}>Resume & ATS Optimization (45 min)</option>
                  <option value={3}>Coding & DSA Interview Prep (60 min)</option>
                  <option value={6}>System Design Deep Dive (60 min)</option>
                  <option value={5}>Salary & Offer Negotiation (30 min)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                    Min Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                    Max Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                    Preferred Time (UTC)
                  </label>
                  <input
                    type="time"
                    value={formData.preferred_time_utc.slice(0, 5)}
                    onChange={(e) => setFormData({ ...formData, preferred_time_utc: e.target.value + ":00" })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-tertiary uppercase mb-1">
                  Attached Resume Link (Cloud Storage)
                </label>
                <input
                  type="text"
                  value={formData.attached_resume_url}
                  onChange={(e) => setFormData({ ...formData, attached_resume_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-tertiary hover:text-on-surface text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-6 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  {submittingRequest ? "Broadcasting..." : "Broadcast Request (48h TTL)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Counter-Offer */}
      {counterModalData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-container">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-2">
              Submit Counter-Offer (1 Limit)
            </h2>
            <p className="text-xs text-tertiary mb-4">
              Negotiating with <span className="font-semibold text-on-surface">{counterModalData.mentorName}</span>. Listed price: ₹{counterModalData.originalPrice}.
            </p>

            <form onSubmit={handleSendCounter} className="space-y-4">
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
                  Negotiation Note
                </label>
                <textarea
                  value={counterPitch}
                  onChange={(e) => setCounterPitch(e.target.value)}
                  placeholder="Explain your student budget constraints or session focus..."
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-sm h-24"
                  required
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setCounterModalData(null)}
                  className="px-4 py-2 rounded-xl text-tertiary hover:text-on-surface text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={counterLoading}
                  className="px-6 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  {counterLoading ? "Submitting..." : "Send Counter-Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentDashboardShell>
  );
}
