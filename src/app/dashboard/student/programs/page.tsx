'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StudentProgramsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgramsData() {
      try {
        setLoading(true);
        setError(null);

        const [enrollRes, progsRes] = await Promise.allSettled([
          fetch('/api/v1/students/me/enrollments').then((r) => r.ok ? r.json() : null),
          fetch('/api/v1/programs').then((r) => r.ok ? r.json() : null),
        ]);

        if (enrollRes.status === 'fulfilled' && enrollRes.value?.data) {
          setEnrollments(enrollRes.value.data);
        }
        if (progsRes.status === 'fulfilled' && progsRes.value?.data) {
          setAvailablePrograms(progsRes.value.data);
        }
      } catch (err: any) {
        console.error('Error loading programs:', err);
        setError('Failed to load programs data');
      } finally {
        setLoading(false);
      }
    }

    loadProgramsData();
  }, []);

  if (loading) {
    return (
      <div className="py-6 space-y-6 max-w-7xl mx-auto">
        <div className="h-8 bg-surface-container-high rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-surface-container-high rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-surface-container-high/60">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-tertiary">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">Programs & Cohorts</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Structured Programs & Fellowships
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Multi-week structured cohorts with weekly milestone deliverables, mentor check-ins, and verifiable graduation credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/discover"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-hover shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            <span>Explore Fellowships</span>
          </Link>
        </div>
      </div>

      {/* Enrolled Cohorts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-title-md text-title-md font-bold text-on-surface">
            My Enrolled Cohorts ({enrollments.length})
          </h2>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-container-lowest border border-dashed border-surface-container-high space-y-3">
            <span className="material-symbols-outlined text-4xl text-tertiary">school</span>
            <h3 className="font-title-md text-body-md font-semibold text-on-surface">
              No active fellowship enrollments
            </h3>
            <p className="font-body-sm text-body-sm text-tertiary max-w-md mx-auto">
              Join a multi-week structured cohort to build production systems alongside Senior Mentors with automated milestone verification.
            </p>
            <a
              href="#catalog"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors shadow-xs"
            >
              <span>View Available Cohorts Below</span>
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enr) => {
              const program = enr.programs;
              const checkinsCount = enr.program_session_checkins?.length || 0;
              const durationWeeks = program?.duration_weeks || 4;
              const progressPct = Math.min(100, Math.round((checkinsCount / durationWeeks) * 100));

              return (
                <div
                  key={enr.id}
                  className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase">
                        {enr.status}
                      </span>
                      <span className="text-xs text-tertiary">
                        Started: {new Date(enr.cohort_start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-title-md text-body-md font-bold text-on-surface line-clamp-1">
                      {program?.title || 'Cohort Fellowship'}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-tertiary">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      <span>Mentor: {program?.profiles?.full_name || 'Staff Mentor'}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-tertiary">Milestones</span>
                        <span className="font-semibold text-primary">{checkinsCount} of {durationWeeks} Weeks</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-surface-container-high/50 flex items-center justify-between">
                    <Link
                      href={`/dashboard/student/programs/${program?.id || enr.id}/milestones`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Weekly Milestones</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Cohorts Catalog Section */}
      <div id="catalog" className="space-y-4 pt-4 border-t border-surface-container-high/60">
        <div>
          <h2 className="font-title-md text-title-md font-bold text-on-surface">
            Open Cohort Fellowships
          </h2>
          <p className="font-body-sm text-body-sm text-tertiary">
            Upcoming multi-week fellowships starting next Monday. Escrow payment protection holds fee until milestone deliverables are approved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fellowship 1 */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase">
                  4 Weeks
                </span>
                <span className="text-xs font-bold text-on-surface">₹4,999</span>
              </div>
              <h3 className="font-title-md text-body-md font-bold text-on-surface">
                Distributed Storage & Raft Consensus
              </h3>
              <p className="text-xs text-tertiary leading-relaxed">
                Engineer a production-grade fault-tolerant Raft consensus engine in Go. Implement leader election, log replication, and partition healing.
              </p>
              <div className="space-y-1 text-xs text-tertiary pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                  <span>4 Weekly code reviews with Staff Engineer</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                  <span>Verifiable graduation credential</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/discover"
                className="block text-center w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors"
              >
                Apply for Cohort
              </Link>
            </div>
          </div>

          {/* Fellowship 2 */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold uppercase">
                  6 Weeks
                </span>
                <span className="text-xs font-bold text-on-surface">₹7,499</span>
              </div>
              <h3 className="font-title-md text-body-md font-bold text-on-surface">
                Production AI Agentic Engineering
              </h3>
              <p className="text-xs text-tertiary leading-relaxed">
                Build end-to-end multi-agent coding workflows, MCP servers, vector embeddings, and real-time streaming LLM telemetry pipelines.
              </p>
              <div className="space-y-1 text-xs text-tertiary pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                  <span>6 Architecture teardowns & mock syncs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                  <span>Resume artifact certification</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/discover"
                className="block text-center w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-xs font-semibold hover:bg-secondary-container shadow-xs transition-colors"
              >
                Apply for Cohort
              </Link>
            </div>
          </div>

          {/* Fellowship 3 */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold uppercase">
                  4 Weeks
                </span>
                <span className="text-xs font-bold text-on-surface">₹3,999</span>
              </div>
              <h3 className="font-title-md text-body-md font-bold text-on-surface">
                FinTech Low-Latency Matching Engine
              </h3>
              <p className="text-xs text-tertiary leading-relaxed">
                Design a high-frequency order book and matching engine with lock-free ring buffers, sub-millisecond execution, and audit logging.
              </p>
              <div className="space-y-1 text-xs text-tertiary pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                  <span>Industry mentor from Tier-1 FinTech</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                  <span>Direct recruiter portfolio referral</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/discover"
                className="block text-center w-full py-2.5 rounded-xl bg-surface-container-lowest text-primary border border-surface-container-high font-label-md text-xs font-semibold hover:bg-surface-container-low shadow-xs transition-colors"
              >
                Apply for Cohort
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
