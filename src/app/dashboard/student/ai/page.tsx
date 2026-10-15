'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { RecommendationItem, RecommendationType } from '@/types/career';

const TYPE_CONFIG: Record<
  RecommendationType,
  { label: string; icon: string; bgClass: string; textClass: string }
> = {
  service: {
    label: '1-on-1 Service',
    icon: 'person_search',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
  },
  program: {
    label: 'Cohort Program',
    icon: 'groups',
    bgClass: 'bg-secondary/10',
    textClass: 'text-secondary',
  },
  membership: {
    label: 'Membership Pass',
    icon: 'workspace_premium',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-700',
  },
  action: {
    label: 'Required Action',
    icon: 'task_alt',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-700',
  },
  mentor: {
    label: 'Featured Mentor',
    icon: 'school',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-700',
  },
  journey_stage: {
    label: 'Journey Milestone',
    icon: 'conversion_path',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-700',
  },
};

export default function AIRecommendationsPage() {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadRecommendations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/ai/recommendations');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load recommendations');
      }
      setItems(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading AI recommendations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleDismiss = async (id: string, title: string) => {
    setDismissingId(id);
    try {
      const res = await fetch(`/api/v1/ai/recommendations/${id}/dismiss`, {
        method: 'PATCH',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to dismiss recommendation');
      }

      // Remove item from state
      setItems((prev) => prev.filter((item) => item.id !== id));
      setToastMsg(`"${title}" dismissed for 14 days`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error dismissing item');
    } finally {
      setDismissingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-high rounded w-1/4"></div>
          <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
          <div className="h-28 bg-surface-container-high rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-56 bg-surface-container-high rounded-xl"></div>
            <div className="h-56 bg-surface-container-high rounded-xl"></div>
            <div className="h-56 bg-surface-container-high rounded-xl"></div>
            <div className="h-56 bg-surface-container-high rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="p-8 rounded-xl bg-error-container text-on-error-container space-y-4 text-center">
          <span className="material-symbols-outlined text-4xl">error</span>
          <h2 className="text-xl font-bold">Failed to load AI Recommendations</h2>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => loadRecommendations()}
            className="px-4 py-2 bg-error text-white rounded-lg font-semibold hover:opacity-90"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const filteredItems =
    selectedType === 'all'
      ? items
      : items.filter((item) => item.type === selectedType);

  const highestPriorityItem = items[0];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-surface-container-highest border border-outline/20 text-on-surface text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          <Link href="/dashboard/student" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">AI Intelligence Engine</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-bold text-[11px]">
            V1 DETERMINISTIC
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              Career Recommendations &amp; Action Plan
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
              Deterministic rule-based recommendations (REC-01 to REC-07) mapped strictly to your Career Readiness Score,
              active journey stage, and verified deliverables.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => loadRecommendations(true)}
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
              <span>{refreshing ? 'Evaluating Rules...' : 'Re-evaluate Rules'}</span>
            </button>
            <Link
              href="/dashboard/student/journey"
              className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">conversion_path</span>
              <span>View 10-Stage Journey</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric & Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Active Opportunities
            </span>
            <div className="text-2xl font-bold text-on-surface mt-1">{items.length}</div>
            <span className="text-[11px] text-on-surface-variant">Zero hallucinated actions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Top Priority Focus
            </span>
            <div className="text-base font-bold text-on-surface mt-1 truncate max-w-[200px]">
              {highestPriorityItem?.title || 'All Core Areas Optimal'}
            </div>
            <span className="text-[11px] text-secondary font-medium">
              {highestPriorityItem ? `Score Lift Priority: ${highestPriorityItem.priority}` : 'None pending'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">priority_high</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Suppression SLA
            </span>
            <div className="text-base font-bold text-on-surface mt-1">14-Day Dismissal Window</div>
            <span className="text-[11px] text-on-surface-variant">Resurfaces only if scores change</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">shield</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Recommendations Grid + Right Dock */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recommendations Cards (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'all'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              All Types ({items.length})
            </button>
            <button
              onClick={() => setSelectedType('service')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'service'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Services ({items.filter((i) => i.type === 'service').length})
            </button>
            <button
              onClick={() => setSelectedType('program')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'program'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Programs ({items.filter((i) => i.type === 'program').length})
            </button>
            <button
              onClick={() => setSelectedType('action')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'action'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Actions ({items.filter((i) => i.type === 'action').length})
            </button>
          </div>

          {/* Cards List */}
          {filteredItems.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface-container-lowest border border-outline/10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">task_alt</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">All Opportunities Optimized!</h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                You have addressed or dismissed all active recommendations in this category. Complete mock interviews or log applications to generate fresh insights.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/student/score"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors inline-block"
                >
                  Check Readiness Scorecard
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((rec) => {
                const config = TYPE_CONFIG[rec.type] || TYPE_CONFIG.service;
                const isDismissing = dismissingId === rec.id;

                return (
                  <div
                    key={rec.id}
                    className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${config.bgClass} ${config.textClass}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">{config.icon}</span>
                          <span>{config.label}</span>
                        </span>

                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                          Priority {rec.priority}
                        </span>
                      </div>

                      {/* Title & Target */}
                      <div>
                        <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                          {rec.title}
                        </h3>
                        <div className="text-xs font-semibold text-primary mt-0.5">
                          {rec.target_name}
                        </div>
                      </div>

                      {/* Transparent Reason */}
                      <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant border border-outline/5 leading-relaxed">
                        <div className="font-semibold text-on-surface mb-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-secondary">
                            psychology
                          </span>
                          <span>Diagnostic Justification:</span>
                        </div>
                        {rec.reason}
                      </div>
                    </div>

                    {/* Bottom Actions & Price */}
                    <div className="pt-3 border-t border-outline/10 flex items-center justify-between gap-3">
                      <div>
                        {rec.price_formatted ? (
                          <div className="text-sm font-bold text-on-surface">
                            {rec.price_formatted}
                          </div>
                        ) : (
                          <div className="text-xs text-on-surface-variant">Included in Tier</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Dismiss button */}
                        <button
                          onClick={() => handleDismiss(rec.id, rec.title)}
                          disabled={isDismissing}
                          className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container text-xs transition-colors disabled:opacity-50"
                          title="Dismiss for 14 days"
                          aria-label="Dismiss recommendation"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isDismissing ? 'progress_activity' : 'close'}
                          </span>
                        </button>

                        {/* CTA Link */}
                        <Link
                          href={rec.action_url}
                          className="px-3.5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>{rec.action_label}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Engine Rules & Explanations (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Rulebook Explainer */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-[18px]">rule</span>
              <span>V1 Deterministic Rulebook</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every recommendation originates strictly from approved PRD Part 9.2 logic:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline/5 space-y-1">
                <div className="font-bold text-on-surface">REC-01: Low Resume Score</div>
                <div className="text-on-surface-variant text-[11px]">
                  Triggers <em>Resume Review</em> if ATS &amp; Resume dimension is below 3.0 / 5.0.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline/5 space-y-1">
                <div className="font-bold text-on-surface">REC-02: Low Technical Depth</div>
                <div className="text-on-surface-variant text-[11px]">
                  Triggers <em>Coding &amp; DSA Prep</em> if Technical dimension is below 3.0 / 5.0.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline/5 space-y-1">
                <div className="font-bold text-on-surface">REC-03: Low Interview Score</div>
                <div className="text-on-surface-variant text-[11px]">
                  Triggers <em>Mock Interview</em> if Live Session dimension is below 3.0 / 5.0.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline/5 space-y-1">
                <div className="font-bold text-on-surface">REC-04 &amp; 05: Journey Stage Sync</div>
                <div className="text-on-surface-variant text-[11px]">
                  Triggers <em>Career Roadmap</em> or <em>Job Tracker</em> when stages 4 or 7 become active.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline/5 space-y-1">
                <div className="font-bold text-on-surface">REC-06: High Preparedness</div>
                <div className="text-on-surface-variant text-[11px]">
                  Triggers <em>Salary Negotiation</em> when overall score reaches &ge; 4.0 / 5.0.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Card */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Connected Modules
            </h4>
            <div className="space-y-2">
              <Link
                href="/dashboard/student/score"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-xs font-semibold text-on-surface"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">speed</span>
                  <span>Career Readiness Score</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
              </Link>
              <Link
                href="/dashboard/student/journey"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-xs font-semibold text-on-surface"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">conversion_path</span>
                  <span>10-Stage Journey Roadmap</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
