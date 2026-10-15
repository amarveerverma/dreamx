"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";

interface MatchRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  targetRole: string;
  targetCompany: string;
  serviceId: string;
  serviceName: string;
  budgetInr: number;
  offersCount: number;
  expiresInHours: number;
  status: "awaiting_offers" | "multiple_offers" | "direct_match" | "needs_review";
  postedAt: string;
}

interface PricingCorridor {
  code: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  defaultPrice: number;
  sessionMins: number;
  takeRatePct: number;
}

const INITIAL_REQUESTS: MatchRequest[] = [
  {
    id: "MR-8921",
    studentName: "Aditya Sharma",
    studentEmail: "aditya.sharma@gmail.com",
    targetRole: "Staff Software Engineer",
    targetCompany: "Google (L6) / Uber",
    serviceId: "S01",
    serviceName: "Technical Mock Interview",
    budgetInr: 4500,
    offersCount: 3,
    expiresInHours: 6,
    status: "multiple_offers",
    postedAt: "18 mins ago",
  },
  {
    id: "MR-8922",
    studentName: "Pooja Hegde",
    studentEmail: "pooja.h@outlook.com",
    targetRole: "Product Manager (Growth)",
    targetCompany: "Swiggy / Zepto",
    serviceId: "S04",
    serviceName: "Salary & Offer Negotiation",
    budgetInr: 5000,
    offersCount: 0,
    expiresInHours: 2.5,
    status: "needs_review",
    postedAt: "3.5 hrs ago",
  },
  {
    id: "MR-8923",
    studentName: "Rohan Varma",
    studentEmail: "rohan.varma@iitb.ac.in",
    targetRole: "Machine Learning Engineer",
    targetCompany: "Microsoft / Meta",
    serviceId: "S03",
    serviceName: "Portfolio / System Design Review",
    budgetInr: 3999,
    offersCount: 1,
    expiresInHours: 18,
    status: "direct_match",
    postedAt: "45 mins ago",
  },
  {
    id: "MR-8924",
    studentName: "Sneha Nair",
    studentEmail: "sneha.nair@techcorp.in",
    targetRole: "Engineering Manager",
    targetCompany: "Flipkart",
    serviceId: "S08",
    serviceName: "Leadership & Management Coaching",
    budgetInr: 6500,
    offersCount: 4,
    expiresInHours: 22,
    status: "multiple_offers",
    postedAt: "2 hrs ago",
  },
  {
    id: "MR-8925",
    studentName: "Karthik Raja",
    studentEmail: "karthik.raja@bits.edu",
    targetRole: "Backend Developer (Go/Rust)",
    targetCompany: "Razorpay / Cred",
    serviceId: "S02",
    serviceName: "Resume Review & ATS Roast",
    budgetInr: 1499,
    offersCount: 0,
    expiresInHours: 1.2,
    status: "needs_review",
    postedAt: "4.8 hrs ago",
  },
];

const INITIAL_CORRIDORS: PricingCorridor[] = [
  { code: "S01", name: "Technical Mock Interview", minPrice: 2499, maxPrice: 4999, defaultPrice: 3499, sessionMins: 60, takeRatePct: 20 },
  { code: "S02", name: "Resume Review & ATS Roast", minPrice: 999, maxPrice: 1999, defaultPrice: 1499, sessionMins: 45, takeRatePct: 20 },
  { code: "S03", name: "System Design & Architecture", minPrice: 2999, maxPrice: 5999, defaultPrice: 3999, sessionMins: 60, takeRatePct: 20 },
  { code: "S04", name: "Salary & Offer Negotiation", minPrice: 3499, maxPrice: 6999, defaultPrice: 4999, sessionMins: 60, takeRatePct: 20 },
  { code: "S05", name: "Behavioral & STAR Coaching", minPrice: 1499, maxPrice: 2999, defaultPrice: 1999, sessionMins: 45, takeRatePct: 20 },
  { code: "S06", name: "30-Day Transition Blueprint", minPrice: 4999, maxPrice: 8999, defaultPrice: 6499, sessionMins: 90, takeRatePct: 20 },
  { code: "S07", name: "Live Debug & Code Pairing", minPrice: 2999, maxPrice: 4999, defaultPrice: 3499, sessionMins: 60, takeRatePct: 20 },
  { code: "S08", name: "Leadership & Management", minPrice: 4499, maxPrice: 7999, defaultPrice: 5999, sessionMins: 60, takeRatePct: 20 },
  { code: "S09", name: "Remote & Global Job Strategy", minPrice: 2499, maxPrice: 4499, defaultPrice: 3499, sessionMins: 60, takeRatePct: 20 },
  { code: "S10", name: "Rapid Fire Q&A (30m)", minPrice: 799, maxPrice: 1499, defaultPrice: 999, sessionMins: 30, takeRatePct: 20 },
];

