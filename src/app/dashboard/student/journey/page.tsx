'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { JourneyProgressResponse, JourneyStageItem, JourneyStageStatus } from '@/types/career';

export default function CareerJourneyPage() {
  const [journey, setJourney] = useState<JourneyProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | JourneyStageStatus>('all');
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  // Modal / Form state for manual tracking (Stage 7 & Stage 10)
  const [trackingModal, setTrackingModal] = useState<{
    open: boolean;
    stage: number;
    title: string;
    appsCount: number;
    notes: string;
    submitting: boolean;
    msg: string | null;
  }>({
    open: false,
    stage: 7,
    title: '',
    appsCount: 1,
    notes: '',
    submitting: false,
    msg: null,
  });

  const loadJourney = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/students/me/journey');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load career journey');
      }
      setJourney(json.data);
      // Automatically expand active stage by default
      if (json.data?.active_stage) {
        setExpandedStage(json.data.active_stage);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading journey roadmap');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJourney();
  }, []);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingModal((prev) => ({ ...prev, submitting: true, msg: null }));

    try {
      const payload: any = { notes: trackingModal.notes };
      if (trackingModal.stage === 7) {
        payload.applications_count = Number(trackingModal.appsCount);
      }

      const res = await fetch(`/api/v1/students/me/journey/${trackingModal.stage}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save tracking record');
      }

      // Reload journey and close modal
      await loadJourney(true);
      setTrackingModal((prev) => ({
        ...prev,
        submitting: false,
        open: false,
        notes: '',
        appsCount: 1,
      }));
    } catch (err: any) {
      setTrackingModal((prev) => ({
        ...prev,
        submitting: false,
        msg: err.message || 'Submission failed',
      }));
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-high rounded w-1/4"></div>
          <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
          <div className="h-36 bg-surface-container-high rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-32 bg-surface-container-high rounded-xl"></div>
            <div className="h-32 bg-surface-container-high rounded-xl"></div>
            <div className="h-32 bg-surface-container-high rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="p-8 rounded-xl bg-error-container text-on-error-container space-y-4 text-center">
          <span className="material-symbols-outlined text-4xl">error</span>
          <h2 className="text-xl font-bold">Failed to load Career Journey</h2>
          <p className="text-sm">{error || 'Unknown error occurred'}</p>
          <button
            onClick={() => loadJourney()}
            className="px-4 py-2 bg-error text-white rounded-lg font-semibold hover:opacity-90"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const completedCount = journey.stages.filter((s) => s.status === 'completed').length;
  const inProgressCount = journey.stages.filter((s) => s.status === 'in_progress').length;
  const availableCount = journey.stages.filter((s) => s.status === 'available').length;
  const lockedCount = journey.stages.filter((s) => s.status === 'locked').length;

  const filteredStages =
    filter === 'all'
      ? journey.stages
      : journey.stages.filter((s) => s.status === filter);

  const activeStageItem = journey.stages.find((s) => s.stage === journey.active_stage);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          <Link href="/dashboard/student" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">Career Journey Roadmap</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-bold text-[11px]">
            DAG ENGINE V1
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              Guided Career Journey &amp; Milestones
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
              Your deterministic 10-stage execution pathway from college baseline to Tier-1 product placement.
              Stages unlock sequentially as verified deliverables and prerequisite scores progress.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => loadJourney(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[18px] text-primary ${
                  refreshing ? 'animate-spin' : ''
                }`}
              >
                autorenew
              </span>
              <span>{refreshing ? 'Evaluating...' : 'Recalculate Roadmap'}</span>
            </button>
            <Link
              href="/dashboard/student/score"
              className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">speed</span>
              <span>View Score Card</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Target & Metric Banner */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline/10 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">conversion_path</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Active Pathway
              </span>
              <span className="px-2 py-0.2 rounded bg-surface-container-high text-on-surface text-[11px] font-medium">
                Stage {journey.active_stage} of 10
              </span>
            </div>
            <div className="text-base font-bold text-on-surface truncate">
              {activeStageItem?.name || 'Full-Stack Software Engineering'}
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">route</span>
              <span>Deterministic DAG Precedence Enforced</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md min-w-[240px]">
          <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
            <span className="text-on-surface">Overall Completion</span>
            <span className="text-primary font-bold">{journey.overall_progress_percentage}%</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${journey.overall_progress_percentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-on-surface-variant">
            <span>{completedCount} of 10 Stages Complete</span>
            <span>{lockedCount} Locked</span>
          </div>
        </div>

        {/* Action Link to AI Recommendations */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/student/ai"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-xs font-semibold text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">auto_awesome</span>
            <span>AI Opportunities</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Stages Flow (8 cols) + Info Dock (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: 10 Stages List */}
        <div className="xl:col-span-8 space-y-4">
          {/* Filter Pills */}
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline/10 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                All (10)
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'completed'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'in_progress'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'available'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Available ({availableCount})
              </button>
              <button
                onClick={() => setFilter('locked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'locked'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Locked ({lockedCount})
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Done
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Ready
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-outline/40"></span> Locked
              </span>
            </div>
          </div>

          {/* Stage Cards */}
          <div className="space-y-4">
            {filteredStages.map((stageItem) => {
              const isExpanded = expandedStage === stageItem.stage;
              const isLocked = stageItem.status === 'locked';
              const isCompleted = stageItem.status === 'completed';
              const isInProgress = stageItem.status === 'in_progress';
              const isAvailable = stageItem.status === 'available';

              return (
                <div
                  key={stageItem.stage}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isCompleted
                      ? 'bg-surface-container-lowest border-emerald-500/20 shadow-sm'
                      : isInProgress
                      ? 'bg-surface-container-lowest border-secondary shadow-md ring-1 ring-secondary/20'
                      : isAvailable
                      ? 'bg-surface-container-lowest border-primary/30 shadow-sm'
                      : 'bg-surface-container-low/50 border-outline/10 opacity-75'
                  }`}
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Icon Circle */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : isInProgress
                            ? 'bg-secondary/10 text-secondary'
                            : isAvailable
                            ? 'bg-primary/10 text-primary'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {isCompleted
                            ? 'check_circle'
                            : isInProgress
                            ? 'pending'
                            : isAvailable
                            ? 'play_circle'
                            : 'lock'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Stage {stageItem.stage < 10 ? `0${stageItem.stage}` : stageItem.stage}
                          </span>

                          {/* Status Badge */}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">verified</span>
                              Completed
                              {stageItem.completed_at && (
                                <span className="font-normal opacity-80">
                                  ({new Date(stageItem.completed_at).toLocaleDateString()})
                                </span>
                              )}
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                              In Progress
                            </span>
                          )}
                          {isAvailable && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">bolt</span>
                              Ready to Start
                            </span>
                          )}
                          {isLocked && (
                            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">lock</span>
                              Prerequisites Required
                            </span>
                          )}
                        </div>

                        <h3 className="text-base md:text-lg font-bold text-on-surface">
                          {stageItem.name}
                        </h3>
                        <p className="text-xs md:text-sm text-on-surface-variant max-w-2xl">
                          {stageItem.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Accordion */}
                    <button
                      onClick={() =>
                        setExpandedStage(isExpanded ? null : stageItem.stage)
                      }
                      className="self-end sm:self-start p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                      aria-label="Toggle details"
                    >
                      <span
                        className={`material-symbols-outlined transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                  </div>

                  {/* Expanded Stage Details */}
                  {isExpanded && (
                    <div className="border-t border-outline/10 bg-surface-container-low/40 p-5 space-y-4">
                      {/* Prerequisites info */}
                      {stageItem.prerequisites.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-on-surface-variant">
                            Prerequisites:
                          </span>
                          {stageItem.prerequisites.map((pStage) => {
                            const pItem = journey.stages.find((s) => s.stage === pStage);
                            const pDone = pItem?.status === 'completed';
                            return (
                              <span
                                key={pStage}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                                  pDone
                                    ? 'bg-emerald-500/10 text-emerald-700'
                                    : 'bg-surface-container-high text-on-surface-variant'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[12px]">
                                  {pDone ? 'check' : 'hourglass_empty'}
                                </span>
                                Stage {pStage}: {pItem?.name || `Stage ${pStage}`}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Notes / Progress details */}
                      {stageItem.notes && (
                        <div className="p-3 rounded-xl bg-surface-container-lowest text-xs text-on-surface-variant flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                          <div>
                            <span className="font-semibold text-on-surface">Tracker Progress: </span>
                            {stageItem.notes}
                          </div>
                        </div>
                      )}

                      {/* Actions strip */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-on-surface-variant">
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                              <span className="material-symbols-outlined text-[16px]">verified</span>
                              Deliverable verified via {stageItem.completion_source || 'system'}
                            </span>
                          )}
                          {isInProgress && (
                            <span>Currently active — complete recommended steps below</span>
                          )}
                          {isAvailable && (
                            <span>Prerequisites met — you can commence this stage now</span>
                          )}
                          {isLocked && (
                            <span>Locked by DAG dependency engine until prior stages finish</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Stage 7 Manual Tracker Button */}
                          {stageItem.stage === 7 && (isAvailable || isInProgress) && (
                            <button
                              onClick={() =>
                                setTrackingModal({
                                  open: true,
                                  stage: 7,
                                  title: 'Log Job Applications (Target: 10)',
                                  appsCount: 1,
                                  notes: '',
                                  submitting: false,
                                  msg: null,
                                })
                              }
                              className="px-3.5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">add_task</span>
                              <span>Log Applications</span>
                            </button>
                          )}

                          {/* Stage 10 Career Growth Button */}
                          {stageItem.stage === 10 && (isAvailable || isInProgress) && (
                            <button
                              onClick={() =>
                                setTrackingModal({
                                  open: true,
                                  stage: 10,
                                  title: 'Mark Career Growth & Promotion Complete',
                                  appsCount: 1,
                                  notes: '',
                                  submitting: false,
                                  msg: null,
                                })
                              }
                              className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                              <span>Mark Growth Milestone</span>
                            </button>
                          )}

                          {/* Recommended Service Link */}
                          {stageItem.recommended_service_slug && !isCompleted && !isLocked && (
                            <Link
                              href={`/services?slug=${stageItem.recommended_service_slug}`}
                              className="px-3.5 py-2 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                              <span>Book Prep Session</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Intelligence Dock & Milestones (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Active Milestone Card */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-[18px]">flag</span>
              <span>Next Milestone</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">
                {activeStageItem ? `Stage ${activeStageItem.stage}: ${activeStageItem.name}` : 'Journey Complete'}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {activeStageItem?.description}
              </p>
            </div>

            {activeStageItem?.recommended_service_slug && (
              <div className="pt-2">
                <Link
                  href={`/services?slug=${activeStageItem.recommended_service_slug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span>Book Recommended Session</span>
                </Link>
              </div>
            )}
          </div>

          {/* DAG Engine Rules Card */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-secondary">account_tree</span>
              <span>DAG Engine Rules</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              DreamX stages do not unlock arbitrarily. Under PRD Part 10.1 DAG requirements:
            </p>
            <ul className="text-xs text-on-surface-variant space-y-2 list-disc list-inside">
              <li>
                <strong className="text-on-surface">Stage 5</strong> requires Stage 2 (Resume) and Stage 3 (Technical).
              </li>
              <li>
                <strong className="text-on-surface">Stage 6</strong> requires Stage 2, Stage 3, and Stage 5.
              </li>
              <li>
                <strong className="text-on-surface">Stage 8 &amp; 9</strong> unlock after Stage 7 application milestone.
              </li>
            </ul>
          </div>

          {/* Quick Jump Links */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Quick Navigation
            </h4>
            <div className="space-y-2">
              <Link
                href="/dashboard/student/score"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-xs font-semibold text-on-surface"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">speed</span>
                  <span>Career Scorecard &amp; Radar</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
              </Link>
              <Link
                href="/dashboard/student/ai"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-xs font-semibold text-on-surface"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">auto_awesome</span>
                  <span>AI Recommendations Feed</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Tracking Modal (for Stage 7 or Stage 10) */}
      {trackingModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline/20 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface">{trackingModal.title}</h3>
              <button
                onClick={() => setTrackingModal((prev) => ({ ...prev, open: false }))}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {trackingModal.msg && (
              <div className="p-3 rounded-lg bg-error-container text-on-error-container text-xs">
                {trackingModal.msg}
              </div>
            )}

            <form onSubmit={handleTrackSubmit} className="space-y-4">
              {trackingModal.stage === 7 && (
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Number of Job Applications Submitted
                  </label>
                  <p className="text-[11px] text-on-surface-variant mb-2">
                    Submitting 10 or more completes Stage 7 and unlocks Stage 8 (Offer Evaluation).
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={trackingModal.appsCount}
                    onChange={(e) =>
                      setTrackingModal((prev) => ({
                        ...prev,
                        appsCount: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline/20 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Notes / Company List (Optional)
                </label>
                <textarea
                  rows={3}
                  value={trackingModal.notes}
                  onChange={(e) =>
                    setTrackingModal((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="e.g. Applied to Google SDE-2, Amazon SDE-1, Microsoft..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModal((prev) => ({ ...prev, open: false }))}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={trackingModal.submitting}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {trackingModal.submitting && (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                  )}
                  <span>Save Progress</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
