"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";

interface Milestone {
  week: number;
  title: string;
  deliverable: string;
}

interface ProgramTemplate {
  id: string;
  title: string;
  durationWeeks: number;
  format: "Sprint (2-Wk)" | "Flagship (4-Wk)" | "Deep Dive (6-Wk)";
  priceInr: number;
  platformCommissionPct: number;
  enrolledStudents: number;
  activeCohorts: number;
  completionRatePct: number;
  leadMentor: string;
  leadMentorCompany: string;
  milestones: Milestone[];
}

const INITIAL_PROGRAMS: ProgramTemplate[] = [
  {
    id: "PROG-01",
    title: "Staff Software Engineer Career Accelerator",
    durationWeeks: 4,
    format: "Flagship (4-Wk)",
    priceInr: 24999,
    platformCommissionPct: 15,
    enrolledStudents: 320,
    activeCohorts: 4,
    completionRatePct: 91.2,
    leadMentor: "Gaurav Sen",
    leadMentorCompany: "Google (L6)",
    milestones: [
      { week: 1, title: "Distributed Architecture & CAP", deliverable: "System design RFC for 1M QPS" },
      { week: 2, title: "Concurrency & Fault Tolerance", deliverable: "Resilience checklist & chaos plan" },
      { week: 3, title: "Cross-Functional Influence", deliverable: "Executive proposal memo" },
      { week: 4, title: "Staff Promotion Defense", deliverable: "Live mock promotion committee review" },
    ],
  },
  {
    id: "PROG-02",
    title: "0-to-1 Product Manager Interview Mastery",
    durationWeeks: 4,
    format: "Flagship (4-Wk)",
    priceInr: 19999,
    platformCommissionPct: 15,
    enrolledStudents: 240,
    activeCohorts: 3,
    completionRatePct: 88.4,
    leadMentor: "Priya Nair",
    leadMentorCompany: "Microsoft / Swiggy",
    milestones: [
      { week: 1, title: "Product Sense & Decomposition", deliverable: "Product teardown & metric tree" },
      { week: 2, title: "Execution & Root Cause Analysis", deliverable: "Metric drop diagnostic framework" },
      { week: 3, title: "Growth & Retention Modeling", deliverable: "Funnel cohort loop design" },
      { week: 4, title: "VP Product Final Round", deliverable: "30-min live strategic product pitch" },
    ],
  },
  {
    id: "PROG-03",
    title: "High-Scale Backend & Microservices Sprint",
    durationWeeks: 2,
    format: "Sprint (2-Wk)",
    priceInr: 12999,
    platformCommissionPct: 15,
    enrolledStudents: 150,
    activeCohorts: 3,
    completionRatePct: 94.0,
    leadMentor: "Rahul Dravid",
    leadMentorCompany: "Razorpay",
    milestones: [
      { week: 1, title: "Database Partitioning & Indexing", deliverable: "PostgreSQL query plan tuning" },
      { week: 2, title: "Kafka Event-Driven Architecture", deliverable: "Idempotent consumer pipeline" },
    ],
  },
  {
    id: "PROG-04",
    title: "Executive Leadership & Tech VP Fellowship",
    durationWeeks: 6,
    format: "Deep Dive (6-Wk)",
    priceInr: 44999,
    platformCommissionPct: 15,
    enrolledStudents: 80,
    activeCohorts: 2,
    completionRatePct: 84.5,
    leadMentor: "Arjun Mehta",
    leadMentorCompany: "Flipkart / Uber",
    milestones: [
      { week: 1, title: "Org Design & Headcount Planning", deliverable: "Engineering capacity model" },
      { week: 2, title: "Technical Strategy & Tech Debt", deliverable: "3-year modernization roadmap" },
      { week: 3, title: "Budgeting & Cloud FinOps", deliverable: "AWS/GCP unit economics model" },
      { week: 4, title: "Managing Managers", deliverable: "Performance calibration framework" },
      { week: 5, title: "Board Presentations", deliverable: "Quarterly OKR executive deck" },
      { week: 6, title: "Crisis Management & PR", deliverable: "Incident post-mortem & press strategy" },
    ],
  },
  {
    id: "PROG-05",
    title: "Modern AI Engineering & LLM Systems",
    durationWeeks: 2,
    format: "Sprint (2-Wk)",
    priceInr: 14999,
    platformCommissionPct: 15,
    enrolledStudents: 50,
    activeCohorts: 2,
    completionRatePct: 86.0,
    leadMentor: "Dr. Vikram Seth",
    leadMentorCompany: "AI Research Lab",
    milestones: [
      { week: 1, title: "RAG & Vector Embeddings", deliverable: "pgvector hybrid search pipeline" },
      { week: 2, title: "Agentic Tool Use & Guardrails", deliverable: "Autonomous multi-step eval harness" },
    ],
  },
];

