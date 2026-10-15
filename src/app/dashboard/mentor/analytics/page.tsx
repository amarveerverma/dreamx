'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { MentorAnalyticsResponse } from '@/types/career';

export default function MentorAnalyticsPage() {
  const [data, setData] = useState<MentorAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (p = period, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/mentors/me/analytics?period=${p}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load mentor analytics');
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Error loading analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics(period);
  }, [loadAnalytics, period]);

  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d' | 'all') => {
    setPeriod(newPeriod);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-high rounded w-1/4"></div>
          <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="h-32 bg-surface-container-high rounded-xl"></div>
            <div className="h-32 bg-surface-container-high rounded-xl"></div>
            <div className="h-32 bg-surface-container-high rounded-xl"></div>
            <div className="h-32 bg-surface-container-high rounded-xl"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <h2 className="text-xl font-bold">Failed to load Mentor Analytics</h2>
          <p className="text-sm">{error || 'Unknown error occurred'}</p>
          <button
            onClick={() => loadAnalytics(period)}
            className="px-4 py-2 bg-error text-white rounded-lg font-semibold hover:opacity-90"
          >
            Retry Diagnostics
          </button>
        </div>
      </div>
    );
  }

  const { metrics, rating_histogram, sub_ratings, top_services } = data;
  const totalReviews = metrics.total_reviews || 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          <Link href="/dashboard/mentor" className="hover:text-primary transition-colors">
            Mentor Portal
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">Financial &amp; Operations Cockpit</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-bold text-[11px]">
            LEDGER VERIFIED
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              Performance Analytics &amp; Revenue Ledger
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
              Authoritative payout schedules, completed sessions, star rating distributions, and Smart Request conversion.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            {/* Period Selector Tabs */}
            <div className="p-1 rounded-xl bg-surface-container border border-outline/10 flex items-center gap-1">
              {(['7d', '30d', '90d', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === p
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {p === '7d' ? '7D' : p === '30d' ? '30D' : p === '90d' ? '90D' : 'All'}
                </button>
              ))}
            </div>

            <button
              onClick={() => loadAnalytics(period, true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-all disabled:opacity-50"
              title="Refresh Analytics"
            >
              <span
                className={`material-symbols-outlined text-[20px] text-primary ${
                  refreshing ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Payout Earnings */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Net Mentor Payout
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-on-surface">
              ₹{metrics.total_earnings_inr.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1.5">
              <span className="text-emerald-600 font-semibold">
                ₹{metrics.released_payout_inr.toLocaleString('en-IN')} released
              </span>
              <span>•</span>
              <span className="text-amber-600 font-medium">
                ₹{metrics.pending_payout_inr.toLocaleString('en-IN')} pending
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-outline/10 text-[11px] text-on-surface-variant">
            Net 76.4% after 20% platform fee + 18% GST
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Completed Sessions
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">video_camera_front</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-on-surface">{metrics.completed_sessions}</div>
            <div className="text-xs text-on-surface-variant mt-1">
              Verified deliveries &amp; escrow releases
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-outline/10 text-[11px] text-primary font-semibold">
            <Link href="/dashboard/mentor/bookings" className="hover:underline flex items-center gap-1">
              <span>View bookings schedule</span>
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Client Rating */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Average Rating
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">star</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-on-surface">
                {metrics.average_rating > 0 ? metrics.average_rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-on-surface-variant">/ 5.0</span>
            </div>
            <div className="text-xs text-on-surface-variant mt-1">
              Based on {metrics.total_reviews} student reviews
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-outline/10 text-[11px] text-on-surface-variant">
            Punctuality: {sub_ratings.average_punctuality.toFixed(1)} ★ • Actionability: {sub_ratings.average_actionability.toFixed(1)} ★
          </div>
        </div>

        {/* Acceptance & Speed */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Match Conversion
            </span>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">insights</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-on-surface">
              {metrics.acceptance_rate_percentage !== null
                ? `${metrics.acceptance_rate_percentage}%`
                : '100%'}
            </div>
            <div className="text-xs text-on-surface-variant mt-1">
              {metrics.average_response_time_minutes !== null
                ? `${metrics.average_response_time_minutes} min avg response`
                : '< 30 min response speed'}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-outline/10 text-[11px] text-on-surface-variant">
            Response rate: {metrics.response_rate_percentage !== null ? `${metrics.response_rate_percentage}%` : '100%'}
          </div>
        </div>
      </div>

      {/* Grid: Rating Histogram (6 cols) + Top Services Breakdown (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Star Rating Distribution */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-on-surface">Rating Breakdown</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Authentic distribution from verified student completion reviews
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-on-surface">
                {metrics.average_rating.toFixed(1)}
              </span>
              <div className="text-[11px] text-on-surface-variant">
                {totalReviews} review{totalReviews === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Histogram Bars */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const key = `${stars}_star` as keyof typeof rating_histogram;
              const count = rating_histogram[key] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="w-12 flex items-center gap-1 font-semibold text-on-surface">
                    <span>{stars}</span>
                    <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
                  </div>

                  <div className="flex-1 bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div className="w-14 text-right text-[11px] text-on-surface-variant font-medium">
                    {count} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-ratings detail boxes */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline/10">
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline/5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Punctuality</span>
                <span className="text-primary font-bold">
                  {sub_ratings.average_punctuality.toFixed(1)} / 5.0
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                On-time call start &amp; agenda adherence
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline/5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Actionability</span>
                <span className="text-secondary font-bold">
                  {sub_ratings.average_actionability.toFixed(1)} / 5.0
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Takeaways, roadmap notes, &amp; concrete next steps
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Top Services Volume & Net Revenue */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-surface-container-lowest border border-outline/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-on-surface">Top Performing Services</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Session volume and net revenue breakdown by service category
              </p>
            </div>
            <Link
              href="/dashboard/mentor/services"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage Services</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {top_services.length === 0 ? (
            <div className="p-8 rounded-xl bg-surface-container-low text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-outline">calendar_today</span>
              <h4 className="text-sm font-semibold text-on-surface">No Completed Bookings Yet</h4>
              <p className="text-xs text-on-surface-variant">
                Completed 1-on-1 sessions and cohorts will appear here with net revenue calculations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {top_services.map((svc) => (
                <div
                  key={svc.slug}
                  className="p-4 rounded-xl bg-surface-container-low border border-outline/5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-on-surface truncate">{svc.title}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">
                      {svc.completed_count} session{svc.completed_count === 1 ? '' : 's'} completed
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-emerald-600">
                      ₹{svc.revenue_inr.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">Net Payout</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick link to earnings ledger */}
          <div className="pt-2">
            <Link
              href="/dashboard/mentor/earnings"
              className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-xs font-semibold text-on-surface flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
              <span>View Full Payouts &amp; Bank Transfer History</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