export default function AdminMarketplacePage() {
  const [filterTab, setFilterTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [requests, setRequests] = useState<MatchRequest[]>(INITIAL_REQUESTS);
  const [corridors, setCorridors] = useState<PricingCorridor[]>(INITIAL_CORRIDORS);
  const [selectedRequest, setSelectedRequest] = useState<MatchRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"queue" | "pricing">("queue");

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function handleExtendTTL(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, expiresInHours: r.expiresInHours + 24, status: "awaiting_offers" } : r))
    );
    triggerToast(`TTL for request ${id} extended by 24 hours.`);
  }

  function handleManualAssign(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "direct_match", offersCount: r.offersCount + 1 } : r))
    );
    setSelectedRequest(null);
    triggerToast(`Direct Mentor override successfully applied to ${id}.`);
  }

  function handleUpdatePrice(code: string, field: "minPrice" | "maxPrice" | "defaultPrice", value: number) {
    setCorridors((prev) =>
      prev.map((c) => (c.code === code ? { ...c, [field]: value } : c))
    );
  }

  const filteredRequests = requests.filter((r) => {
    if (filterTab === "needs_review" && r.status !== "needs_review") return false;
    if (filterTab === "multiple_offers" && r.status !== "multiple_offers") return false;
    if (filterTab === "direct_match" && r.status !== "direct_match") return false;

    if (selectedService !== "all" && r.serviceId !== selectedService) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.targetRole.toLowerCase().includes(q) ||
        r.targetCompany.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminShell>
      <div className="px-space-lg py-space-xl max-w-7xl mx-auto space-y-space-xl">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-on-surface text-surface shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
            <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                Marketplace Operations &amp; Match Engine
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                Smart Match v2 Online
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant max-w-4xl">
              Monitor incoming student match requests in real-time, execute admin overrides for stuck queues, and enforce standardized pricing corridors across all 10 one-time services.
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap shrink-0">
            <button
              onClick={() => setActiveTab(activeTab === "queue" ? "pricing" : "queue")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors text-label-md font-medium shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                {activeTab === "queue" ? "tune" : "radar"}
              </span>
              <span>{activeTab === "queue" ? "Standardized Pricing (S01-S10)" : "Live Match Queue"}</span>
            </button>
            <button
              onClick={() => triggerToast("Matching engine log archive exported to CSV.")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity text-label-md font-medium shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Match Logs</span>
            </button>
          </div>
        </div>

        {/* Operational Health Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Active Match Queue</span>
                <div className="font-stat-metric text-stat-metric text-on-surface mt-1 font-bold">12 Requests</div>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[20px]">radar</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs bg-surface-container-low/60 rounded-lg p-2.5 text-xs text-on-surface-variant flex items-center justify-between">
              <span>Awaiting offers: <strong className="text-on-surface">4</strong></span>
              <span className="text-error font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">timer</span> 2 expiring &lt;4h
              </span>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Time to First Offer</span>
                <div className="font-stat-metric text-stat-metric text-on-surface mt-1 font-bold">24.6 Min</div>
              </div>
              <div className="p-2.5 rounded-lg bg-tertiary-fixed text-tertiary">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between text-xs">
              <span className="text-tertiary font-semibold">Optimal Velocity</span>
              <span className="text-outline">5.4m faster than 30m SLA</span>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Liquidity Ratio</span>
                <div className="font-stat-metric text-stat-metric text-on-surface mt-1 font-bold">1.6 : 1</div>
              </div>
              <div className="p-2.5 rounded-lg bg-secondary-fixed text-secondary">
                <span className="material-symbols-outlined text-[20px]">balance</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between text-xs">
              <span className="text-secondary font-semibold">Healthy Supply</span>
              <span className="text-outline">412 mentors / 258 requests</span>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Manual Overrides</span>
                <div className="font-stat-metric text-stat-metric text-on-surface mt-1 font-bold">3 Today</div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high text-primary">
                <span className="material-symbols-outlined text-[20px]">shield_person</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-medium">0.4% Override Rate</span>
              <span className="text-outline">1 rerouted • 2 TTL reset</span>
            </div>
          </div>
        </div>

        {/* View Toggle 1: Live Match Queue */}
        {activeTab === "queue" && (
          <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-space-lg border-b border-surface-container-high/40 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Live Match Requests</h2>
                <p className="text-body-sm text-outline">Real-time routing stream powered by 14-dimension heuristic match engine.</p>
              </div>

              {/* Segmented filter pills */}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setFilterTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterTab === "all" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                  }`}
                >
                  All ({requests.length})
                </button>
                <button
                  onClick={() => setFilterTab("needs_review")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterTab === "needs_review" ? "bg-surface-container-lowest text-error shadow-xs" : "text-error/80"
                  }`}
                >
                  Needs Attention (2)
                </button>
                <button
                  onClick={() => setFilterTab("multiple_offers")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterTab === "multiple_offers" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                  }`}
                >
                  Multiple Offers (2)
                </button>
                <button
                  onClick={() => setFilterTab("direct_match")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterTab === "direct_match" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                  }`}
                >
                  Direct Matched (1)
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="px-space-lg py-space-sm bg-surface-container-low/40 border-b border-surface-container-high/40 flex flex-col sm:flex-row items-center gap-space-sm">
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">search</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by student, target role, company, or request ID..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 text-sm placeholder:text-outline focus:outline-none focus:border-primary"
                />
              </div>

              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 text-sm text-on-surface focus:outline-none"
              >
                <option value="all">All Standard Services (10)</option>
                {INITIAL_CORRIDORS.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} • {c.name}</option>
                ))}
              </select>
            </div>

            {/* Request Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-container-high/60 bg-surface-container-low/20 text-on-surface-variant font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3.5">Request ID &amp; Student</th>
                    <th className="px-6 py-3.5">Target Company &amp; Role</th>
                    <th className="px-6 py-3.5">Service Requested</th>
                    <th className="px-6 py-3.5">Budget</th>
                    <th className="px-6 py-3.5">Offers / Status</th>
                    <th className="px-6 py-3.5">TTL Remaining</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {req.studentName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">{req.studentName}</div>
                            <div className="text-xs text-outline">{req.id} • {req.postedAt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-on-surface">{req.targetRole}</div>
                        <div className="text-xs text-outline">{req.targetCompany}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-high text-xs font-medium text-on-surface">
                          <span className="font-bold text-primary">{req.serviceId}</span>
                          <span>{req.serviceName}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-on-surface">
                        ₹{req.budgetInr.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === "needs_review" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">warning</span> Needs Review
                          </span>
                        ) : req.status === "multiple_offers" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">
                            {req.offersCount} Active Offers
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold">
                            Matched
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium font-mono ${req.expiresInHours < 4 ? "text-error font-bold" : "text-outline"}`}>
                          {req.expiresInHours.toFixed(1)} hrs
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleExtendTTL(req.id)}
                            title="Extend 24 Hours TTL"
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">update</span>
                          </button>
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-xs font-semibold text-on-surface transition-colors"
                          >
                            Override
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Toggle 2: Standardized Pricing Corridors (S01 - S10) */}
        {activeTab === "pricing" && (
          <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs p-space-lg space-y-space-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Standardized Service Price Corridors (S01–S10)</h2>
                <p className="text-body-sm text-outline">
                  Mandatory guardrails preventing price gouging and protecting student affordability. 20% DreamX take-rate locked.
                </p>
              </div>
              <button
                onClick={() => triggerToast("Pricing corridors successfully published to live booking engine.")}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity shadow-xs flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Live Bounds</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-container-high/60 bg-surface-container-low/20 text-on-surface-variant font-semibold text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Service Name</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Min Cap (₹)</th>
                    <th className="px-4 py-3">Recommended (₹)</th>
                    <th className="px-4 py-3">Max Cap (₹)</th>
                    <th className="px-4 py-3">Take Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {corridors.map((c) => (
                    <tr key={c.code} className="hover:bg-surface-container-low/20">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{c.code}</td>
                      <td className="px-4 py-3 font-medium text-on-surface">{c.name}</td>
                      <td className="px-4 py-3 text-outline text-xs">{c.sessionMins} mins</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={c.minPrice}
                          onChange={(e) => handleUpdatePrice(c.code, "minPrice", Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-surface-container-low rounded font-mono text-xs border border-surface-container-high focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={c.defaultPrice}
                          onChange={(e) => handleUpdatePrice(c.code, "defaultPrice", Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-surface-container-low rounded font-mono text-xs border border-surface-container-high focus:outline-none font-bold text-on-surface"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={c.maxPrice}
                          onChange={(e) => handleUpdatePrice(c.code, "maxPrice", Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-surface-container-low rounded font-mono text-xs border border-surface-container-high focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-outline font-mono">
                        {c.takeRatePct}% (Fixed)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manual Override Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container-high space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Admin Manual Match Override</h3>
                  <p className="text-xs text-outline">Request #{selectedRequest.id} • {selectedRequest.studentName}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 rounded hover:bg-surface-container-high text-outline"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-outline">Service:</span>
                  <span className="font-semibold text-on-surface">{selectedRequest.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Target Role / Company:</span>
                  <span className="font-semibold text-on-surface">{selectedRequest.targetRole} @ {selectedRequest.targetCompany}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Student Budget:</span>
                  <span className="font-mono font-semibold text-primary">₹{selectedRequest.budgetInr.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface">Select Mentor to Force-Assign:</label>
                <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container-high text-sm">
                  <option>Gaurav Sen (Staff Eng @ Google, S01/S03 Specialist)</option>
                  <option>Priya Nair (Principal PM @ Microsoft, S04 Specialist)</option>
                  <option>Rahul Dravid (VP Eng @ Razorpay, S08 Specialist)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleManualAssign(selectedRequest.id)}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90"
                >
                  Confirm Force Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
