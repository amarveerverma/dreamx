'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CareerDimension, CareerScoreResponse } from '@/types/career';

const DIMENSION_CONFIG: Record<
  CareerDimension,
  { label: string; icon: string; category: string }
> = {
  resume: { label: 'Resume & ATS Score', icon: 'description', category: 'Document' },
  technical: { label: 'Technical Depth', icon: 'code', category: 'Technical' },
  interview: { label: 'Interview Readiness', icon: 'videocam', category: 'Live Session' },
  communication: { label: 'Communication & STAR', icon: 'record_voice_over', category: 'Behavioral' },
  career_planning: { label: 'Career Planning', icon: 'explore', category: 'Strategy' },
  linkedin: { label: 'LinkedIn Optimization', icon: 'share', category: 'Brand' },
  portfolio: { label: 'Portfolio Teardown', icon: 'folder_special', category: 'Artifacts' },
  confidence: { label: 'Placement Confidence', icon: 'sentiment_very_satisfied', category: 'Self-Report' },
};

export default function CareerScorePage() {
  const [data, setData] = useState<CareerScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScore = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/students/me/score');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load score');
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Error loading career score');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadScore();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-high rounded w-1/4"></div>
          <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
          <div className="h-64 bg-surface-container-high rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 bg-surface-container-high rounded-xl"></div>
            <div className="h-80 bg-surface-container-high rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="p-8 rounded-xl bg-error-container text-on-error-container space-y-4 text-center">
          <span className="material-symbols-outlined text-4xl">error</span>
          <h2 className="text-xl font-bold">Failed to load Career Score</h2>
          <p className="text-sm">{error || 'Unknown error occurred'}</p>
          <button
            onClick={() => loadScore()}
            className="px-4 py-2 bg-error text-white rounded-lg font-semibold hover:opacity-90"
          >
            Retry Diagnostics
          </button>
        </div>
      </div>
    );
  }

  // --- Dynamic Radar Chart Math ---
  const cx = 200;
  const cy = 180;
  const maxR = 130;

  // Angles for 8 dimensions in clock order starting from top (-pi/2)
  const dimensionKeys: CareerDimension[] = [
    'resume',
    'technical',
    'interview',
    'communication',
    'career_planning',
    'linkedin',
    'portfolio',
    'confidence',
  ];

  const getCoordinates = (index: number, score: number) => {
    const angle = -Math.PI / 2 + index * (Math.PI / 4);
    const r = Math.min(maxR, Math.max(10, (score / 5.0) * maxR));
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const getRingPoints = (ringLevel: number) => {
    // ringLevel 1 to 5
    return dimensionKeys
      .map((_, i) => {
        const angle = -Math.PI / 2 + i * (Math.PI / 4);
        const r = (ringLevel / 5.0) * maxR;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      })
      .join(' ');
  };

  const currentPolygonPoints = dimensionKeys
    .map((key, i) => {
      const dim = data.dimensions[key];
      const coords = getCoordinates(i, dim?.score || 0);
      return `${coords.x},${coords.y}`;
    })
    .join(' ');

  // Radial Gauge Math
  const circumference = 2 * Math.PI * 50; // r=50 -> 314.159
  const progressRatio = Math.min(1.0, Math.max(0, data.overall_score / 5.0));
  const dashOffset = circumference * (1 - progressRatio);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              PRD 11.1 Algorithmic Diagnostics
            </span>
            <span className="text-xs text-outline">
              • Synced {new Date(data.calculated_at).toLocaleTimeString()}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Career Readiness Score</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            8-dimension competency matrix synthesized from diagnostic deliverables and verified mentor rubrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadScore(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container-high text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <span className={`material-symbols-outlined text-[18px] ${refreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh Diagnostics</span>
          </button>
          <Link
            href="/dashboard/student/journey"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            <span>View Guided Journey</span>
          </Link>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest border border-surface-container p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Radial Readout */}
          <div className="lg:col-span-4 flex items-center gap-6">
            <div className="relative flex-shrink-0 w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  className="text-surface-container"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                <circle
                  className="text-primary transition-all duration-1000 ease-out"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl md:text-4xl font-extrabold text-on-surface leading-none">
                  {data.displayed_score}
                </span>
                <span className="text-xs text-on-surface-variant font-semibold mt-0.5">/ 5.0 MAX</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
                {data.tier_label}
              </span>
              <h2 className="text-xl font-bold text-on-surface">Overall Readiness</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Aggregated across 8 weighted dimensions. Normalized on a 0.0–5.0 competency scale.
              </p>
            </div>
          </div>

          {/* KPI Mini-Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold uppercase">
                <span>Placement Benchmark</span>
                <span className="material-symbols-outlined text-[18px] text-primary">flag</span>
              </div>
              <div className="text-base font-bold text-on-surface mt-2">Target ≥ 4.0</div>
              <div className="text-xs text-on-surface-variant mt-1">
                {data.overall_score >= 4.0 ? (
                  <span className="text-secondary font-semibold">Benchmark Satisfied</span>
                ) : (
                  <span>{(4.0 - data.overall_score).toFixed(1)} points to reach target</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold uppercase">
                <span>Cohort Percentile</span>
                <span className="material-symbols-outlined text-[18px] text-secondary">social_leaderboard</span>
              </div>
              <div className="text-base font-bold text-on-surface mt-2">
                {data.cohort_benchmark
                  ? `Top ${100 - data.cohort_benchmark.percentile}%`
                  : 'Diagnostic Phase'}
              </div>
              <div className="text-xs text-on-surface-variant mt-1">
                {data.cohort_benchmark
                  ? `${data.cohort_benchmark.total_peers} peers benchmarked`
                  : 'Unlocks with platform cohorts'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold uppercase">
                <span>Legacy Index</span>
                <span className="material-symbols-outlined text-[18px] text-tertiary">speed</span>
              </div>
              <div className="text-base font-bold text-on-surface mt-2">
                {Math.round(data.overall_score * 200)} / 1000
              </div>
              <div className="text-xs text-on-surface-variant mt-1">Synchronized with Profile</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytical Grid: Radar + Opportunity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-surface-container-lowest border border-surface-container p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-on-surface">8-Dimension Competency Radar</h3>
              <p className="text-xs text-on-surface-variant">Concentric polygons represent score bands 1.0 to 5.0</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-surface-container text-on-surface-variant">
              Pure SVG Engine
            </span>
          </div>

          <div className="relative w-full aspect-[4/3] max-h-[360px] flex items-center justify-center my-auto">
            <svg className="w-full h-full max-w-[420px]" viewBox="0 0 400 360">
              <defs>
                <linearGradient id="radarFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4648d4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6b38d4" stopOpacity="0.20" />
                </linearGradient>
              </defs>

              {/* Concentric rings 1 to 5 */}
              {[1, 2, 3, 4, 5].map((lvl) => (
                <polygon
                  key={lvl}
                  fill="none"
                  points={getRingPoints(lvl)}
                  stroke="#eaedff"
                  strokeWidth={lvl === 4 ? 1.5 : 1}
                  strokeDasharray={lvl === 4 ? '3 3' : undefined}
                />
              ))}

              {/* Spokes */}
              {dimensionKeys.map((_, i) => {
                const angle = -Math.PI / 2 + i * (Math.PI / 4);
                const x2 = cx + maxR * Math.cos(angle);
                const y2 = cy + maxR * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={x2}
                    y2={y2}
                    stroke="#eaedff"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Target Boundary Polygon (Level 4.0 = 80%) */}
              <polygon
                fill="none"
                points={getRingPoints(4)}
                stroke="#6b38d4"
                strokeWidth="1.5"
                strokeOpacity="0.25"
              />

              {/* Active Student Competency Polygon */}
              <polygon
                fill="url(#radarFillGrad)"
                points={currentPolygonPoints}
                stroke="#4648d4"
                strokeWidth="2.5"
              />

              {/* Data Vertices Dots */}
              {dimensionKeys.map((key, i) => {
                const dim = data.dimensions[key];
                const coords = getCoordinates(i, dim?.score || 0);
                return (
                  <circle
                    key={key}
                    cx={coords.x}
                    cy={coords.y}
                    r="4"
                    fill="#4648d4"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-on-surface-variant font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary/40 border border-primary"></span>
              <span>Your Current Competency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded border border-dashed border-secondary"></span>
              <span>4.0 Target Benchmark</span>
            </div>
          </div>
        </div>

        {/* AI Opportunity & Trend (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* AI Opportunity Card */}
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              <span className="text-xs font-bold uppercase tracking-wider">Top Growth Opportunity</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-on-surface capitalize">
                Improve {data.ai_opportunity.weakest_dimension.replace('_', ' ')}
              </h4>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                {data.ai_opportunity.opportunity_text}
              </p>
            </div>
            <Link
              href={`/services/${data.ai_opportunity.suggested_service_slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
            >
              <span>Book Diagnostic Service</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* 90-Day Trend Chart */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-on-surface">Score Progression (Last 90 Days)</h4>
                <p className="text-xs text-on-surface-variant">Longitudinal diagnostic snapshots</p>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">trending_up</span>
            </div>

            {data.history && data.history.length > 0 ? (
              <div className="space-y-3 pt-2">
                {data.history.slice(-4).map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-surface-container-low last:border-none">
                    <span className="text-on-surface-variant">
                      {new Date(h.calculated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-bold text-on-surface">{h.overall_score.toFixed(2)} / 5.0</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-on-surface-variant">
                Initial diagnostic baseline established. Future session updates will track here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8 Dimension Breakdown Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface">Dimension Competency Inventory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dimensionKeys.map((key) => {
            const dim = data.dimensions[key];
            const cfg = DIMENSION_CONFIG[key];
            const pct = Math.min(100, Math.round((dim.score / 5.0) * 100));

            return (
              <div
                key={key}
                className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container flex flex-col justify-between space-y-3 shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">{cfg.icon}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      dim.has_evidence
                        ? 'bg-secondary/10 text-secondary border border-secondary/20'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {dim.status_label}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-on-surface">{cfg.label}</h4>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold text-on-surface">{dim.score.toFixed(1)}</span>
                    <span className="text-xs text-on-surface-variant">Weight: {Math.round(dim.weight * 100)}%</span>
                  </div>
                </div>

                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${dim.score >= 4.0 ? 'bg-secondary' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