export default function AdminProgramsPage() {
  const [filterFormat, setFilterFormat] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [programs, setPrograms] = useState<ProgramTemplate[]>(INITIAL_PROGRAMS);
  const [selectedProgram, setSelectedProgram] = useState<ProgramTemplate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  const filteredPrograms = programs.filter((p) => {
    if (filterFormat === "2wk" && p.durationWeeks !== 2) return false;
    if (filterFormat === "4wk" && p.durationWeeks !== 4) return false;
    if (filterFormat === "6wk" && p.durationWeeks !== 6) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.leadMentor.toLowerCase().includes(q) ||
        p.leadMentorCompany.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                Program Catalog &amp; Cohorts
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                Active Cohorts Running
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant max-w-3xl">
              Manage structured 2-Week, 4-Week, and 6-Week career accelerator templates, weekly milestone blueprints, and student group capacity rules.
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <button
              onClick={() => triggerToast("Cohort performance report exported.")}
              className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors shadow-xs text-label-md font-medium"
            >
              <span className="material-symbols-outlined text-[18px] text-outline">download</span>
              <span>Export Cohort Data</span>
            </button>
            <button
              onClick={() => triggerToast("New Program Template wizard opened.")}
              className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary text-on-primary hover:opacity-95 transition-opacity shadow-xs text-label-md font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ New Program Template</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Active Programs</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
              </div>
            </div>
            <div className="mt-space-sm">
              <div className="font-stat-metric text-stat-metric text-on-surface font-bold">5 Live</div>
              <p className="text-xs text-outline mt-1">2-Week, 4-Week, &amp; 6-Week templates</p>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Enrolled Students</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </div>
            </div>
            <div className="mt-space-sm">
              <div className="font-stat-metric text-stat-metric text-on-surface font-bold">840 Active</div>
              <p className="text-xs text-outline mt-1">Across 14 monthly cohorts (92.4% att.)</p>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Avg Completion</span>
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">military_tech</span>
              </div>
            </div>
            <div className="mt-space-sm">
              <div className="font-stat-metric text-stat-metric text-on-surface font-bold">88.6%</div>
              <p className="text-xs text-outline mt-1">+4.2% vs target milestone submission</p>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Escrow Protection</span>
              <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
            </div>
            <div className="mt-space-sm">
              <div className="font-stat-metric text-stat-metric text-on-surface font-bold">14-Day Hold</div>
              <p className="text-xs text-outline mt-1">₹9.8L held in 100% guarantee window</p>
            </div>
          </div>
        </div>

        {/* Master Catalog & Blueprint View */}
        <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-space-md border-b border-surface-container-high/40 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setFilterFormat("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterFormat === "all" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                All Programs ({programs.length})
              </button>
              <button
                onClick={() => setFilterFormat("4wk")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterFormat === "4wk" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                4-Week Flagships (2)
              </button>
              <button
                onClick={() => setFilterFormat("2wk")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterFormat === "2wk" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                2-Week Sprints (2)
              </button>
              <button
                onClick={() => setFilterFormat("6wk")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterFormat === "6wk" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                6-Week Deep Dives (1)
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search program or lead mentor..."
                className="w-full h-8 pl-9 pr-3 rounded-lg bg-surface-container-low border border-surface-container-high text-xs placeholder:text-outline focus:outline-none"
              />
            </div>
          </div>

          {/* Programs Grid */}
          <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {filteredPrograms.map((prog) => (
              <div
                key={prog.id}
                className="rounded-2xl border border-surface-container-high/60 bg-surface-container-lowest p-space-md flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                      {prog.format}
                    </span>
                    <span className="font-mono text-sm font-bold text-on-surface">
                      ₹{prog.priceInr.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-on-surface leading-snug">{prog.title}</h3>
                    <p className="text-xs text-outline mt-1">
                      Lead: <strong className="text-on-surface">{prog.leadMentor}</strong> ({prog.leadMentorCompany})
                    </p>
                  </div>

                  <div className="pt-2 border-t border-surface-container-high/40 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-surface-container-low/60 p-2 rounded-lg">
                      <div className="text-outline text-[11px]">Enrolled</div>
                      <div className="font-bold text-on-surface mt-0.5">{prog.enrolledStudents}</div>
                    </div>
                    <div className="bg-surface-container-low/60 p-2 rounded-lg">
                      <div className="text-outline text-[11px]">Cohorts</div>
                      <div className="font-bold text-on-surface mt-0.5">{prog.activeCohorts} active</div>
                    </div>
                    <div className="bg-surface-container-low/60 p-2 rounded-lg">
                      <div className="text-outline text-[11px]">Pass Rate</div>
                      <div className="font-bold text-tertiary mt-0.5">{prog.completionRatePct}%</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-outline block">
                      Weekly Milestones ({prog.milestones.length})
                    </span>
                    {prog.milestones.map((m) => (
                      <div key={m.week} className="text-xs flex items-center justify-between text-on-surface-variant">
                        <span>W{m.week}: {m.title}</span>
                        <span className="text-outline text-[10px] font-mono">RFC</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-container-high/40 flex items-center justify-between mt-4">
                  <span className="text-xs text-outline font-mono">15% Take-rate</span>
                  <button
                    onClick={() => setSelectedProgram(prog)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-xs font-semibold text-on-surface transition-colors"
                  >
                    Inspect Blueprint
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Blueprint Inspection Modal */}
        {selectedProgram && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container-high space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{selectedProgram.title}</h3>
                  <p className="text-xs text-outline">{selectedProgram.format} • ₹{selectedProgram.priceInr.toLocaleString("en-IN")}</p>
                </div>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="p-1 rounded hover:bg-surface-container-high text-outline"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Mandatory Submission Deliverables:
                </span>
                {selectedProgram.milestones.map((m) => (
                  <div key={m.week} className="p-3 rounded-xl bg-surface-container-low text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-on-surface">
                      <span>Week {m.week}: {m.title}</span>
                      <span className="text-primary font-bold">14-Day Hold Gate</span>
                    </div>
                    <div className="text-outline text-[11px]">
                      Required deliverable: <strong className="text-on-surface">{m.deliverable}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="px-4 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    triggerToast(`Program template ${selectedProgram.id} settings saved.`);
                    setSelectedProgram(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
