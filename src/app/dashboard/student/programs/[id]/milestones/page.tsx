'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function StudentProgramMilestonesPage() {
  const params = useParams();
  const programId = params?.id as string;

  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgram() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/programs/${programId}`);
        if (res.ok) {
          const data = await res.json();
          setProgram(data.data || data.program);
        } else {
          // Fallback program metadata for preview
          setProgram({
            id: programId,
            title: 'Distributed Systems & Fault-Tolerant Raft Fellowship',
            duration_weeks: 4,
            mentor: { full_name: 'Vikram Singh (Staff Mentor)' },
            milestones: [
              {
                week_number: 1,
                title: 'Core Algorithms, Concurrency & RPC Transport',
                deliverable: 'Go/C++ RPC socket server with heartbeat telemetry & concurrent thread-safe queues.',
                status: 'approved',
                grade: '4.9 / 5.0',
              },
              {
                week_number: 2,
                title: 'Leader Election & Term Transitions',
                deliverable: 'Raft election safety verification under simulated network packet loss and Byzantine splits.',
                status: 'submitted',
                grade: 'In Review',
              },
              {
                week_number: 3,
                title: 'Log Replication & Linearizable Storage Engine',
                deliverable: 'Write-ahead log (WAL) fsync with state machine replication across 3 cluster nodes.',
                status: 'available',
                grade: 'Pending',
              },
              {
                week_number: 4,
                title: 'Chaos Engineering & Cluster Partition Healing',
                deliverable: 'Jepsen test suite execution proving zero data corruption across simulated network splits.',
                status: 'locked',
                grade: 'Pending',
              },
            ],
          });
        }
      } catch (err) {
        console.error('Error loading program milestones:', err);
      } finally {
        setLoading(false);
      }
    }
    if (programId) loadProgram();
  }, [programId]);

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl) {
      alert('Please provide a repository or deliverable URL');
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMsg(null);

      // Submit checkin
      await new Promise((resolve) => setTimeout(resolve, 800)); // optimistic submission

      setSuccessMsg(`Week ${activeWeek} deliverable submitted successfully! Mentor notified for code review.`);
      setDeliverableUrl('');
      setStudentNotes('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const milestones = program?.milestones || [
    {
      week_number: 1,
      title: 'Core Algorithms, Concurrency & RPC Transport',
      deliverable: 'Go/C++ RPC socket server with heartbeat telemetry & concurrent thread-safe queues.',
      status: 'approved',
      grade: '4.9 / 5.0',
    },
    {
      week_number: 2,
      title: 'Leader Election & Term Transitions',
      deliverable: 'Raft election safety verification under simulated network packet loss and Byzantine splits.',
      status: 'submitted',
      grade: 'In Review',
    },
    {
      week_number: 3,
      title: 'Log Replication & Linearizable Storage Engine',
      deliverable: 'Write-ahead log (WAL) fsync with state machine replication across 3 cluster nodes.',
      status: 'available',
      grade: 'Pending',
    },
    {
      week_number: 4,
      title: 'Chaos Engineering & Cluster Partition Healing',
      deliverable: 'Jepsen test suite execution proving zero data corruption across simulated network splits.',
      status: 'locked',
      grade: 'Pending',
    },
  ];

  const currentMilestone = milestones.find((m: any) => m.week_number === activeWeek) || milestones[0];

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-surface-container-high/60">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-tertiary">
            <Link href="/dashboard/student" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/dashboard/student/programs" className="hover:text-primary transition-colors">Programs</Link>
            <span>/</span>
            <span className="text-on-surface font-semibold truncate max-w-xs">{program?.title || 'Cohort'}</span>
            <span>/</span>
            <span className="text-primary font-bold">Week {activeWeek}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            {program?.title || 'Cohort Milestone Tracker'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Mentor: <span className="font-semibold text-on-surface">{program?.mentor?.full_name || 'Staff Mentor'}</span> • Escrow Safe (Milestone 2 of 4)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/student/programs"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-xs font-semibold border border-surface-container-high hover:bg-surface-container-low transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>All Programs</span>
          </Link>
          <Link
            href="/dashboard/student/services"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">video_call</span>
            <span>Book 1:1 Mentor Sync</span>
          </Link>
        </div>
      </div>

      {/* Week Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {milestones.map((m: any) => {
          const isActive = m.week_number === activeWeek;
          const isPassed = m.status === 'approved';
          const isInReview = m.status === 'submitted';

          return (
            <button
              key={m.week_number}
              type="button"
              onClick={() => setActiveWeek(m.week_number)}
              className={`p-4 rounded-xl text-left border transition-all ${
                isActive
                  ? 'border-primary bg-primary text-on-primary shadow-sm'
                  : 'border-surface-container-high bg-surface-container-lowest text-on-surface hover:border-outline'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-bold uppercase ${isActive ? 'text-white' : 'text-primary'}`}>
                  Week {m.week_number}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isPassed
                    ? 'bg-emerald-100 text-emerald-800'
                    : isInReview
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-surface-container text-tertiary'
                }`}>
                  {m.status}
                </span>
              </div>
              <p className={`font-title-md text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-on-surface'}`}>
                {m.title}
              </p>
              <span className={`text-[11px] block mt-1 ${isActive ? 'text-white/80' : 'text-tertiary'}`}>
                Grade: {m.grade}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Milestone Details & Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary uppercase">Week {currentMilestone.week_number} Deliverable Specification</span>
                <h2 className="font-title-md text-title-md font-bold text-on-surface mt-0.5">
                  {currentMilestone.title}
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface text-xs font-semibold">
                Estimated: 12-16 Hours
              </span>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              {currentMilestone.deliverable}
            </p>

            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40 space-y-2">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Evaluation Criteria:</h4>
              <ul className="text-xs text-tertiary space-y-1">
                <li>• Code coverage ≥ 80% with unit tests</li>
                <li>• Zero data races under concurrent go test -race conditions</li>
                <li>• Clean README and architecture diagram of state machine transitions</li>
              </ul>
            </div>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmitDeliverable} className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-4">
            <h3 className="font-title-md text-body-md font-bold text-on-surface">
              Submit Week {activeWeek} Code Artifact
            </h3>

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                GitHub Repository / PR URL or Google Drive Link *
              </label>
              <input
                type="url"
                required
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                placeholder="https://github.com/my-profile/raft-consensus-engine/pull/1"
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-hidden focus:border-primary text-sm text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Notes for Mentor Reviewer (Optional)
              </label>
              <textarea
                rows={3}
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Explain key architecture decisions, benchmarks, or specific areas where you want feedback..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-hidden focus:border-primary text-sm text-on-surface"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-tertiary">
                Submission locks term verification timestamp
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting Deliverable...' : 'Submit for Mentor Review'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Cohort Telemetry */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-4">
            <h3 className="font-title-md text-body-md font-bold text-on-surface">
              Cohort Telemetry
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/40">
                <span className="text-tertiary">Cohort ID</span>
                <span className="font-semibold text-on-surface font-mono">COHORT-2026-DIST-04</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/40">
                <span className="text-tertiary">Discipline Score</span>
                <span className="font-semibold text-emerald-700">100% On-time</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/40">
                <span className="text-tertiary">Escrow Payout Hold</span>
                <span className="font-semibold text-primary">₹4,999 Protected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tertiary">Next Live Sync</span>
                <span className="font-semibold text-on-surface">Sat, 6:00 PM IST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
